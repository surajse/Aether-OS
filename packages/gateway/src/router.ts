import type { ILLMProvider, LLMMessage, LLMTool, LLMCompletionResponse } from "./types.js";

export interface FailoverEvent {
  failedProvider: string;
  targetProvider: string;
  error: string;
  timestamp: number;
}

export class ModelGateway {
  private providers: ILLMProvider[];
  private failoverLogs: FailoverEvent[] = [];

  constructor(providers: ILLMProvider[]) {
    if (!providers || providers.length === 0) {
      throw new Error("ModelGateway requires at least one configured provider.");
    }
    this.providers = [...providers];
  }

  getFailoverLogs(): FailoverEvent[] {
    return [...this.failoverLogs];
  }

  async generate(messages: LLMMessage[], tools?: LLMTool[]): Promise<LLMCompletionResponse> {
    let lastError: Error | null = null;

    for (let i = 0; i < this.providers.length; i++) {
      const provider = this.providers[i];
      try {
        const response = await provider.generate(messages, tools);
        return response;
      } catch (err: any) {
        lastError = err;
        const nextProvider = this.providers[i + 1];

        if (nextProvider) {
          this.failoverLogs.push({
            failedProvider: provider.name,
            targetProvider: nextProvider.name,
            error: err.message || String(err),
            timestamp: Date.now()
          });
        }
      }
    }

    throw new Error(
      `All providers failed in ModelGateway chain. Last error from '${
        this.providers[this.providers.length - 1].name
      }': ${lastError?.message}`
    );
  }
}

/**
 * Deterministic Mock Provider for offline tests and validation.
 */
export class MockLLMProvider implements ILLMProvider {
  public shouldFail = false;
  public failureError = new Error("Simulated 429 Too Many Requests");
  public mockResponse: Partial<LLMCompletionResponse> = {};

  constructor(public readonly name: string) {}

  async generate(messages: LLMMessage[], tools?: LLMTool[]): Promise<LLMCompletionResponse> {
    if (this.shouldFail) {
      throw this.failureError;
    }

    return {
      content: this.mockResponse.content ?? "Simulated response from " + this.name,
      toolCalls: this.mockResponse.toolCalls,
      providerUsed: this.name,
      latencyMs: 15,
      tokensUsed: { prompt: 100, completion: 50, total: 150 }
    };
  }
}
