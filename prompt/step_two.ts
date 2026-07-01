interface stepTwoPromptPayload {
  customerQuery: string;
  stepOneResponse: string;
}

export const categories = [
  "Account Opening",
  "Billing Issue",
  "Account Access",
  "Transaction Inquiry",
  "Card Services",
  "Account Statement",
  "Loan Inquiry",
  "General Information",
];

export const mapQueryToCategories = ({
  customerQuery,
  stepOneResponse: customersIntent,
}: stepTwoPromptPayload) => ({
  system: `You are a professional banking support assistant. You are precise, empathetic, and never make promises on behalf of the bank.

You have already determined that the customer's intent is: "${customersIntent}"

Available categories: ${categories.join(", ")}

Your task is to map the customer's query to one or more categories from the list above that could apply.

Rules:
- Return your answer as a JSON array of category name strings. Example: ["Account Access", "Card Services"]
- Only use category names from the list above — do not invent new ones.
- Do not include any explanation or text outside the JSON array.`,
  user: customerQuery,
});
