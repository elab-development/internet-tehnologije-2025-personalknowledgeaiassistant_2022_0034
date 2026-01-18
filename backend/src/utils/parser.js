import fs from 'fs';
import pdf from 'pdf-parse-fork';

/**
 * Funkcija koja parsira PDF, TXT ili MD fajl u niz segmenata
 * @param {string} filePath - putanja do fajla
 * @returns {string[]} - niz segmenata
 */
export const parseDocument = (filePath) => {
  const ext = filePath.split('.').pop().toLowerCase();
  let content = '';

  if (ext === 'pdf') {
    const dataBuffer = fs.readFileSync(filePath);
    const data = pdf(dataBuffer);
    return data.then(res => {
      const text = res.text;
      const segments = text.split(/\n\n|\r\n\r\n/).filter(s => s.trim().length > 0);
      return segments;
    });
  } else {
    // TXT ili MD fajl
    content = fs.readFileSync(filePath, 'utf-8');
    const segments = content.split(/\n\n|\r\n\r\n/).filter(s => s.trim().length > 0);
    return segments;
  }
};
