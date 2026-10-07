#!/usr/bin/env node

import { AetherNode } from "../dist/index.js";
import * as process from "node:process";

const args = process.argv.slice(2);
const command = args[0] || "help";

async function main() {
  const node = new AetherNode({
    workspaceDir: process.cwd()
  });

  switch (command) {
    case "start": {
      const port = Number(args[1]) || 4099;
      await node.start(port);
      console.log(`\n[AetherOS] Sovereign Node active on http://localhost:${port}`);
      console.log(`[AetherOS] REST Health:  http://localhost:${port}/health`);
      console.log(`[AetherOS] Skills API:   http://localhost:${port}/api/skills`);
      console.log(`[AetherOS] Event Stream: http://localhost:${port}/api/agents/default-agent/stream`);
      console.log("\nPress Ctrl+C to terminate node.");
      break;
    }

    case "skills": {
      const tools = node.mcp.getLLMTools();
      console.log("\n================================================================================");
      console.log("   🌌 AETHER-OS (OPENDOTS) — ACTIVE SOVEREIGN SKILLS & TOOLS");
      console.log("================================================================================\n");
      for (const t of tools) {
        console.log(`🔹 \x1b[32m${t.name.padEnd(26)}\x1b[0m : ${t.description}`);
      }
      console.log(`\nTotal Active Tools: ${tools.length}`);
      process.exit(0);
      break;
    }

    case "review": {
      const targetFile = args[1];
      if (!targetFile) {
        console.error("Usage: aether review <filepath>");
        process.exit(1);
      }
      console.log(`\n[AetherOS] Running Sovereign Code Reviewer on: ${targetFile}...`);
      const res = await node.mcp.executeTool("skill_code_reviewer", { path: targetFile });
      console.log("\nReview Verdict:\n", JSON.stringify(res.output, null, 2));
      process.exit(0);
      break;
    }

    case "brief": {
      console.log("\n[AetherOS] Generating Morning Executive Brief...");
      const res = await node.mcp.executeTool("skill_morning_brief", {});
      console.log("\nExecutive Briefing:\n", JSON.stringify(res.output, null, 2));
      process.exit(0);
      break;
    }

    case "audit": {
      console.log("\n[AetherOS] Auditing workspace dependencies...");
      const res = await node.mcp.executeTool("skill_dependency_auditor", {});
      console.log("\nSupply Chain Audit:\n", JSON.stringify(res.output, null, 2));
      process.exit(0);
      break;
    }

    case "status": {
      console.log("\n================================================================================");
      console.log("   🌌 AETHER-OS (OPENDOTS) — SYSTEM STATUS");
      console.log("================================================================================\n");
      console.log(`• Workspace:          ${node.sandbox.getRootDir()}`);
      console.log(`• Active State:       ${node.orchestrator.getRuntime().getState()}`);
      console.log(`• Invariants:         ${node.constitutionalAnchor.getInvariants().length} active`);
      console.log(`• Knowledge Triples:  ${node.knowledgeGraph.getActiveFacts().length} facts`);
      console.log(`• Registered Tools:   ${node.mcp.getLLMTools().length} tools`);
      process.exit(0);
      break;
    }

    case "run": {
      const goal = args.slice(1).join(" ") || "Run repository diagnostics";
      console.log(`\n[AetherOS] Executing goal: "${goal}"`);

      // Subscribe to real-time thought events
      node.orchestrator.getRuntime().subscribe((evt) => {
        if (evt.type === "THOUGHT_CHUNK") {
          console.log(`\x1b[36m[Aether Thought]\x1b[0m ${evt.chunk}`);
        } else if (evt.type === "TOOL_INVOCATION") {
          console.log(`\x1b[33m[Tool Invocation]\x1b[0m ${evt.tool}`);
        }
      });

      const res = await node.runGoal(goal);
      console.log("\n[AetherOS] Execution Result:", JSON.stringify(res, null, 2));
      process.exit(res.success ? 0 : 1);
      break;
    }

    default: {
      console.log(`
================================================================================
   🌌 AETHER-OS (OPENDOTS) — SOVEREIGN AGENT CLI
================================================================================

Usage:
  node packages/cli/bin/aether.js <command> [arguments]

Commands:
  start [port]            Start sovereign daemon & AG-UI streaming server (default: 4099)
  run <goal...>           Execute an autonomous goal with verification loop
  skills                  List all active Sovereign Skills and MCP tools
  brief                   Generate ambient executive brief of workspace state
  audit                   Audit workspace package dependencies for supply chain risk
  review <filepath>       Run AST security inspection on target file
  status                  Inspect agent kernel status, invariants, and memory
      `);
      process.exit(0);
    }
  }
}

main().catch((err) => {
  console.error("\x1b[31m[AetherOS Error]:\x1b[0m", err);
  process.exit(1);
});
