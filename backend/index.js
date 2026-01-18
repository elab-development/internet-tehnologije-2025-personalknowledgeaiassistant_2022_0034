import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();
const PORT = 3000;

app.use(express.json());

app.get("/api/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json({
      message: "Konekcija sa bazom je uspešna!",
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.error("Greška pri radu sa bazom:", error);
    res.status(500).json({
      message: "Greška u konekciji!",
      error: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log("Server pokrenut na portu 3000");
});