import { debateGraph } from "./src/graph/workflow";
import * as dotenv from 'dotenv';
dotenv.config();

async function main() {
  console.log("🥊 Starting Debate Club Engine...");
  
  // The User (You) picks a chapter from your markdown file to debate
  const topic = "Opportunity Validation"; 

  const stream = await debateGraph.stream({
    topic: topic,
    messages: [], // History starts empty
  });

  for await (const event of stream) {
    const nodeName = Object.keys(event)[0];
    const data = event[nodeName];

    if (nodeName === "bull") {
      console.log(`\n🟢 BULL (${topic}):`);
      console.log(data.messages[0].content);
    } 
    else if (nodeName === "bear") {
      console.log(`\n🔴 BEAR (${topic}):`);
      console.log(data.messages[0].content);
    }
    else if (nodeName === "judge") {
      console.log("\n👨‍⚖️ VERDICT:");
      console.log(JSON.stringify(data.verdict, null, 2));
    }
  }
}

main().catch(console.error);
