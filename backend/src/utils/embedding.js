import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

const OLLAMA_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const embeddingsClient = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: OLLAMA_URL,
});

export const getEmbedding = async (text) => {
  const result = await embeddingsClient.embedDocuments([text]);
  return result[0];
};

export const normalize = (vec) => {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  return vec.map((v) => v / norm);
};
