import config from '../config';

const generateAiResponse = async (prompt: string): Promise<string> => {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${config.ai_api_key}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3-8b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const rawJsonOutput = await response.json() as { choices: { message: { content: string } }[] };
  return rawJsonOutput.choices[0].message.content;
};

export const aiHelper = {
  generateAiResponse,
};
