import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { otp, phoneNumber } = await request.json();

    if (!otp || !phoneNumber) {
      return NextResponse.json(
        { error: 'OTP and phone number are required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${process.env.SERVER_URL}/api/auth/verify-otp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ otp, phoneNumber }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to verify OTP');
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json(
      { error: 'Failed to verify OTP', details: error.message },
      { status: 500 }
    );
  }
} 