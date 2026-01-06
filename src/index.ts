import { collectionExists, ingestData } from "./ingest.js";
import { createAgent } from "./agent.js";
import * as dotenv from "dotenv";
import * as readline from "readline";
import { HumanMessage, AIMessage, BaseMessage } from "@langchain/core/messages";

dotenv.config();

if (!process.env.MISTRAL_API_KEY) {
    console.error("Please set MISTRAL_API_KEY in your environment.");
    process.exit(1);
}

try {
    const exists = await collectionExists();
    console.log(`Collection exists: ${exists}`);

    if(!exists){
        console.log("Initializing vector store...");
        await ingestData();
    }
}
catch (error) {
    console.error("Error during ingestion:", error);
}

console.log("Creating agent...");
const executor = await createAgent();
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

const chatHistory: BaseMessage[] = [];
console.log("\nAgent is ready! Ask me anything about Aðalbrandr (type 'exit' to quit).");

const askQuestion = () => {
        rl.question("\nYou: ", async (input) => {
            if (input.toLowerCase() === "exit" || input.toLowerCase() === "quit") {
                rl.close();
                return;
            }
            try {
                const response = await executor.invoke({
                    messages: [...chatHistory, new HumanMessage(input)],
                });
                
                const messages = response.messages;
                const lastMessage = messages[messages.length - 1];
                
                if (!lastMessage) {
                    throw new Error("No response from agent");
                }

                const output = typeof lastMessage.content === "string"
                    ? lastMessage.content
                    : JSON.stringify(lastMessage.content);

                console.log(`\nAgent: ${output}`);
                
                // Update chat history with all messages from the response
                chatHistory.splice(0, chatHistory.length, ...messages);
            }
            catch (error) {
                console.error("Error during agent execution:", error);
            }
            askQuestion();
        });
    };
    askQuestion();