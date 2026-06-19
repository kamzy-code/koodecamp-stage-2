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

async function callLLM(messages: ChatMessages[]) {
  const response = await client.chat.send({
    chatRequest: {
      model,
      messages,
    },
  });

  return response.choices[0].message.content;
}


async function submitPrompt(customerQuery: string) {
  // step 1: Interpret the customer's intent
  const step1 = getCustomerIntent(customerQuery);
  const stepOneResponse = await callLLM([
    { role: "system", content: step1.system },
    { role: "user", content: step1.user },
  ]);
  console.log(`Step One - Customer's Intent: ${stepOneResponse}`);

  // step 2: Map the query to possible categories
  const step2 = mapQueryToCategories({ customerQuery, stepOneResponse });
  const stepTwoResponse = await callLLM([
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
  const stepThreeResponse = await callLLM([
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
  const stepFourResponse = await callLLM([
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
  const stepFiveResponse = await callLLM([
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
