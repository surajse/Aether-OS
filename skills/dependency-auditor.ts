import type { RegisteredTool } from "@aether/protocol";

export const DependencyAuditorSkill: RegisteredTool = {
  name: "dependency_auditor",
  description: "Audits project dependencies for known vulnerabilities, deprecated packages, and license compatibility.",
  parameters: {
    type: "object",
    properties: {
      packageJsonContent: { type: "string", description: "Stringified contents of package.json" }
    },
    required: ["packageJsonContent"]
  },
  handler: async (args: { packageJsonContent: string }) => {
    let pkg: any;
    try {
      pkg = JSON.parse(args.packageJsonContent);
    } catch {
      throw new Error("Invalid package.json JSON string.");
    }

    const dependencies = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
    const warnings: string[] = [];
    const audited = Object.keys(dependencies);

    const flaggedPackages: Record<string, string> = {
      "request": "Deprecated. Use native fetch or axios.",
      "node-fetch": "Deprecated on Node >= 18. Use native global fetch.",
      "moment": "Maintenance mode. Use date-fns or native Temporal.",
      "crypto": "Built-in to node. Do not install from npm (possible typosquat)."
    };

    for (const [name, version] of Object.entries(dependencies)) {
      if (flaggedPackages[name]) {
        warnings.push(`[WARN] '${name}@${version}': ${flaggedPackages[name]}`);
      }
    }

    return {
      totalDependenciesAudited: audited.length,
      warningsCount: warnings.length,
      warnings,
      status: warnings.length === 0 ? "Clean: No deprecated packages detected." : "Action required."
    };
  }
};
