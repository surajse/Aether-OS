export * from "./types.js";
export * from "./router.js";
export * from "./providers.js";

import { ModelGateway, MockLLMProvider } from "./router.js";
import { AnthropicProvider, OpenAIProvider, OllamaProvider } from "./providers.js";
import type { ILLMProvider } from "./types.js";

/**
 * Creates a cascading ModelGateway automatically from environment variables.
 * Prefers Anthropic -> OpenAI -> Ollama -> Mock fallback.
 */
export function createDefaultGatewayFromEnv(): ModelGateway {
  const providers: ILLMProvider[] = [];

  if (process.env.ANTHROPIC_API_KEY) {
    providers.push(new AnthropicProvider(process.env.ANTHROPIC_API_KEY));
  }

  if (process.env.OPENAI_API_KEY) {
    providers.push(new OpenAIProvider(process.env.OPENAI_API_KEY));
  }

  if (process.env.OLLAMA_BASE_URL) {
    providers.push(new OllamaProvider("llama3.2:3b", process.env.OLLAMA_BASE_URL));
  }

  // Always provide a reliable mock provider at the end of the chain
  providers.push(new MockLLMProvider("AetherLocalFallback"));

  return new ModelGateway(providers);
}
