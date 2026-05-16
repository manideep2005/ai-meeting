# AI Meeting Assistant

A premium web application to process meeting notes using local LLMs via Ollama.

## Features
- **Summary Generation**: 3-4 sentence overview of the meeting.
- **Action Items**: Extract tasks, assignees, and deadlines.
- **Key Decisions**: List important outcomes.
- **Follow-up Email**: One-click professional email drafting.
- **Local AI**: Powered by Ollama (Llama 3.2).

## Tech Stack
- **Frontend**: Next.js 14, Tailwind CSS, Lucide React.
- **Backend**: Node.js, Express, Multer, Axios.
- **LLM**: Ollama (`llama3.2:1b` or higher).

## Setup Instructions

### 1. Ollama Setup
1. Install [Ollama](https://ollama.ai).
2. Pull the model:
   ```bash
   ollama pull llama3.2:1b
   ```

### 2. Backend Setup
1. Navigate to `backend`:
   ```bash
   cd backend
   npm install
   ```
2. Start the server:
   ```bash
   npm start
   ```

### 3. Frontend Setup
1. Navigate to `frontend`:
   ```bash
   cd frontend
   npm install
   ```
2. Start the dev server:
   ```bash
   npm run dev
   ```

## Handling Incorrect Assignee Extraction
LLMs can sometimes misidentify assignees if the context is ambiguous. To mitigate this:
1. **Prompt Engineering**: We explicitly ask the LLM to use "Unassigned" if a name isn't clear.
2. **Context Clues**: The prompt encourages looking for phrases like "I will", "can you", or "[Name] to handle".
3. **User Editing**: The UI provides a "Draft Email" section where users can manually polish results before sending.
