import { NextRequest } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export async function GET(req: NextRequest) {
  const res = await fetch(`${BACKEND_URL}/api/products/purchase-orders`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status });
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const res = await fetch(`${BACKEND_URL}/api/products/purchase-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status });
}

export async function PUT(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  if (!orderId) {
    return new Response(JSON.stringify({ error: 'Missing orderId in query params' }), { status: 400 });
  }
  const body = await req.text();
  const res = await fetch(`${BACKEND_URL}/api/products/purchase-orders/${orderId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body,
  });
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status });
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  if (!orderId) {
    return new Response(JSON.stringify({ error: 'Missing orderId in query params' }), { status: 400 });
  }
  const res = await fetch(`${BACKEND_URL}/api/products/purchase-orders/${orderId}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
  });
  if (res.status === 204) {
    return new Response(null, { status: 204 });
  }
  const data = await res.json();
  return new Response(JSON.stringify(data), { status: res.status });
} 