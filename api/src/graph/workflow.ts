import { StateGraph, END, START } from "@langchain/langgraph";
import { DebateState } from "./state";
import { bullNode, bearNode, judgeNode } from "./nodes";

// 6 turns = 3 exchanges (Bull opens, Bear challenges, Bull defends, Bear counters, Bull closes, Bear closes)
const MAX_TURNS = 6; 

// Build the Graph
const workflow = new StateGraph(DebateState)
  .addNode("bull", bullNode)
  .addNode("bear", bearNode)
  .addNode("judge", judgeNode)

  .addEdge(START, "bull")
  
  .addConditionalEdges("bull", (state) => {
    if (state.messages.length >= MAX_TURNS) return "judge";
    return "bear";
  })

  .addConditionalEdges("bear", (state) => {
    if (state.messages.length >= MAX_TURNS) return "judge";
    return "bull";
  })

  .addEdge("judge", END);

export const debateGraph = workflow.compile();

