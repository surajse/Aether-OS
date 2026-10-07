import type { RegisteredTool } from "@aether/protocol";

export const TestGeneratorSkill: RegisteredTool = {
  name: "test_spec_generator",
  description: "Synthesizes Vitest unit test templates from a module specification to enable spec-first TDD.",
  parameters: {
    type: "object",
    properties: {
      moduleName: { type: "string", description: "Name of the module under test" },
      functions: {
        type: "array",
        items: { type: "string" },
        description: "List of function signatures to test"
      }
    },
    required: ["moduleName", "functions"]
  },
  handler: async (args: { moduleName: string; functions: string[] }) => {
    const testCases = args.functions
      .map((fn) => {
        return `  it("verifies expected behavior of ${fn}", () => {\n    // Arrange\n    // Act\n    // Assert\n    expect(true).toBe(true);\n  });`;
      })
      .join("\n\n");

    const template = `import { describe, it, expect } from "vitest";
import * as ${args.moduleName} from "../src/${args.moduleName}.js";

describe("${args.moduleName} Unit Tests", () => {
${testCases}
});
`;

    return {
      generatedTestFile: `${args.moduleName}.test.ts`,
      codeContent: template,
      testsCount: args.functions.length
    };
  }
};
