import { Ollama } from "@langchain/community/llms/ollama";

export const getLLM = (modelName = "qwen7") => {
  switch (modelName) {
    case "qwen7":
      return new Ollama({
        model: "qwen2.5:7b",
        baseUrl: "http://localhost:11434",
        temperature: 0,
        top_p: 0.8,
        numCtx: 2048,
        numPredict: 128,
        numThread: -1,
      });

    case "llama":
      return new Ollama({
        model: "llama3",
        baseUrl: "http://localhost:11434",
        temperature: 0,
      });

    case "qwen1":
      return new Ollama({
        model: "qwen2.5:1.5b",
        baseUrl: "http://localhost:11434",
        temperature: 0,
        top_p: 0.9,
        numCtx: 1024,
        numPredict: 128,
        numThread: -1,
      });
    case "mistral":
      return new Ollama({
        model: "mistral:7b",
        baseUrl: "http://localhost:11434",
        temperature: 0,
      });

    case "phi3":
      return new Ollama({
        model: "phi3.5",
        baseUrl: "http://localhost:11434",
        temperature: 0,
        numCtx: 2048,
      });

    default:
      throw new Error("Unsupported model");
  }
};
