import type { RegisteredTool } from "@aether/protocol";

export const MorningBriefSkill: RegisteredTool = {
  name: "morning_brief_aggregator",
  description: "Compiles overnight autonomous actions, CI test outcomes, and deferred reviews into an executive briefing card.",
  parameters: {
    type: "object",
    properties: {
      completedTasks: {
        type: "array",
        items: {
          type: "object",
          properties: {
            goal: { type: "string" },
            status: { type: "string" },
            healingAttempts: { type: "number" }
          }
        }
      },
      pendingReviewsCount: { type: "number" }
    },
    required: ["completedTasks", "pendingReviewsCount"]
  },
  handler: async (args: { completedTasks: Array<{ goal: string; status: string; healingAttempts: number }>; pendingReviewsCount: number }) => {
    const summaryLines = [
      "🌅 **AetherOS Morning Executive Briefing**",
      `• Tasks Completed Overnight: ${args.completedTasks.filter((t) => t.status === "COMPLETED").length}`,
      `• Self-Healing Repairs Executed: ${args.completedTasks.reduce((acc, t) => acc + (t.healingAttempts || 0), 0)}`,
      `• High-Risk Actions Awaiting Review: ${args.pendingReviewsCount}`,
      "",
      "**Completed Highlights:**"
    ];

    for (const t of args.completedTasks) {
      summaryLines.push(`  - [${t.status}] ${t.goal} (${t.healingAttempts} self-repair loops)`);
    }

    if (args.pendingReviewsCount > 0) {
      summaryLines.push(`\n⚠️ Attention Required: ${args.pendingReviewsCount} action(s) paused in your Action Review queue.`);
    } else {
      summaryLines.push("\n✨ Zero blockers. Your agent fleet is operating smoothly.");
    }

    return {
      formattedBrief: summaryLines.join("\n"),
      timestamp: Date.now()
    };
  }
};
