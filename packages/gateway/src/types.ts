export type Role = "system" | "user" | "assistant" | "tool";

export interface ToolCall {
  id: string;
  name: string;
  arguments: Record<string, any>;
}

export interface LLMMessage {
  role: Role;
  content: string;
  toolCallId?: string;
  toolCalls?: ToolCall[];
}

export interface LLMTool {
  name: string;
  description: string;
  parameters: Record<string, any>;
}

export interface LLMCompletionResponse {
  content: string;
  toolCalls?: ToolCall[];
  providerUsed: string;
  latencyMs: number;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
}

export interface ILLMProvider {
  readonly name: string;
  generate(messages: LLMMessage[], tools?: LLMTool[]): Promise<LLMCompletionResponse>;
}
