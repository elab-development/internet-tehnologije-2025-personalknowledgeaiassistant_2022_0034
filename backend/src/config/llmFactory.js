import { Ollama } from "@langchain/community/llms/ollama";

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
export const getLLM = (modelName = "qwen7") => {
  switch (modelName) {
    case "qwen7":
      return new Ollama({
        model: "qwen2.5:7b",
        baseUrl: OLLAMA_URL,
        temperature: 0,
        top_p: 0.8,
        numCtx: 2048,
        numPredict: 128,
        numThread: -1,
      });

    case "llama":
      return new Ollama({
        model: "llama3",
        baseUrl: OLLAMA_URL,
        temperature: 0,
        top_p: 0.85,
        numCtx: 4096,
        numPredict: 256,
        numThread: -1,
      });

    case "qwen1":
      return new Ollama({
        model: "qwen2.5:1.5b",
        baseUrl: OLLAMA_URL,
        temperature: 0,
        top_p: 0.9,
        numCtx: 1024,
        numPredict: 128,
        numThread: -1,
      });

    case "gemma2":
      return new Ollama({
        model: "gemma2:2b",
        baseUrl: OLLAMA_URL,
        temperature: 0.1,
        top_p: 0.95,
        numCtx: 4096,
        numPredict: 512,
        numGpu: 99,
        numThread: -1,
      });

    default:
      throw new Error("Unsupported model");
  }
};
