import * as questionService from "../services/question.service.js";
import { success, fail } from "../utils/response.js";

export const askQuestion = async (req, res) => {
  try {
    const { query, model } = req.body;
    if (!query) return fail(res, "Query is required", 400);

    const { question, answer, sources } = await questionService.createQuestion(
      req.user.id,
      query,
      model,
    );

    success(
      res,
      {
        answer,
        sources,
      },
      "Question answered",
    );
  } catch (err) {
    console.error(err);
    fail(res, err.message || "Failed to process question", 500);
  }
};

export const getQuestions = async (req, res) => {
  try {
    const questions = await questionService.getQuestions(req.user.id);
    success(res, questions, "Questions fetched");
  } catch (err) {
    console.error(err);
    fail(res, err.message || "Failed to get questions", 500);
  }
};
