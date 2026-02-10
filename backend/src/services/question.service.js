import prisma from "../config/prisma.js";
import { getEmbedding, normalize } from "../utils/embedding.js";
import { getLLM } from "../config/llmFactory.js";
import xss from "xss";

const TOP_K = 5;
const MODELS_WITH_SEGMENTS = ["llama", "qwen7"];

export const createQuestion = async (userId, query, model, chatId) => {
  const safeQuery = xss(query);
  if (!chatId) {
    throw new Error("chatId is required");
  }

  // Verify the chat exists and belongs to the user
  const chat = await prisma.chat.findFirst({
    where: {
      id: chatId,
      userId: userId,
    },
  });

  if (!chat) {
    throw new Error("Chat not found or access denied");
  }

  const question = await prisma.question.create({
    data: { query: safeQuery, answer: "", userId, chatId },
  });

  const llm = getLLM(model);
  const raw = await getEmbedding(safeQuery);
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
${safeQuery}

Return valid JSON only:
{
  "answer": "your answer here",
  "usedSegments": ["segmentId1", "segmentId2"]
}

Do NOT include any extra text outside the JSON.
`;

  const rawAnswer = await llm.invoke(`
You are an AI assistant that answers questions based on provided documents.
Answer ONLY using the given context.
If the answer does not exist or is not mentioned in the context, respond with exactly:
"Information not found in documents."

${prompt}
`);

  console.log("RAW LLM ANSWER:\n", rawAnswer);

  const supportsSegments = MODELS_WITH_SEGMENTS.some((m) =>
    model.toLowerCase().includes(m),
  );

  let parsed = null;

  const cleaned = rawAnswer
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const match = cleaned.match(/\{[\s\S]*\}/);

  if (match) {
    try {
      parsed = JSON.parse(match[0]);
    } catch {
      parsed = null;
    }
  }

  let answer =
    parsed && typeof parsed.answer === "string" && parsed.answer.trim().length
      ? parsed.answer.trim()
      : "Information not found in the documents";

  if (
    !parsed ||
    parsed.answer.toLowerCase().includes("not defined") ||
    parsed.answer.toLowerCase().includes("not found") ||
    parsed.answer.toLowerCase().includes("not mentioned")
  ) {
    answer = "Information not found in the documents";
  }

  const existingSegments = segments.map((s) => s.segmentId);

  let usedSegmentIds =
    supportsSegments && parsed && Array.isArray(parsed.usedSegments)
      ? parsed.usedSegments
          .map(String)
          .filter((id) => existingSegments.includes(id))
      : [];

  if (
    supportsSegments &&
    answer !== "Information not found in the documents" &&
    !usedSegmentIds.length
  ) {
    usedSegmentIds = existingSegments;
  }

  await prisma.question.update({
    where: { id: question.id },
    data: { answer },
  });

  if (supportsSegments && usedSegmentIds.length) {
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
  }

  const sources =
    supportsSegments && answer !== "Information not found in the documents"
      ? segments
          .filter((s) => usedSegmentIds.includes(s.segmentId))
          .map((s) => ({
            documentId: s.documentId,
            fileName: s.fileName,
            segmentId: s.segmentId,
            preview: s.content.slice(0, 200) + "...",
          }))
      : [];

  return {
    question,
    answer,
    sources,
  };
};

export const getQuestions = async (userId) => {
  return prisma.question.findMany({
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
