# Contributing to AetherOS (OpenDots)

Thank you for helping build the future of sovereign, open-source agentic computing!

---

## 🏛️ Guiding Principles

1. **Local-First & Data Sovereignty**: Users retain 100% control over their data, logs, and compute environments. Never commit telemetry trackers or privacy-compromising shims.
2. **Calm Ergonomics**: Autonomous systems must reduce cognitive load, not amplify it. All notification mechanisms must respect Attention Debt limits.
3. **Deterministic Verification**: Every capability, tool, and state transition must be covered by automated tests.

---

## 🛠️ Development Setup

### Prerequisites
* Node.js $\ge 22.0.0$
* `pnpm` $\ge 9.0.0$
* Git

### Installation
```bash
# Clone the repository
git clone https://github.com/your-username/aether-os.git
cd aether-os

# Install all workspace dependencies
pnpm install

# Run type check across all packages
pnpm run check

# Run tests
pnpm test
```

---

## 🧩 Adding a New Model Provider

1. Open `packages/gateway/src/`.
2. Implement the `ILLMProvider` interface:
   ```typescript
   export class CustomProvider implements ILLMProvider {
     readonly name = "Custom-LLM";
     async generate(messages: LLMMessage[], tools?: LLMTool[]): Promise<LLMCompletionResponse> {
       // Implementation
     }
   }
   ```
3. Add corresponding unit tests in `packages/gateway/test/router.test.ts`.

---

## 🔧 Adding a New MCP Tool

1. Open `packages/protocol/src/mcp.ts`.
2. Register the tool with typed parameter schemas:
   ```typescript
   mcp.registerTool({
     name: "my_custom_tool",
     description: "Clear explanation of tool capability",
     parameters: {
       type: "object",
       properties: {
         target: { type: "string" }
       },
       required: ["target"]
     },
     handler: async (args) => {
       // Execution logic
     }
   });
   ```

---

## 🧪 Testing Guidelines

Before opening a Pull Request:
```bash
# Ensure 100% tests pass
pnpm test

# Verify all composite TypeScript references compile cleanly
pnpm run check
```
