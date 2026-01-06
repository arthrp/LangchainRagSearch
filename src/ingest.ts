import { QdrantVectorStore } from "@langchain/qdrant";
import { MistralAIEmbeddings } from "@langchain/mistralai";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import * as dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { QdrantClient } from "@qdrant/js-client-rest";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function collectionExists() {
  const client = new QdrantClient({
    url: process.env.QDRANT_URL || "http://127.0.0.1:6333",
  });

  try {
    await client.getCollection("langchain-rag");
    return true;
  } catch (err) {
    return false;
  }
}

export async function ingestData() {
  console.log("Starting ingestion...");

  const loader = new TextLoader(path.resolve(__dirname, "../article.md"));
  const rawDocs = await loader.load();

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const docs = await textSplitter.splitDocuments(rawDocs);

  console.log(`Split ${rawDocs.length} documents into ${docs.length} chunks.`);

  const embeddings = new MistralAIEmbeddings();

  const vectorStore = await QdrantVectorStore.fromDocuments(docs, embeddings, {
    url: process.env.QDRANT_URL || "http://localhost:6333",
    collectionName: "langchain-rag",
  });

  console.log("Ingestion completed successfully.");
  return vectorStore;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  ingestData().catch(console.error);
}

