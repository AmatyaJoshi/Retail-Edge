import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { type } = await request.json();
    
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/products/generate-barcode`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ type }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate barcode');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error generating barcode:', error);
    return NextResponse.json(
      { error: 'Failed to generate barcode' },
      { status: 500 }
    );
  }
} 