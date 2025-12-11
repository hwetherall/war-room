import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import { fetchChapterContent } from "../utils/supabase";
import { z } from "zod";
import { DebateState } from "./state";

// Initialize OpenRouter Models
const createModel = (modelName: string) => {
  return new ChatOpenAI({
    modelName: modelName,
    apiKey: process.env.OPENROUTER_API_KEY,
    configuration: {
      baseURL: "https://openrouter.ai/api/v1",
    },
    temperature: 0.7,
  });
};

// The core question we're debating for Opportunity Validation
const CORE_QUESTION = `What is the need and has it been validated?
This confirms that a real, validated, and sufficiently urgent customer need exists and that the venture has identified a clear, focused opportunity to serve that need. We're determining whether there is evidence of "problem-solution fit," early traction from real customers, and favorable market timing.`;

// Get the right prompt based on debate round
const getRoundContext = (messageCount: number) => {
  const round = Math.floor(messageCount / 2) + 1;
  
  if (round === 1) {
    return {
      bull: "opening",
      bear: "challenge",
    };
  } else if (round === 2) {
    return {
      bull: "defense",
      bear: "counter",
    };
  } else {
    return {
      bull: "closing",
      bear: "closing",
    };
  }
};

// --- AGENT 1: THE BULL (The Visionary) ---
export const bullNode = async (state: typeof DebateState.State) => {
  const model = createModel("anthropic/claude-sonnet-4.5");
  
  let context = state.context;
  if (!context) {
    context = await fetchChapterContent(state.topic);
  }

  const roundContext = getRoundContext(state.messages.length);
  const isOpening = roundContext.bull === "opening";
  const isDefense = roundContext.bull === "defense";

  let task = "";
  if (isOpening) {
    task = "Make your opening case for why this opportunity is validated.";
  } else if (isDefense) {
    task = "Defend against the Bear's challenge.";
  } else {
    task = "Make your closing argument.";
  }

  const systemPrompt = `You are THE BULL, an optimistic VC partner. You speak in confident, flowing sentences. You NEVER use bullet points or lists. You talk like a real person making a pitch in a partner meeting.

Context: ${CORE_QUESTION}`;

  const userPrompt = `${task}

IMPORTANT: Respond in exactly 2-3 conversational sentences. No lists. No headers. Just speak directly and confidently. Use **bold** for one or two key terms only. Start talking now:`;

  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    new SystemMessage(`SOURCE MATERIAL FROM THE INVESTMENT MEMO:\n${context}`),
    ...state.messages,
    new HumanMessage(userPrompt),
  ]);

  return { 
    messages: [response],
    context: context
  };
};

// --- AGENT 2: THE BEAR (The Skeptic) ---
export const bearNode = async (state: typeof DebateState.State) => {
  const model = createModel("anthropic/claude-sonnet-4.5");
  
  const roundContext = getRoundContext(state.messages.length - 1);
  const isChallenge = roundContext.bear === "challenge";
  const isCounter = roundContext.bear === "counter";

  let task = "";
  if (isChallenge) {
    task = "Push back on the Bull's weakest argument.";
  } else if (isCounter) {
    task = "Press harder—the Bull's defense has holes.";
  } else {
    task = "Deliver your closing skepticism.";
  }

  const systemPrompt = `You are THE BEAR, a skeptical VC partner. You speak in confident, flowing sentences. You NEVER use bullet points or lists. You talk like a real person making a counterargument in a partner meeting.

Context: ${CORE_QUESTION}`;

  const userPrompt = `${task}

IMPORTANT: Respond in exactly 2-3 conversational sentences. No lists. No headers. Just speak directly and skeptically. Use **bold** for one or two key terms only. Start talking now:`;

  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    new SystemMessage(`SOURCE MATERIAL FROM THE INVESTMENT MEMO:\n${state.context}`),
    ...state.messages,
    new HumanMessage(userPrompt),
  ]);

  return { messages: [response] };
};

// --- AGENT 3: THE JUDGE (The Decision Maker) ---
export const judgeNode = async (state: typeof DebateState.State) => {
  const model = createModel("anthropic/claude-sonnet-4.5").withStructuredOutput(
    z.object({
      winner: z.enum(["Bull", "Bear", "Tie"]),
      confidence_score: z.number().min(0).max(10),
      reasoning: z.string(),
      key_takeaway: z.string(),
    })
  );

  const systemPrompt = `You are the Managing Partner of the VC firm, deciding on this deal.

THE QUESTION: ${CORE_QUESTION}

You've heard the Bull and Bear debate. Decide who made the stronger case.

CONSIDER:
- Is the customer need specific and acute?
- Is there concrete evidence of demand (LOIs, pilots, contracts) vs just "interest"?
- Is the target customer clearly defined?
- Is the timing argument compelling?

Write your reasoning as flowing prose—no bullet points. 2-3 sentences for reasoning, 1 sentence for key takeaway.`;

  const response = await model.invoke([
    new SystemMessage(systemPrompt),
    ...state.messages,
  ]);

  return { verdict: response };
};

