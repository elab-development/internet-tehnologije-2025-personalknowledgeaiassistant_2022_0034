import fs from "fs";
import pdf from "pdf-parse-fork";

const cleanText = (text) => {
  return text
    .replace(/\s+/g, " ")
    .replace(/\u0000/g, "")
    .trim();
};

const chunkText = (text, chunkSize = 300, overlap = 40) => {
  const words = text.split(" ");
  const chunks = [];

  if (words.length <= chunkSize) {
    return [text];
  }

  for (let i = 0; i < words.length; i += chunkSize - overlap) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.length > 25) {
      chunks.push(chunk);
    }
  }

  return chunks;
};

export const parseDocument = async (filePath) => {
  const ext = filePath.split(".").pop().toLowerCase();
  let text = "";

  // PDF
  if (ext === "pdf") {
    const buffer = fs.readFileSync(filePath);
    const data = await pdf(buffer);
    text = data.text;
  }
  // TXT / MD
  else {
    text = fs.readFileSync(filePath, "utf-8");
  }

  text = cleanText(text);

  if (!text || text.length < 20) {
    return [];
  }

  return chunkText(text, 300, 40);
};
