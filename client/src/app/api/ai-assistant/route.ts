import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // Compose the system prompt for Zayra
    const systemPrompt = `
You are Zayra, the Retail Edge Assistant. You must only answer questions that are specifically about the Retail Edge POS Management System, its features, and the data within this application. If asked anything else, politely reply: "I'm here to assist you with the Retail Edge POS Management System. Please ask questions related to this application and its data."

When providing instructions or guidance, always include a clear, step-by-step navigation path in the format:
**Home** > **[Section]** > **[Subsection]** > ... > **[Goal]**

Use Markdown bold formatting (double asterisks) for important texts, especially for each step in the navigation path and for key actions or terms.

For example, if a user asks how to find a product, your response should include:
**Home** > **Products** > **[Product Name]** > **[Action/Goal]**

Keep your responses concise, professional, and focused on helping the user achieve their goal within the application.`;

    // Prepare messages for OpenRouter (OpenAI-compatible format)
    const openRouterMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content
      }))
    ];

    const openRouterRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': 'http://localhost:3000', // update to your production domain if needed
        'X-Title': 'Retail Edge Zayra Assistant'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-4-maverick:free',
        messages: openRouterMessages,
        max_tokens: 256,
        temperature: 0.2,
        top_p: 0.8
      })
    });

    const data = await openRouterRes.json();
    const reply = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
    
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('AI Assistant API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 