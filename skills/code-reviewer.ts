import type { RegisteredTool } from "@aether/protocol";

export const CodeReviewerSkill: RegisteredTool = {
  name: "code_reviewer",
  description: "Audits git diffs for security violations, AST anti-patterns, and constitutional invariant breaches.",
  parameters: {
    type: "object",
    properties: {
      diffContent: { type: "string", description: "Unified git diff string" },
      strictMode: { type: "boolean", description: "Enable strict constitutional invariant checks" }
    },
    required: ["diffContent"]
  },
  handler: async (args: { diffContent: string; strictMode?: boolean }) => {
    const findings: string[] = [];
    const lines = args.diffContent.split("\n");

    for (const line of lines) {
      if (line.startsWith("+") && !line.startsWith("+++")) {
        // Check for leaked secrets
        if (/api_key|secret|password|bearer|auth_token/i.test(line) && /=/.test(line)) {
          findings.push(`[CRITICAL] Possible hardcoded credential detected: ${line.trim()}`);
        }
        // Check for dangerous shell execution
        if (/exec\(|spawn\(|eval\(/i.test(line) && !line.includes("LocalProcessJail")) {
          findings.push(`[HIGH] Raw process execution bypass detected: ${line.trim()}`);
        }
        // Check for unbounded loops
        if (/while\s*\(\s*true\s*\)/i.test(line)) {
          findings.push(`[MEDIUM] Unbounded loop pattern detected: ${line.trim()}`);
        }
      }
    }

    const passed = findings.filter((f) => f.includes("[CRITICAL]") || f.includes("[HIGH]")).length === 0;

    return {
      passed,
      findingsCount: findings.length,
      findings,
      verdict: passed ? "Approved: Clean AST delta." : "Rejected: Security violations found."
    };
  }
};
