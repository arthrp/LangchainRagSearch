# LangChain RAG Agent with Qdrant (Mistral AI)

This project implements a simple RAG (Retrieval-Augmented Generation) agent using LangChain, Mistral AI, and Qdrant. It doesn't use the 2-step RAG, it simply connects knowledge base as a tool that agent can use.

## Setup

1. **Launch Qdrant:**
   ```bash
   docker-compose up -d
   ```

2. **Configure Environment:**
   Create a `.env` file in the root directory and add your Mistral AI API key:
   ```env
   MISTRAL_API_KEY=your_mistral_api_key_here
   ```

3. **Install Dependencies:**
   ```bash
   npm install
   ```

## Usage

Run the agent:
```bash
npm start
```

The agent will:
1. Load data from `article.md`.
2. Split the text into chunks.
3. Store the embeddings in Qdrant.
4. Start a chat interface where you can ask questions about the document (specifically about Aðalbrandr).

