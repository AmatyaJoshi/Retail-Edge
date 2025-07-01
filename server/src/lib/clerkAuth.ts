import clerk from '@clerk/clerk-sdk-node';

export async function createClerkUser({ email, password, firstName, lastName }: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}) {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error('CLERK_SECRET_KEY is not set in environment variables');
  }
  return clerk.users.createUser({
    emailAddress: [email],
    password,
    firstName,
    lastName,
  });
}

export async function authenticateClerkUser({ email, password }: {
  email: string;
  password: string;
}) {
  // Clerk does not provide direct password authentication in the backend SDK.
  // You should use Clerk's frontend SDK for session creation, or use the API for verification.
  // Here, we just fetch the user by email for backend checks.
  const users = await clerk.users.getUserList({ emailAddress: [email] });
  if (users.length === 0) throw new Error('User not found');
  return users[0];
} 