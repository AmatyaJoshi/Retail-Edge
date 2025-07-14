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
 * Send Email OTP using Appwrite Auth API
 * Uses Appwrite's Email OTP authentication system (no password required)
 * This does NOT create a verified user - just sends OTP for verification
 */
export async function sendEmailOTP(email: string): Promise<{ success: boolean; message: string; userId?: string; secret?: string }> {
  try {
    // Create a client with API key (required for createEmailToken)
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID || '')
      .setKey(process.env.APPWRITE_API_KEY || '');
    
    const account = new Account(client);
    
    console.log('Appwrite configuration:');
    console.log('- Endpoint:', process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1');
    console.log('- Project ID:', process.env.APPWRITE_PROJECT_ID || '');
    console.log('- API Key:', process.env.APPWRITE_API_KEY ? '***' : 'undefined');
    
    // Send Email OTP using Appwrite's createEmailToken method
    // This will create a temporary account for OTP verification
    // The user is NOT verified until they complete registration
    console.log('Calling account.createEmailToken for email:', email);
    const sessionToken = await account.createEmailToken(
      ID.unique(),
      email
    );
    
    console.log('Appwrite createEmailToken response:', sessionToken);
    console.log('Email OTP sent successfully for:', email);
    console.log('userId:', sessionToken.userId);
    console.log('secret:', sessionToken.secret);
    console.log('secret type:', typeof sessionToken.secret);
    console.log('secret length:', sessionToken.secret ? sessionToken.secret.length : 0);
    
    // Validate the response
    if (!sessionToken.userId) {
      throw new Error('Appwrite returned empty userId');
    }
    
    if (!sessionToken.secret || sessionToken.secret.trim() === '') {
      throw new Error('Appwrite returned empty secret - Email OTP may not be configured properly');
    }
    
    return {
      success: true,
      message: 'Email OTP sent successfully',
      userId: sessionToken.userId,
      secret: sessionToken.secret
    };
  } catch (error: any) {
    console.error('Error sending Email OTP:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      response: error.response,
      stack: error.stack
    });
    return {
      success: false,
      message: error.message || 'Failed to send Email OTP'
    };
  }
}

/**
 * Verify Email OTP using Appwrite Auth API
 * Uses Appwrite's Email OTP verification system (no password required)
 * This only verifies the OTP, does not mark email as verified in Appwrite
 */
export async function verifyEmailOTP(userId: string, secret: string): Promise<{ success: boolean; message: string; session?: any }> {
  try {
    // Create a client for the user
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID || '');
    
    const account = new Account(client);
    
    // Verify the OTP by creating a session with userId and secret
    // No password required - the secret contains the OTP
    // This only verifies the OTP, does not mark email as verified
    const session = await account.createSession(
      userId,
      secret
    );
    
    console.log('Email OTP verified successfully for user:', userId);
    console.log('Note: Email is NOT marked as verified in Appwrite yet');
    
    return {
      success: true,
      message: 'Email OTP verified successfully',
      session: session
    };
  } catch (error: any) {
    console.error('Error verifying Email OTP:', error);
    return {
      success: false,
      message: error.message || 'Failed to verify Email OTP'
    };
  }
}

/**
 * Mark email as verified in Appwrite after successful registration
 * This should be called only after the user completes the full registration process
 */
export async function markEmailAsVerified(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    // Create a client with API key
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID || '')
      .setKey(process.env.APPWRITE_API_KEY || '');
    
    const users = new Users(client);
    
    // Update the user to mark email as verified
    await users.updateEmailVerification(userId, true);
    
    console.log('Email marked as verified in Appwrite for user:', userId);
    
    return {
      success: true,
      message: 'Email marked as verified successfully'
    };
  } catch (error: any) {
    console.error('Error marking email as verified:', error);
    return {
      success: false,
      message: error.message || 'Failed to mark email as verified'
    };
  }
}

/**
 * Update Appwrite user metadata (optional - for storing additional user info)
 * Only used if you want to store user data in Appwrite for reference
 */
export async function updateAppwriteUserMetadata(userId: string, metadata: {
  firstName?: string;
  lastName?: string;
  emailVerified?: boolean;
}): Promise<{ success: boolean; message: string }> {
  try {
    // Update user preferences/metadata in Appwrite
    await users.updatePrefs(userId, metadata);
    
    console.log('Appwrite user metadata updated successfully for:', userId);
    
    return {
      success: true,
      message: 'User metadata updated successfully'
    };
  } catch (error: any) {
    console.error('Error updating Appwrite user metadata:', error);
    return {
      success: false,
      message: error.message || 'Failed to update user metadata'
    };
  }
}
