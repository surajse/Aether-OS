import { defineWorkspace } from "vitest/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineWorkspace([
  {
    test: {
      name: "unit",
      testTimeout: 15000,
      include: ["packages/*/test/**/*.test.ts"],
      alias: {
        "@aether/types": path.resolve(__dirname, "packages/types/src/index.ts"),
        "@aether/core": path.resolve(__dirname, "packages/core/src/index.ts"),
        "@aether/sandbox": path.resolve(__dirname, "packages/sandbox/src/index.ts"),
        "@aether/gateway": path.resolve(__dirname, "packages/gateway/src/index.ts"),
        "@aether/protocol": path.resolve(__dirname, "packages/protocol/src/index.ts"),
        "@aether/memory": path.resolve(__dirname, "packages/memory/src/index.ts"),
        "@aether/skills": path.resolve(__dirname, "packages/skills/src/index.ts"),
        "@aether/cli": path.resolve(__dirname, "packages/cli/src/index.ts"),
      }
    }
  }
]);
