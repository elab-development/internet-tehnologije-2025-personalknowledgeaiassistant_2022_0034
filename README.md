# Personal Knowledge Base AI Assistant

Ovo je full-stack web aplikacija koja omogućava korisnicima komunikaciju sa AI asistentom, upravljanje chatovima, upload dokumenata, pregled statistike i administraciju korisnika.

## 🛠 Tehnologije

- Frontend: React, Vite, Axios
- Backend: Node.js, Express
- Baza podataka: PostgreSQL
- ORM: Prisma
- Autentifikacija: JWT
- Testiranje: Vitest, Testing Library
- CI/CD: GitHub Actions
- Containerizacija: Docker, Docker Compose
- Cloud: Google Cloud VM
- AI servis: Ollama

---

## 🚀 Pokretanje aplikacije lokalno (bez Dockera)

### Preuzimanje potrebnih modela
```bash
ollama pull nomic-embed-text
ollama pull qwen2.5:7b
ollama pull llama3
ollama pull qwen2.5:1.5b
ollama pull gemma2:2b
```

### Instalacija zavisnosti backend
```bash
cd backend
npm install
```
### Instalacija zavisnosti frontend
```bash
cd frontend
npm install
```
## ⚙️ Konfiguracija okruženja

Pre pokretanja aplikacije potrebno je definisati `.env` fajlove.

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
OLLAMA_BASE_URL=http://localhost:11434
```
### Frontend (`frontend/.env`)

```env
VITE_API_URL="http://localhost:3000"
```
### Pokretanje Ollama servisa
```bash
cd backend
ollama serve
```
### Pokretanje backend aplikacije
```bash
cd backend
npm start
```
### Pokretanje frontend aplikacije
```bash
cd frontend
npm run dev
```

## 🚀 Pokretanje aplikacije pomocu docker compose
```bash
docker compose up -d
```
