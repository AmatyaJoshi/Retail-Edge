import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    // Compose the prompt with context and restriction
    const systemPrompt = `
You are Zayra, the Retail Edge AI Assistant. You can help users with:

1. **Product Information**: Answer questions about product prices, stock levels, descriptions, and details
2. **Customer Information**: Provide customer details, contact information, and history
3. **Sales & Analytics**: Share sales data, revenue information, and business metrics
4. **Inventory Management**: Help with stock levels, product categories, and inventory value
5. **Expense Tracking**: Provide expense information and spending analytics
6. **Associate Management**: Help with supplier/vendor information and relationships
7. **General Application Help**: Guide users on how to use the Retail Edge POS system features

If a user asks about specific data (like "What is the price of Carrera 6006/S?" or "Tell me about customer John Smith"), I will provide that information directly from the current page data.

For general questions about the application, I provide helpful guidance on features and usage.

If asked anything unrelated to the Retail Edge system, politely reply: "I'm here to assist you with the Retail Edge POS Management System. Please ask questions related to this application or its data."
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
    
    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 