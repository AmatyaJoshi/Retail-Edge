import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { messages } = req.body;

  // Compose the prompt with context and restriction
  const systemPrompt = `
You are the Retail Edge Assistant. Only answer questions about the Retail Edge POS Management System, its features, and how to use it. If asked anything else, politely reply: "I'm here to assist you with the Retail Edge POS Management System. Please ask questions related to this application."
`;

  // Prepare the chat history for Gemini
  const history = [
    { role: 'user', parts: [{ text: systemPrompt }] },
    ...messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : m.role,
      parts: [{ text: m.content }]
    }))
  ];

  const geminiRes = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=' + process.env.GEMINI_API_KEY, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: history,
      generationConfig: {
        maxOutputTokens: 256,
        temperature: 0.2,
        topP: 0.8
      }
    })
  });

  const data = await geminiRes.json();
  const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
  res.status(200).json({ reply });
}
