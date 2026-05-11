# MindSpace Full-Stack System

A comprehensive mental health platform integrating traditional behavioral tracking with a locally-hosted AI Psychology Engine. This project demonstrates a modular full-stack architecture, secure data handling, and Retrieval-Augmented Generation (RAG).

---

## Technical Architecture

The system is built as a decoupled architecture to ensure scalability and maintainability:

* **Frontend**: A responsive React application providing interfaces for journaling, mood tracking, and AI interaction.
* **Backend**: A FastAPI-based REST API that manages data processing and coordinates the AI logic.
* **AI Engine**: A local RAG pipeline utilizing ChromaDB for vector storage and Llama 3 for intelligent, context-aware responses grounded in psychological data.

---

## Core Features

### AI Contextual Awareness (RAG)
Unlike standard chatbots, this system utilizes a vector database to index local text files. When a user asks a question, the system retrieves relevant psychological concepts to "ground" the AI's response in scientific theory.

### Behavioral Tracking
Includes modules for structured journaling and data logging, allowing users to monitor behavioral patterns over time.

### Local-First Privacy
All AI processing and vector storage occur locally via Ollama. This ensures that sensitive psychological data is never transmitted to third-party cloud providers.

---

## Tech Stack

### Frontend
* React.js
* Vite
* Tailwind CSS
* Lucide Icons

### Backend
* Python
* FastAPI
* Pydantic (Data Validation)
* Uvicorn (ASGI Server)

### AI and Data
* Ollama (Llama 3 Model)
* LangChain (Orchestration)
* ChromaDB (Vector Database)
* HuggingFace Embeddings (Sentence Transformers)

---

## Installation and Setup

### Prerequisites
* Python 3.10 or higher
* Node.js and npm
* Ollama installed and running locally

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
