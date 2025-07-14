import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { category, brand } = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/products/generate-sku`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ category, brand }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate SKU');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating SKU:', error);
    return NextResponse.json(
      { error: 'Failed to generate SKU' },
      { status: 500 }
    );
  }
} 