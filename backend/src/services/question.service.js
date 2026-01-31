import prisma from "../config/prisma.js";
import { Ollama } from "@langchain/community/llms/ollama";
import { getEmbedding, normalize } from "../utils/embedding.js";

const llm = new Ollama({
  model: "qwen2.5:1.5b",
  baseUrl: "http://localhost:11434",
  system: `You are an AI assistant that answers questions based on provided documents.
Answer ONLY using the given context.
If the answer does not exist, respond with: "Information not found in documents."
IMPORTANT: In your JSON response, include ONLY the segment IDs that you actually used to answer the question.`,
  temperature: 0,
  top_p: 0.9,
  numCtx: 1024,
  numPredict: 128,
  numGpu: 99,
  numThread: -1,
});

const TOP_K = 10;

export const createQuestion = async (userId, query) => {
  console.log("\n=== PERFORMANCE DIAGNOSIS ===");
  const totalStart = Date.now();

  // Step 1: Question creation + Embedding
  console.time("1. Question Create + Embedding");
  const [question, questionEmbedding] = await Promise.all([
    prisma.question.create({
      data: { query, answer: "", userId },
    }),
    (async () => {
      const embedStart = Date.now();
      const raw = await getEmbedding(query);
      const normalized = normalize(raw);
      console.log(`   - getEmbedding took: ${Date.now() - embedStart}ms`);
      return normalized;
    })(),
  ]);
  console.timeEnd("1. Question Create + Embedding");

  // Step 2: Vector search
  console.time("2. Vector Search");
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
  console.timeEnd("2. Vector Search");
  console.log(`   - Found ${segments.length} segments`);

  // Step 3: Build context with numbered segments for easier reference
  console.time("3. Build Context");
  const context = segments
    .map((s, idx) => `[SEGMENT ${idx + 1} - ID: ${s.segmentId}]\n${s.content}`)
    .join("\n\n");
  const contextLength = context.length;
  console.timeEnd("3. Build Context");
  console.log(`   - Context length: ${contextLength} chars`);

  // Step 4: Build prompt - more explicit about segment tracking
  const prompt = `Context (with segment IDs):
${context}

Question: ${query}

Instructions:
1. Answer the question using ONLY the context above
2. List ONLY the segment IDs you actually used to form your answer
3. If you don't use a segment, don't include its ID

Respond with valid JSON only:
{"answer": "your answer here", "usedSegments": ["segmentId1", "segmentId2"]}`;
  
  console.log(`   - Prompt length: ${prompt.length} chars`);

  // Step 5: LLM Inference
  console.time("4. LLM Inference");
  let rawAnswer = await llm.invoke(prompt);
  console.timeEnd("4. LLM Inference");
  console.log(`   - Response length: ${rawAnswer.length} chars`);
  console.log(`   - Raw response: ${rawAnswer}`);

  // Step 6: Parse response
  console.time("5. Parse Response");
  let parsed;
  try {
    const cleanedAnswer = rawAnswer.replace(/```json\n?|\n?```/g, '').trim();
    parsed = JSON.parse(cleanedAnswer);
  } catch (e) {
    console.error("   - JSON parse error:", e.message);
    parsed = {
      answer: "Information not found in the documents",
      usedSegments: [],
    };
  }

  let answer = parsed.answer || "Information not found in the documents";

  const notFoundKeywords = ["not defined", "not found", "not mentioned", "cannot find"];
  if (
    !parsed.answer ||
    notFoundKeywords.some(keyword => 
      parsed.answer.toLowerCase().includes(keyword)
    )
  ) {
    answer = "Information not found in the documents";
  }

  // ✅ FIXED: Only use segments that LLM actually referenced
  let usedSegmentIds = parsed.usedSegments || [];
  const existingSegments = segments.map((s) => s.segmentId);
  
  // Validate and filter segment IDs
  usedSegmentIds = usedSegmentIds
    .map(String)
    .filter((id) => existingSegments.includes(id));

  // ✅ NEW: If LLM didn't provide segments but gave an answer, 
  // try to infer from the top matched segment only
  if (!usedSegmentIds.length && answer !== "Information not found in the documents") {
    console.log("   - Warning: LLM didn't specify segments, using top match only");
    usedSegmentIds = [existingSegments[0]]; // Use only the most relevant segment
  }

  // ✅ If still no segments and no answer, return empty
  if (!usedSegmentIds.length && answer === "Information not found in the documents") {
    usedSegmentIds = [];
  }

  console.log(`   - Used segments: ${usedSegmentIds.length}/${segments.length}`);
  console.timeEnd("5. Parse Response");

  // Step 7: Database updates
  console.time("6. Database Updates");
  const dbOperations = [
    prisma.question.update({
      where: { id: question.id },
      data: { answer },
    }),
    prisma.questionSegment.deleteMany({
      where: { questionId: question.id },
    }),
  ];

  // Only create segment relations if we have segments
  if (usedSegmentIds.length > 0) {
    dbOperations.push(
      prisma.questionSegment.createMany({
        data: usedSegmentIds.map((id) => ({
          questionId: question.id,
          segmentId: id,
        })),
        skipDuplicates: true,
      })
    );
  }

  await prisma.$transaction(dbOperations);
  console.timeEnd("6. Database Updates");

  // Step 8: Prepare sources
  console.time("7. Prepare Sources");
  const sources = segments
    .filter((s) => usedSegmentIds.includes(s.segmentId))
    .map((s) => ({
      documentId: s.documentId,
      fileName: s.fileName,
      segmentId: s.segmentId,
      preview: s.content.slice(0, 200) + "...",
    }));
  console.timeEnd("7. Prepare Sources");

  const totalTime = Date.now() - totalStart;
  console.log(`\n=== TOTAL TIME: ${totalTime}ms (${(totalTime/1000).toFixed(2)}s) ===\n`);

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