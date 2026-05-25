# Bank Customer Support — Prompt Chain

A command-line application that processes a bank customer's free-text query through a 5-step AI prompt chain, moving from raw input to a structured, professional customer response.

---

## What it does

Rather than sending a customer's message directly to an AI and hoping for a good reply, this app breaks the problem into five focused reasoning steps — each one building on the last. This technique is called **prompt chaining**.

### The 5-step chain

| Step | Task | Output |
|------|------|--------|
| 1 | **Interpret intent** — understand what the customer is asking | Short intent phrase (3–4 words) |
| 2 | **Map to categories** — identify all categories that could apply | JSON array of possible categories |
| 3 | **Choose best category** — commit to the single most relevant category | One category name |
| 4 | **Extract details** — pull out structured data (amounts, dates, card type, etc.) | JSON object |
| 5 | **Generate response** — compose a professional reply based on all prior context | Customer-facing message |

### Available categories

- Account Opening
- Billing Issue
- Account Access
- Transaction Inquiry
- Card Services
- Account Statement
- Loan Inquiry
- General Information

### Example

**Input:**
```
"I got charged a $10 fee and I'd like to know what it is for"
```

**Step-by-step output:**
```
Step One   — Customer's Intent:  unknown fee inquiry
Step Two   — Category Mapping:   ["Billing Issue"]
Step Three — Best Category:      Billing Issue
Step Four  — Extracted Details:  {"amount": "$10", "accountNumber": null, ...}

========================================
         FINAL RESPONSE TO CUSTOMER
========================================
Thank you for reaching out about the $10 charge on your account — we completely understand your concern. I'll escalate this to a specialist who will review the charge and follow up with you shortly.
========================================
```

---

## How it works

Each step is a separate call to the language model with a clean `system` + `user` message pair:

- **System message** — contains the step's instructions plus any context accumulated from previous steps (intent, category, extracted details).
- **User message** — always the original customer query, unchanged.

This separation ensures the model knows exactly who it is, what it must do, and what the customer said — without any context bleeding between steps.

```
src/
├── main.ts              # Entry point — orchestrates the full chain
└── prompt/
    ├── step.one.ts      # Intent interpretation
    ├── step.two.ts      # Category mapping (+ categories list)
    ├── step.three.ts    # Best category selection
    ├── step.four.ts     # Detail extraction
    └── step.five.ts     # Response generation
```

---

## Setup

### Prerequisites

- [Node.js](https://nodejs.org/) v18 or higher
- An [OpenRouter](https://openrouter.ai/) account and API key

### 1. Clone the repository

```bash
git clone https://github.com/kamzy-code/koodecamp-stage-2
cd stage_2
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Open `.env` and set:

```env
OPENROUTER_API_KEY=your_openrouter_api_key_here
MODEL_NAME=your_model_name_here
```

> Your `.env` file is listed in `.gitignore` and will never be committed to the repository.

### 4. Run the app

Pass your customer query as the first CLI argument:

```bash
npm run dev "I got charged a $10 fee and I'd like to know what it is for"
```

Or build and run the compiled output:

```bash
npm run build
npm start -- "I got charged a $10 fee and I'd like to know what it is for"
```

---

## Dependencies

| Package | Purpose |
|---------|---------|
| `dotenv` | Loads environment variables from `.env` |
| `@openrouter/sdk` | OpenRouter SDK (used for TypeScript types) |
| `tsx` | Runs TypeScript files directly without a separate build step |
| `typescript` | TypeScript compiler |
| `@types/node` | Node.js type definitions |
