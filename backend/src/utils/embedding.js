import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

const embeddingsClient = new OllamaEmbeddings({
  model: "nomic-embed-text",
  baseUrl: "http://localhost:11434",
});

export const getEmbedding = async (text) => {
  const result = await embeddingsClient.embedDocuments([text]);
  return result[0];
};

export const normalize = (vec) => {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  return vec.map(v => v / norm);
};