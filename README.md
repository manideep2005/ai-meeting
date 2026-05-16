# Syncra: AI-Powered Meeting & Workflow Assistant

**Syncra** is a sophisticated, privacy-first meeting intelligence platform that transforms raw transcripts and notes into structured action plans. Built for high-performance teams, it leverages local Large Language Models (LLMs) to ensure your data remains secure and private.

---

## ✨ Features

### 🔍 Intelligent Processing
- **Automated Summarization**: Get a concise 3-4 sentence overview of any meeting.
- **Action Item Extraction**: Automatically identifies tasks, assignees, and deadlines.
- **Decision Tracking**: Captures key outcomes and strategic pivots.

### 🎥 Live Meeting Workspace
- **Real-time Transcription**: Integrated Jitsi Meet video conferencing with live AI transcription.
- **Instant Distillation**: Process live conversations into notes as soon as the meeting ends.

### 📧 Automated Workflows
- **One-Click Follow-ups**: Draft professional, clear follow-up emails based on meeting insights.
- **Markdown Export**: Save and share results in a clean, portable format.

### 💬 Meeting Intelligence Chat
- **Context-Aware AI**: Chat with your meeting data to find specific details or ask clarifying questions.

### 📂 Organized History
- **Searchable Archive**: Store and manage all your past meetings in a central, local database.
- **Title Personalization**: Name your sessions for easy identification.

---

## 🛠 Tech Stack

- **Frontend**: [Next.js 14](https://nextjs.org/) (App Router), [Tailwind CSS v4](https://tailwindcss.com/), [Lucide React](https://lucide.dev/)
- **Backend**: [Node.js](https://nodejs.org/), [Express](https://expressjs.com/), [SQLite](https://sqlite.org/)
- **AI Engine**: [Ollama](https://ollama.ai/) (Local LLM Execution)
- **Video Conferencing**: [Jitsi Meet API](https://jitsi.org/projects/jitsi-meet/)

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Ollama](https://ollama.ai/)

### 2. LLM Setup
1. Download and install Ollama.
2. Pull the required models:
   ```bash
   ollama pull llama3.2:1b
   ollama pull gemma:2b
   ```

### 3. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the server:
   ```bash
   npm start
   ```
   The backend will run on `http://localhost:8000`.

### 4. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   Access the app at `http://localhost:3000`.

---

## 🧠 Handling AI Accuracy
LLMs can occasionally misidentify assignees or misinterpret deadlines if the transcript is ambiguous. **Syncra** mitigates this through:
- **Negative Constraint Prompting**: Forcing the model to use "Unassigned" instead of hallucinating names.
- **Fallback Chains**: Automatically switching between models (Llama 3.2, Gemma) if the primary model fails or produces invalid JSON.
- **User Verification**: Providing an editable interface for drafted emails and summaries.

---

## 📄 License
This project is for educational/assignment purposes. Developed as part of the **AI-Powered Meeting & Workflow Assistant** challenge.
