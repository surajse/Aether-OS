import { describe, it, expect } from "vitest";
import { ModelGateway, MockLLMProvider } from "../src/router.js";
import type { LLMMessage, LLMTool } from "../src/types.js";

describe("ModelGateway Cascading Router", () => {
  const dummyMessages: LLMMessage[] = [{ role: "user", content: "List all files" }];
  const dummyTools: LLMTool[] = [
    {
      name: "list_files",
      description: "List directory contents",
      parameters: { type: "object", properties: {} }
    }
  ];

  it("routes to primary provider when healthy", async () => {
    const primary = new MockLLMProvider("Anthropic-Claude");
    const secondary = new MockLLMProvider("OpenAI-GPT4o");
    const gateway = new ModelGateway([primary, secondary]);

    const res = await gateway.generate(dummyMessages, dummyTools);
    expect(res.providerUsed).toBe("Anthropic-Claude");
    expect(gateway.getFailoverLogs().length).toBe(0);
  });

  it("cascades automatically to secondary provider when primary fails (e.g. 429)", async () => {
    const primary = new MockLLMProvider("Anthropic-Claude");
    primary.shouldFail = true;
    primary.failureError = new Error("429 Rate limit exceeded");

    const secondary = new MockLLMProvider("OpenAI-GPT4o");
    secondary.mockResponse = {
      content: "Here are the files",
      toolCalls: [{ id: "call_1", name: "list_files", arguments: {} }]
    };

    const gateway = new ModelGateway([primary, secondary]);
    const res = await gateway.generate(dummyMessages, dummyTools);

    expect(res.providerUsed).toBe("OpenAI-GPT4o");
    expect(res.toolCalls?.length).toBe(1);
    expect(res.toolCalls?.[0].name).toBe("list_files");

    const logs = gateway.getFailoverLogs();
    expect(logs.length).toBe(1);
    expect(logs[0].failedProvider).toBe("Anthropic-Claude");
    expect(logs[0].targetProvider).toBe("OpenAI-GPT4o");
  });

  it("throws descriptive error when all configured providers fail", async () => {
    const primary = new MockLLMProvider("Primary");
    primary.shouldFail = true;

    const secondary = new MockLLMProvider("Secondary");
    secondary.shouldFail = true;

    const gateway = new ModelGateway([primary, secondary]);

    await expect(gateway.generate(dummyMessages)).rejects.toThrow("All providers failed in ModelGateway chain");
  });
});
