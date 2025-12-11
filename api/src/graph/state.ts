import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";

// Type for each analyzed point in the moderator's analysis
export interface DebatePoint {
  point_number: number;
  point_title: string;
  bull_case: string;
  bear_case: string;
  winner: "Bull" | "Bear" | "Tie";
  rationale: string;
}

// Type for the full moderator analysis
export interface ModeratorAnalysis {
  points: DebatePoint[];
  bull_wins: number;
  bear_wins: number;
  ties: number;
  closing_notes: string;
}

// The "State" of the debate.
// This object is passed between every agent node.
export const DebateState = Annotation.Root({
  // The topic or chapter currently being debated
  topic: Annotation<string>,
  
  // The retrieved content from the memo
  context: Annotation<string>,
  
  // The chat history between Bull, Bear, and Judge
  messages: Annotation<BaseMessage[]>({
    reducer: (x, y) => x.concat(y),
  }),
  
  // Structured output from the Judge
  verdict: Annotation<any>,
  
  // Structured output from the Moderator's truth-seeking analysis
  moderator_analysis: Annotation<ModeratorAnalysis | null>,
});

