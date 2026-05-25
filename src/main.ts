import dotenv from "dotenv";
import { OpenRouter } from "@openrouter/sdk";
import { getCustomerIntent } from "./prompt/step.one.js";
import { mapQueryToCategories } from "./prompt/step.two.js";
import { getStepThreePrompt } from "./prompt/step.three.js";
import { getStepFourPrompt } from "./prompt/step.four.js";
import { getStepFivePrompt } from "./prompt/step.five.js";
import { ChatMessages } from "@openrouter/sdk/models";
dotenv.config();

const apiKey = process.env.OPENROUTER_API_KEY;
const model = process.env.MODEL_NAME;

// type Message = { role: "system" | "user" | "assistant"; content: string };

const client = new OpenRouter({
  apiKey: apiKey,
});

async function callModel(messages: ChatMessages[]) {
  console.log();
  console.log();
  console.log("Generating response from OpenRouter...");

  const response = await client.chat.send({
    chatRequest: {
      model,
      messages,
    },
  });

  return response.choices[0].message.content;
}

async function callOpenRouter(messages: ChatMessages[]) {
  console.log();
  console.log();
  console.log("Generating response from OpenRouter...");
  // API call with reasoning
  const response = await fetch(
    "https://openrouter.ai/api/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model,
        messages,
        reasoning: { enabled: true },
      }),
    },
  );

  // Extract the assistant message
  const result: any = await response.json();
  if (result.error) {
    console.log(result);
    throw new Error(result.error.message);
  }

  const assistantMessage = result.choices[0].message.content;

  return assistantMessage;
}

async function submitPrompt(customerQuery: string) {
  // step 1: Interpret the customer's intent
  const step1 = getCustomerIntent(customerQuery);
  const stepOneResponse = await callOpenRouter([
    { role: "system", content: step1.system },
    { role: "user", content: step1.user },
  ]);
  console.log(`Step One - Customer's Intent: ${stepOneResponse}`);

  // step 2: Map the query to possible categories
  const step2 = mapQueryToCategories({ customerQuery, stepOneResponse });
  const stepTwoResponse = await callOpenRouter([
    { role: "system", content: step2.system },
    { role: "user", content: step2.user },
  ]);
  console.log(`Step Two - Category Mapping: ${stepTwoResponse}`);

  // step 3: Choose the single best category
  const step3 = getStepThreePrompt({
    customerQuery,
    stepOneResponse,
    stepTwoResponse,
  });
  const stepThreeResponse = await callOpenRouter([
    { role: "system", content: step3.system },
    { role: "user", content: step3.user },
  ]);
  console.log(`Step Three - Best Category: ${stepThreeResponse}`);

  // step 4: Extract additional details
  const step4 = getStepFourPrompt({
    customerQuery,
    stepOneResponse,
    stepThreeResponse,
  });
  const stepFourResponse = await callOpenRouter([
    { role: "system", content: step4.system },
    { role: "user", content: step4.user },
  ]);
  console.log(`Step Four - Extracted Details: ${stepFourResponse}`);

  // step 5: Generate the customer-facing response
  const step5 = getStepFivePrompt({
    customerQuery,
    stepOneResponse,
    stepThreeResponse,
    stepFourResponse,
  });
  const stepFiveResponse = await callOpenRouter([
    { role: "system", content: step5.system },
    { role: "user", content: step5.user },
  ]);
  console.log("\n========================================");
  console.log("         FINAL RESPONSE TO CUSTOMER");
  console.log("========================================");
  console.log(stepFiveResponse);
  console.log("========================================\n");
}

const customerQuery = process.argv[2];

if (!customerQuery) {
  console.error("Please provide a customer query as a CLI argument.");
  console.error('Example: npm run dev "I got charged a $10 fee"');
  process.exit(1);
}

submitPrompt(customerQuery);
