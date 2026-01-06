import { tool, createAgent as langchainCreateAgent, dynamicSystemPromptMiddleware } from "langchain";
import { z } from "zod";
import { ChatMistralAI, MistralAIEmbeddings } from "@langchain/mistralai";
import { QdrantVectorStore } from "@langchain/qdrant";
import * as dotenv from "dotenv";

dotenv.config();

/**
 * Creates and returns a LangChain agent configured to answer questions about Aðalbrandr.
 */
export async function createAgent() {
  const model = new ChatMistralAI({
    modelName: "mistral-large-latest",
    temperature: 0,
  });

  const embeddings = new MistralAIEmbeddings();

  const vectorStore = await QdrantVectorStore.fromExistingCollection(embeddings, {
    url: process.env.QDRANT_URL || "http://localhost:6333",
    collectionName: "langchain-rag",
  });

  const searchAdalbrandr = tool(
    async ({ query }) => {
      const results = await vectorStore.similaritySearch(query, 3);
      return results.map(r => r.pageContent).join("\n\n");
    },
    {
      name: "search_adalbrandr",
      description: "Search for information about Aðalbrandr (Adalbrandr the Tall), a legendary Viking chieftain.",
      schema: z.object({
        query: z.string().describe("The search query to look for in the Aðalbrandr lore."),
      }),
    }
  );

  const systemPromptMiddleware = dynamicSystemPromptMiddleware(
    () => "You are a helpful assistant that answers questions about Aðalbrandr using the provided search tool. Always use the search tool to find information if you don't know the answer."
  );

  const agent = langchainCreateAgent({
    model,
    tools: [searchAdalbrandr],
    middleware: [systemPromptMiddleware],
  });

  return agent;
}
