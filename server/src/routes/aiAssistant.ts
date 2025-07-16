import express from 'express';

const router = express.Router();

const MODEL_FALLBACKS = [
  'deepseek/deepseek-chat-v3-0324:free',
  'meta-llama/llama-4-maverick:free',
  'google/gemini-2.0-flash-exp:free',
  'qwen/qwen-2.5-72b-instruct:free',
  'mistralai/mistral-7b-instruct:free',
  'microsoft/mai-ds-r1:free'
];

async function tryModel(model: string, messages: any[], apiKey: string) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'Retail Edge Zayra Assistant'
    },
    body: JSON.stringify({
      model,
      messages,
      max_tokens: 256,
      temperature: 0.2,
      top_p: 0.8
    })
  });

  const data = await response.json();
  if (response.ok && data.choices?.[0]?.message?.content) {
    return {
      success: true,
      content: data.choices[0].message.content,
      model: model,
      status: response.status
    };
  }
  return {
    success: false,
    error: data.error || 'Unknown error',
    model: model,
    status: response.status
  };
}

router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'OpenRouter API key not configured' });
    }

    const systemPrompt = `\nYou are Zayra, the Retail Edge Assistant. You must only answer questions that are specifically about the Retail Edge POS Management System, its features, and the data within this application. If asked anything else, politely reply: "I'm here to assist you with the Retail Edge POS Management System. Please ask questions related to this application and its data."

When providing instructions or guidance, always include a clear, step-by-step navigation path in the format:
**Home** > **[Section]** > **[Subsection]** > ... > **[Goal]**

Use Markdown bold formatting (double asterisks) for important texts, especially for each step in the navigation path and for key actions or terms.

For example, if a user asks how to find a product, your response should include:
**Home** > **Products** > **[Product Name]** > **[Action/Goal]**

Keep your responses concise, professional, and focused on helping the user achieve their goal within the application.`;

    const openRouterMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content }))
    ];

    let lastError = null;
    for (const model of MODEL_FALLBACKS) {
      try {
        const result = await tryModel(model, openRouterMessages, apiKey);
        if (result.success) {
          return res.json({ reply: result.content, model });
        } else {
          lastError = result.error;
        }
      } catch (error) {
        lastError = error;
      }
    }
    return res.status(503).json({ error: 'All AI models are currently unavailable. Please try again later.', details: lastError });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error', details: error instanceof Error ? error.message : error });
  }
});

export default router; 