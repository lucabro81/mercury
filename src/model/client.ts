import { createOllama, type OllamaProvider } from "ai-sdk-ollama";

export function getOllamaProvider(): OllamaProvider {
  const baseURL = process.env.OLLAMA_HOST;
  if (!baseURL) {
    throw new Error(
      "OLLAMA_HOST is not set — never default to localhost, see D-02",
    );
  }
  return createOllama({ baseURL });
}
