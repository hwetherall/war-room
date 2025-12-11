import { BaseMessage } from "@langchain/core/messages";
import { Annotation } from "@langchain/langgraph";

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
});

