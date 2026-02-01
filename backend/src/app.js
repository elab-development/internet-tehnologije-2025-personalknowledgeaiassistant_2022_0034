import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import documentRoutes from "./routes/document.routes.js";
import questionsRoutes from "./routes/question.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/document", documentRoutes);
app.use("/api/questions", questionsRoutes);
app.use("/api/chat", chatRoutes);

app.use(errorMiddleware);

export default app;
