import prisma from "../config/prisma.js";
import { Ollama } from "@langchain/community/llms/ollama";
import { getEmbedding, normalize } from "../utils/embedding.js";

const llm = new Ollama({
  model: "qwen2.5:7b",
  baseUrl: "http://localhost:11434",
  system: `
You are an AI assistant that answers questions based on provided documents.
Answer ONLY using the given context.
If the answer does not exist or is not mentioned in the context, respond with exactly:
"Information not found in documents."
`,
  temperature: 0,
  top_p: 0.8,
  numCtx: 2048,
  numPredict: 128,
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
    SELECT 
      s.id::text as "segmentId",
      s.content,
      s."documentId",
      d."fileName"
    FROM "Segment" s
    JOIN "Document" d ON d.id = s."documentId"
    WHERE d."userId" = ${userId}
    ORDER BY s.embedding <-> ${`[${questionEmbedding.join(",")}]`}::vector
    LIMIT ${TOP_K}
  `;

  const context = segments
    .map((s) => `SEGMENT_ID: ${s.segmentId}\n${s.content}`)
    .join("\n\n");

  const prompt = `
CONTEXT:
${context}

QUESTION:
${query}



Return valid JSON only:
{
  "answer": "your answer here",
  "usedSegments": ["segmentId1", "segmentId2"]
}

Do NOT include any extra text outside the JSON.
`;

  let rawAnswer = await llm.invoke(prompt);

  let parsed;
  try {
    parsed = JSON.parse(rawAnswer);
  } catch (e) {
    parsed = {
      answer: "Information not found in the documents",
      usedSegments: [],
    };
  }

  let answer = parsed.answer || "Information not found in the documents";

  if (
    !parsed.answer ||
    parsed.answer.toLocaleLowerCase().includes("not defined") ||
    parsed.answer.toLocaleLowerCase().includes("not found") ||
    parsed.answer.toLocaleLowerCase().includes("not mentioned")
  )
    answer = "Information not found in the documents";
  let usedSegmentIds = parsed.usedSegments || [];

  const existingSegments = segments.map((s) => s.segmentId);
  usedSegmentIds = usedSegmentIds
    .map(String)
    .filter((id) => existingSegments.includes(id));

  if (!usedSegmentIds.length) {
    usedSegmentIds = existingSegments;
  }

  await prisma.question.update({
    where: { id: question.id },
    data: { answer },
  });

  await prisma.questionSegment.deleteMany({
    where: { questionId: question.id },
  });

  await prisma.questionSegment.createMany({
    data: usedSegmentIds.map((id) => ({
      questionId: question.id,
      segmentId: id,
    })),
    skipDuplicates: true,
  });

  const sources = segments
    .filter((s) => usedSegmentIds.includes(s.segmentId))
    .map((s) => ({
      documentId: s.documentId,
      fileName: s.fileName,
      segmentId: s.segmentId,
      preview: s.content.slice(0, 200) + "...",
    }));

  return {
    question,
    answer,
    sources,
  };
};

export const getQuestions = async (userId) => {
  return await prisma.question.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      segments: {
        include: {
          segment: {
            include: {
              document: true,
            },
          },
        },
      },
    },
  });
};
