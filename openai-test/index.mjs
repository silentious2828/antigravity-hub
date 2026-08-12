import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const response = await client.responses.create({
  model: "gpt-5",
  input: "Say hello in one sentence.",
});

console.log(response.output_text);
