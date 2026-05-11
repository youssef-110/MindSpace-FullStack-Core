# MindSpace Full-Stack System

MindSpace is a full-stack mental health platform that combines behavioral tracking with local AI-powered psychological analysis. The system integrates a React frontend with a FastAPI backend and uses a Retrieval-Augmented Generation (RAG) architecture to provide context-aware responses grounded in psychological knowledge.

---

# Features

- Local AI processing using Ollama and Llama 3
- Retrieval-Augmented Generation (RAG)
- Vector search with ChromaDB
- React + FastAPI full-stack architecture
- Privacy-focused design with no cloud AI dependency
- Modular backend and frontend structure
- Psychological knowledge base synchronization

---

# Tech Stack

## Frontend
- React.js
- JavaScript
- Tailwind CSS
- Vite

## Backend
- Python
- FastAPI
- Uvicorn
- Pydantic

## AI / Data Science
- Ollama
- Llama 3
- LangChain
- ChromaDB
- HuggingFace Sentence Transformers (`all-MiniLM-L6-v2`)

---

# Project Structure

```text
mindspace/
├── backend/
│   ├── main.py
│   ├── brain.py
│   ├── data/
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# Installation

## Prerequisites

Make sure you have installed:

- Python 3.10+
- Node.js (LTS)
- Ollama

Pull the Llama 3 model:

```bash
ollama pull llama3
```

---

# Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv .venv
```

Activate the virtual environment.

### Windows

```bash
.venv\Scripts\activate
```

### macOS / Linux

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the backend server:

```bash
python main.py
```

---

# Frontend Setup

Navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

# API Endpoints

## POST `/chat`

Accepts:
- User message
- Chat history

Returns:
- AI-generated response grounded in the local psychology knowledge base

---

## POST `/sync`

Scans the `data/` directory and updates ChromaDB embeddings with newly added psychological data.

---

# Architecture Overview

The platform uses a Retrieval-Augmented Generation pipeline:

1. User sends a message through the React frontend
2. FastAPI backend receives the request
3. LangChain retrieves relevant context from ChromaDB
4. Ollama runs the local Llama 3 model
5. Response is returned to the frontend

This architecture improves:
- Response accuracy
- Context grounding
- Privacy protection
- Offline capability

---

# Privacy

MindSpace is designed with a privacy-first approach.

All AI processing, embeddings, and vector searches are performed locally on the user's machine through Ollama and ChromaDB. No sensitive psychological data is sent to external AI providers.

---

# Future Improvements

- User authentication system
- Conversation memory
- Advanced analytics dashboard
- Emotion detection
- Voice interaction support
- Multi-user support
- Docker deployment

---

# License

This project is intended for educational and research purposes.
