import type { ILLMProvider, LLMMessage, LLMTool, LLMCompletionResponse, ToolCall } from "./types.js";

/**
 * Live Anthropic Claude Model Provider using standard native fetch.
 */
export class AnthropicProvider implements ILLMProvider {
  public readonly name: string;

  constructor(
    private apiKey = process.env.ANTHROPIC_API_KEY || "",
    public readonly model = "claude-3-7-sonnet-20250219",
    private baseUrl = "https://api.anthropic.com"
  ) {
    this.name = `Anthropic (${model})`;
  }

  async generate(messages: LLMMessage[], tools?: LLMTool[]): Promise<LLMCompletionResponse> {
    if (!this.apiKey) {
      throw new Error("Anthropic API key is not configured.");
    }

    const startTime = Date.now();
    let systemPrompt = "";
    const anthropicMessages: any[] = [];

    for (const msg of messages) {
      if (msg.role === "system") {
        systemPrompt += (systemPrompt ? "\n" : "") + msg.content;
      } else {
        anthropicMessages.push({
          role: msg.role === "assistant" ? "assistant" : "user",
          content: msg.content
        });
      }
    }

    const payload: any = {
      model: this.model,
      max_tokens: 4096,
      messages: anthropicMessages
    };

    if (systemPrompt) {
      payload.system = systemPrompt;
    }

    if (tools && tools.length > 0) {
      payload.tools = tools.map((t) => ({
        name: t.name,
        description: t.description,
        input_schema: t.parameters
      }));
    }

    const res = await fetch(`${this.baseUrl}/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": this.apiKey,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Anthropic API error (${res.status}): ${errText}`);
    }

    const data: any = await res.json();
    const latencyMs = Date.now() - startTime;

    let textContent = "";
    const toolCalls: ToolCall[] = [];

    for (const block of data.content || []) {
      if (block.type === "text") {
        textContent += block.text;
      } else if (block.type === "tool_use") {
        toolCalls.push({
          id: block.id,
          name: block.name,
          arguments: block.input || {}
        });
      }
    }

    return {
      content: textContent,
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      providerUsed: this.name,
      latencyMs,
      tokensUsed: {
        prompt: data.usage?.input_tokens || 0,
        completion: data.usage?.output_tokens || 0,
        total: (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0)
      }
    };
  }
}

/**
 * Live OpenAI Model Provider (GPT-4o / GPT-5 / Compatible endpoints).
 */
export class OpenAIProvider implements ILLMProvider {
  public readonly name: string;

  constructor(
    private apiKey = process.env.OPENAI_API_KEY || "",
    public readonly model = "gpt-4o",
    private baseUrl = "https://api.openai.com/v1"
  ) {
    this.name = `OpenAI (${model})`;
  }

  async generate(messages: LLMMessage[], tools?: LLMTool[]): Promise<LLMCompletionResponse> {
    if (!this.apiKey) {
      throw new Error("OpenAI API key is not configured.");
    }

    const startTime = Date.now();
    const payload: any = {
      model: this.model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content
      }))
    };

    if (tools && tools.length > 0) {
      payload.tools = tools.map((t) => ({
        type: "function",
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters
        }
      }));
    }

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`OpenAI API error (${res.status}): ${errText}`);
    }

    const data: any = await res.json();
    const latencyMs = Date.now() - startTime;
    const choice = data.choices?.[0]?.message;

    const toolCalls: ToolCall[] = [];
    if (choice?.tool_calls) {
      for (const tc of choice.tool_calls) {
        let parsedArgs = {};
        try {
          parsedArgs = JSON.parse(tc.function.arguments || "{}");
        } catch {
          // ignore
        }
        toolCalls.push({
          id: tc.id,
          name: tc.function.name,
          arguments: parsedArgs
        });
      }
    }

    return {
      content: choice?.content || "",
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      providerUsed: this.name,
      latencyMs,
      tokensUsed: {
        prompt: data.usage?.prompt_tokens || 0,
        completion: data.usage?.completion_tokens || 0,
        total: data.usage?.total_tokens || 0
      }
    };
  }
}

/**
 * Sovereign Local Ollama / vLLM Provider (100% offline & local).
 */
export class OllamaProvider implements ILLMProvider {
  public readonly name: string;

  constructor(
    public readonly model = "llama3.2:3b",
    private baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434"
  ) {
    this.name = `Ollama Local (${model})`;
  }

  async generate(messages: LLMMessage[], tools?: LLMTool[]): Promise<LLMCompletionResponse> {
    const startTime = Date.now();
    const payload: any = {
      model: this.model,
      stream: false,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content
      }))
    };

    if (tools && tools.length > 0) {
      payload.tools = tools.map((t) => ({
        type: "function",
        function: {
          name: t.name,
          description: t.description,
          parameters: t.parameters
        }
      }));
    }

    const res = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Ollama local engine error (${res.status}): ${errText}`);
    }

    const data: any = await res.json();
    const latencyMs = Date.now() - startTime;
    const msg = data.message;

    const toolCalls: ToolCall[] = [];
    if (msg?.tool_calls) {
      for (const tc of msg.tool_calls) {
        toolCalls.push({
          id: tc.id || `${Date.now()}-call`,
          name: tc.function?.name || "",
          arguments: tc.function?.arguments || {}
        });
      }
    }

    return {
      content: msg?.content || "",
      toolCalls: toolCalls.length > 0 ? toolCalls : undefined,
      providerUsed: this.name,
      latencyMs,
      tokensUsed: {
        prompt: data.prompt_eval_count || 0,
        completion: data.eval_count || 0,
        total: (data.prompt_eval_count || 0) + (data.eval_count || 0)
      }
    };
  }
}
