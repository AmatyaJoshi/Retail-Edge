import { Client, Users, ID, Query, Account } from 'node-appwrite';

// Set up Appwrite client
const client = new Client();

// Check environment variables
if (!process.env.APPWRITE_ENDPOINT || !process.env.APPWRITE_PROJECT_ID || !process.env.APPWRITE_API_KEY) {
  console.error('Appwrite configuration missing. Check your environment variables.');
}

client.setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
  .setProject(process.env.APPWRITE_PROJECT_ID || '')
  .setKey(process.env.APPWRITE_API_KEY || '');

const users = new Users(client);

/**
 * Create a new user in Appwrite
 * NOTE: Phone authentication is NOT used. Never send phone to Appwrite.
 */
export async function createAppwriteUser({
  email,
  password,
  firstName,
  lastName,
  emailVerified
}: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  emailVerified?: boolean;
}) {
  try {
    // Create a new user in Appwrite
    // DO NOT pass phone or any extra options
    const newUser = await users.create(
      ID.unique(),
      email,
      password,
      `${firstName} ${lastName}`
    );
    // Only update allowed metadata
    await users.updatePrefs(
      newUser.$id,
      {
        firstName,
        lastName,
        emailVerified: emailVerified === true
      }
    );
    console.log('Successfully created Appwrite user with ID:', newUser.$id);
    return newUser;
  } catch (error: any) {
    console.error('Error creating Appwrite user:', error);
    // Format error for better understanding
    const formattedError = {
      message: error.message || 'Unknown error creating user',
      code: error.code || 'unknown_error',
      status: error.code || 500,
      details: error.response || []
    };
    throw formattedError;
  }
}

/**
 * Generate a JWT session token for a user
 */
export async function generateAppwriteSession(userId: string, email: string, password: string): Promise<string> {
  try {
    // Create a temporary client for this user session
    const sessionClient = new Client();
    sessionClient
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID || '');
    
    // Create account instance
    const account = new Account(sessionClient);
    
    // Create a session
    const session = await account.createSession(email, password);
    
    // Get the JWT
    const jwt = await account.createJWT();
    
    return jwt.jwt;
  } catch (error: any) {
    console.error('Error generating Appwrite session:', error);
    throw new Error('Authentication failed');
  }
}

/**
 * Verify JWT token from Appwrite
 */
export function verifyAppwriteJWT(token: string): { 
  isValid: boolean; 
  reason?: string;
  parsedToken?: any;
} {
  try {
    // Check for empty or malformed token
    if (!token || typeof token !== 'string') {
      return { isValid: false, reason: 'Token is empty or malformed' };
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      return { isValid: false, reason: 'Invalid JWT format' };
    }

    // Decode the JWT payload
    const sessionData = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    
    // Check for required claims
    if (!sessionData.userId) {
      return { isValid: false, reason: 'Missing user ID claim' };
    }

    // Check token expiration
    const currentTime = Math.floor(Date.now() / 1000);
    if (sessionData.exp && currentTime > sessionData.exp) {
      return { 
        isValid: false, 
        reason: `Token expired at ${new Date(sessionData.exp * 1000).toISOString()}`,
        parsedToken: sessionData
      };
    }

    // All validations passed
    return { isValid: true, parsedToken: sessionData };
  } catch (error) {
    console.error('Error validating Appwrite JWT:', error);
    return { isValid: false, reason: 'Token validation error' };
  }
}

/**
 * Find Appwrite user by email
 */
export async function findAppwriteUserByEmail(email: string) {
  try {
    const userList = await users.list([Query.equal('email', email)]);
    
    if (userList.total === 0) {
      return null;
    }
    
    return userList.users[0];
  } catch (error) {
    console.error('Error finding Appwrite user by email:', error);
    return null;
  }
}

/**
 * Get Appwrite users instance
 */
export function getAppwriteUsers() {
  return users;
}

/**
 * Delete a user session
 */
export async function deleteAppwriteSession(token: string): Promise<boolean> {
  try {
    // Create a temporary client for this user session
    const sessionClient = new Client();
    sessionClient
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID || '');
    
    // Create account instance with the JWT
    const account = new Account(sessionClient);
    sessionClient.setJWT(token);
    
    // Delete the current session
    await account.deleteSession('current');
    
    return true;
  } catch (error) {
    console.error('Error deleting Appwrite session:', error);
    return false;
  }
}
