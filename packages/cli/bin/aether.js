#!/usr/bin/env node

import { AetherNode } from "../dist/index.js";
import * as process from "node:process";

const args = process.argv.slice(2);
const command = args[0] || "start";

async function main() {
  const node = new AetherNode({
    workspaceDir: process.cwd()
  });

  if (command === "start") {
    const port = Number(args[1]) || 4099;
    await node.start(port);
    console.log("Press Ctrl+C to terminate AetherOS node.");
  } else if (command === "run") {
    const goal = args.slice(1).join(" ") || "Run repository diagnostics";
    console.log(`[AetherOS] Executing goal: "${goal}"`);
    const res = await node.runGoal(goal);
    console.log("[AetherOS] Result:", JSON.stringify(res, null, 2));
    process.exit(res.success ? 0 : 1);
  } else {
    console.log(`
AetherOS (OpenDots) CLI
Usage:
  aether start [port]       Start the sovereign daemon and AG-UI streaming server
  aether run <goal...>      Run an autonomous goal with verification
    `);
  }
}

main().catch((err) => {
  console.error("[AetherOS Error]:", err);
  process.exit(1);
});
