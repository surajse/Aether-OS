/**
 * Example: Programmatic Autonomous Agent Goal Execution
 * Run with: npx tsx examples/programmatic-agent.ts
 */

import { AetherNode } from "../packages/cli/src/index.js";
import * as process from "node:process";

async function run() {
  console.log("🌌 Initializing Sovereign AetherNode programmatically...");

  const node = new AetherNode({
    workspaceDir: process.cwd()
  });

  // Subscribe to real-time AG-UI streaming events
  node.orchestrator.getRuntime().subscribe((event) => {
    switch (event.type) {
      case "THOUGHT_CHUNK":
        process.stdout.write(`\x1b[36m[Thought]\x1b[0m ${event.chunk}\n`);
        break;
      case "TOOL_INVOCATION":
        console.log(`\x1b[33m[Tool Call]\x1b[0m ${event.tool} with args:`, event.args);
        break;
      case "LIFECYCLE":
        console.log(`\x1b[35m[Lifecycle]\x1b[0m Agent state transitioned to: ${event.state}`);
        break;
    }
  });

  console.log("\n🚀 Dispatching Autonomous Goal...");
  const result = await node.runGoal("Inspect workspace health and summarize available tools");

  console.log("\n✅ Execution Finished:");
  console.log(JSON.stringify(result, null, 2));
}

run().catch(console.error);
