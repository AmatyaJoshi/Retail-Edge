import fetch from 'node-fetch';

export async function markClerkEmailAsVerified(clerkUserId: string) {
  const apiKey = process.env.CLERK_SECRET_KEY;
  if (!apiKey) throw new Error('CLERK_SECRET_KEY is not set in environment variables');
  const url = `https://api.clerk.com/v1/users/${clerkUserId}`;
  const res = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email_address: { verified: true }
    })
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to mark Clerk email as verified: ${error}`);
  }
  return await res.json();
}

export async function createClerkUserWithVerifiedEmail({ email, password, firstName, lastName }: { email: string; password: string; firstName: string; lastName: string }) {
  const apiKey = process.env.CLERK_SECRET_KEY;
  if (!apiKey) throw new Error('CLERK_SECRET_KEY is not set in environment variables');
  const url = 'https://api.clerk.com/v1/users';
  const body = {
    email_address: [email], // array of strings as required by Clerk
    password,
    first_name: firstName,
    last_name: lastName
  };
  console.log('Clerk user creation request body:', JSON.stringify(body));
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Failed to create Clerk user: ${error}`);
  }
  return await res.json();
} 