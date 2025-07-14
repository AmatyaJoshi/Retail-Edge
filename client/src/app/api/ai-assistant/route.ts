import { NextRequest, NextResponse } from 'next/server';

// Define a list of models to try in order of preference
const MODEL_FALLBACKS = [
  'deepseek/deepseek-chat-v3-0324:free',  // Your current choice
  'meta-llama/llama-4-maverick:free',     // Original choice
  'google/gemini-2.0-flash-exp:free',                 // Reliable fallback
  'qwen/qwen-2.5-72b-instruct:free',             // Another good option
  'mistralai/mistral-7b-instruct:free',       // good model
  'microsoft/mai-ds-r1:free'            // Microsoft model  
];

// Function to try a specific model
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
  
  // Check if the response is successful
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

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    // Compose the system prompt for Zayra
    const systemPrompt = `
You are Zayra, the Retail Edge Assistant. You must only answer questions that are specifically about the Retail Edge POS Management System, its features, and the data within this application. If asked anything else, politely reply: "I'm here to assist you with the Retail Edge POS Management System. Please ask questions related to this application and its data."

When providing instructions or guidance, always include a clear, step-by-step navigation path in the format:
**Home** > **[Section]** > **[Subsection]** > ... > **[Goal]**

Use Markdown bold formatting (double asterisks) for important texts, especially for each step in the navigation path and for key actions or terms.

For example, if a user asks how to find a product, your response should include:
**Home** > **Products** > **[Product Name]** > **[Action/Goal]**

Keep your responses concise, professional, and focused on helping the user achieve their goal within the application.`;

    // Prepare messages for OpenRouter
    const openRouterMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map((m: any) => ({
        role: m.role,
        content: m.content
      }))
    ];

    // Try each model in order until one works
    let lastError = null;
    
    for (const model of MODEL_FALLBACKS) {
      try {
        console.log(`🔄 Trying model: ${model}`);
        
        const result = await tryModel(model, openRouterMessages, apiKey);
        
        if (result.success) {
          console.log(`✅ Success with model: ${model}`);
          return NextResponse.json({ 
            reply: result.content,
            model: model // Optional: include which model was used
          });
        } else {
          console.log(`❌ Failed with model: ${model} - Status: ${result.status} - Error: ${result.error}`);
          lastError = result.error;
        }
      } catch (error) {
        console.log(`❌ Exception with model: ${model} - ${error}`);
        lastError = error;
      }
    }

    // If all models fail, return an error
    console.error('❌ All models failed. Last error:', lastError);
    return NextResponse.json(
      { 
        error: 'All AI models are currently unavailable. Please try again later.',
        details: lastError
      },
      { status: 503 }
    );

  } catch (error) {
    console.error('AI Assistant API Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 