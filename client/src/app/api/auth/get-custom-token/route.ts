import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { uid } = await request.json(); // Assuming UID is passed from client after Firebase auth

    if (!uid) {
      return NextResponse.json(
        { error: 'User UID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.SERVER_URL}/api/auth/get-custom-token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uid }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to get custom token');
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error getting custom token:', error);
    return NextResponse.json(
      { error: 'Failed to get custom token', details: error.message },
      { status: 500 }
    );
  }
} 