import { StateGraph, END, START } from "@langchain/langgraph";
import { DebateState } from "./state";
import { bullNode, bearNode, judgeNode, moderatorNode } from "./nodes";

// 6 turns = 3 exchanges (Bull opens, Bear challenges, Bull defends, Bear counters, Bull closes, Bear closes)
const MAX_TURNS = 6; 

// Build the Graph
const workflow = new StateGraph(DebateState)
  .addNode("bull", bullNode)
  .addNode("bear", bearNode)
  .addNode("judge", judgeNode)
  .addNode("moderator", moderatorNode)

  .addEdge(START, "bull")
  
  .addConditionalEdges("bull", (state) => {
    if (state.messages.length >= MAX_TURNS) return "judge";
    return "bear";
  })

  .addConditionalEdges("bear", (state) => {
    if (state.messages.length >= MAX_TURNS) return "judge";
    return "bull";
  })

  // Judge delivers verdict, then Moderator provides truth-seeking analysis
  .addEdge("judge", "moderator")
  .addEdge("moderator", END);

export const debateGraph = workflow.compile();

