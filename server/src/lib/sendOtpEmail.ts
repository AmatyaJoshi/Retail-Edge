import { Client, Messaging, ID, Users, Query } from 'node-appwrite';

const client = new Client();

// Make sure to check environment variables and provide defaults for development
if (!process.env.APPWRITE_ENDPOINT || !process.env.APPWRITE_PROJECT_ID || !process.env.APPWRITE_API_KEY) {
  console.error('Appwrite configuration missing. Check your environment variables.');
}

client.setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://cloud.appwrite.io/v1')
      .setProject(process.env.APPWRITE_PROJECT_ID || '')
      .setKey(process.env.APPWRITE_API_KEY || '');

const messaging = new Messaging(client);
const users = new Users(client);

/**
 * Enterprise-grade OTP email sender using Appwrite
 * Creates a temporary user in Appwrite and sends an OTP via email
 * 
 * @param to - Email address to send the OTP to
 * @param otp - The OTP code to send
 * @returns Boolean indicating success or failure
 */
export async function sendOtpEmail({ to, otp }: { to: string; otp: string }): Promise<boolean> {
  const subject = 'Your Verification Code';
  const content = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <h2 style="color: #4a5568; text-align: center;">Your Verification Code</h2>
      <div style="background-color: #f7fafc; padding: 15px; border-radius: 4px; text-align: center; margin: 20px 0;">
        <h1 style="color: #4299e1; letter-spacing: 5px; font-size: 32px;">${otp}</h1>
      </div>
      <p style="color: #4a5568; line-height: 1.5;">This code is valid for <strong>5 minutes</strong>. If you didn't request this code, please ignore this email.</p>
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #718096; font-size: 12px; text-align: center;">
        <p>This is an automated message, please do not reply.</p>
      </div>
    </div>
  `;
  
  let userId: string | null = null;
  
  try {
    // Clean up any existing user first to avoid conflicts
    await deleteAppwriteUserByEmail(to);
    
    // Create a new temporary user
    try {
      const newUser = await users.create(ID.unique(), to, undefined, to);
      userId = newUser.$id;
      console.log(`Created temporary Appwrite user for OTP delivery: ${userId}`);
    } catch (createError: any) {
      console.error('Error creating Appwrite user:', createError);
      
      if (createError.type === 'user_already_exists' || createError.code === 409) {
        // If user already exists despite our cleanup, try to fetch and use it
        const userList = await users.list([Query.equal('email', to)]);
        if (userList.total > 0) {
          userId = userList.users[0].$id;
          console.log(`Using existing Appwrite user for OTP delivery: ${userId}`);
        } else {
          throw new Error('User exists according to error but could not be found');
        }
      } else {
        throw createError;
      }
    }

    if (!userId) {
      throw new Error('No userId found for OTP email');
    }

    // Send the email with OTP
    const emailResult = await messaging.createEmail(
      ID.unique(),  // Unique ID for this email
      subject,      // Email subject
      content,      // HTML content
      [],           // Topics (not used)
      [userId],     // Target users by ID
      [],           // Additional targets (not used)
      [],           // CC recipients (not used)
      [],           // BCC recipients (not used)
      [],           // Attachments (not used)
      false,        // Is draft?
      true          // Is HTML?
    );

    console.log(`OTP email sent successfully to ${to} with message ID: ${emailResult.$id}`);
    return true;
  } catch (error: any) {
    console.error('Appwrite sendOtpEmail error:', error);
    
    // Cleanup on error
    if (userId) {
      try {
        await users.delete(userId);
        console.log(`Cleaned up Appwrite user ${userId} after error`);
      } catch (cleanupError) {
        console.error('Error cleaning up Appwrite user after error:', cleanupError);
      }
    }
    
    return false;
  }
}

/**
 * Enterprise-grade utility to delete Appwrite user by email
 * Used for cleanup during OTP operations
 * 
 * @param email - Email address of the user to delete
 * @returns Boolean indicating success or failure
 */
export async function deleteAppwriteUserByEmail(email: string): Promise<boolean> {
  try {
    // Find all users matching the email
    const userList = await users.list([Query.equal('email', email)]);
    
    if (userList.total === 0) {
      console.log(`No Appwrite user found with email: ${email}`);
      return true; // No user to delete is still a success
    }
    
    // Delete all matching users (should normally be just one)
    let deletedCount = 0;
    for (const user of userList.users) {
      try {
        await users.delete(user.$id);
        deletedCount++;
        console.log(`Deleted Appwrite user with ID: ${user.$id} and email: ${email}`);
      } catch (deleteErr: any) {
        console.error(`Error deleting Appwrite user ${user.$id}:`, deleteErr);
      }
    }
    
    console.log(`Deleted ${deletedCount}/${userList.total} Appwrite users for email: ${email}`);
    return deletedCount === userList.total;
  } catch (err) {
    console.error(`Error deleting Appwrite users for email: ${email}`, err);
    return false;
  }
}
