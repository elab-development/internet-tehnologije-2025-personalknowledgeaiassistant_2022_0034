import prisma from "../config/prisma.js";
import { Ollama } from "@langchain/community/llms/ollama";
import { getEmbedding } from "../utils/embedding.js";
import { normalize } from "../utils/embedding.js";

const llm = new Ollama({
  model: "qwen2.5:7b",
  baseUrl: "http://localhost:11434",
  system: `
You are an AI assistant that answers questions based on provided documents.
Answer ONLY using the given context.
If the answer does not exist or is not mentioned in the context, respond with exactly:
"Information not found in documents."
`,
  temperature: 0.1,
  top_p: 0.9,
  numCtx: 4096,
  numPredict: 512,
  numGpu: 99,
  numThread: -1,
});

const TOP_K = 5;

export const createQuestion = async (userId, query) => {
  const question = await prisma.question.create({
    data: { query, answer: "", userId },
  });

  const raw = await getEmbedding(query);
  const questionEmbedding = normalize(raw);

  const segments = await prisma.$queryRaw`
  SELECT content
  FROM "Segment" s
  JOIN "Document" d ON d.id = s."documentId"
  WHERE d."userId" = ${userId}
  ORDER BY s.embedding <-> ${`[${questionEmbedding.join(",")}]`}::vector
  LIMIT ${TOP_K}
`;

  const context = segments.map((s) => s.content).join("\n\n");

  const prompt = `
CONTEXT:
${context}

QUESTION:
${query}

Answer clearly and precisely, using only information from the context.
If the information is not present in the context, respond only with: Information not found in the documents.
`;

  let answer = await llm.invoke(prompt);

  if (
    !answer ||
    answer.toLocaleLowerCase().includes("not defined") ||
    answer.toLocaleLowerCase().includes("not found")
  )
    answer = "Information not found in the documents";

  await prisma.question.update({
    where: { id: question.id },
    data: { answer },
  });

  return { question, answer };
};

export const getQuestions = async (userId) => {
  return await prisma.question.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { segments: { include: { segment: true } } },
  });
};
