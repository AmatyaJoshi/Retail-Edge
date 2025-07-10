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
 * Sends an OTP email using Appwrite's Messaging API directly to the email address (no user creation).
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

  try {
    // Send the email directly to the address (no user creation)
    await messaging.createEmail(
      ID.unique(),  // Unique ID for this email
      subject,      // Email subject
      content,      // HTML content
      [],           // Topics (not used)
      [],           // Target users by ID (not used)
      [to],         // Target emails directly
      [],           // CC
      [],           // BCC
      [],           // Attachments
      false,        // Is draft?
      true          // Is HTML?
    );
    console.log(`OTP email sent successfully to ${to}`);
    return true;
  } catch (error: any) {
    console.error('Appwrite sendOtpEmail error:', error);
    return false;
  }
}

/**
 * Delete an Appwrite user by email address
 * @param email - Email address of the user to delete
 * @returns Boolean indicating success or failure
 */
export async function deleteAppwriteUserByEmail(email: string): Promise<boolean> {
  try {
    // Find the user by email
    const userList = await users.list([Query.equal('email', email)]);
    
    if (userList.total === 0) {
      console.log(`No Appwrite user found with email: ${email}`);
      return true; // Consider this a success since the goal is achieved (no user exists)
    }
    
    // Delete the user
    const user = userList.users[0];
    await users.delete(user.$id);
    console.log(`Successfully deleted Appwrite user with ID: ${user.$id} for email: ${email}`);
    return true;
  } catch (error: any) {
    console.error('Error deleting Appwrite user by email:', error);
    return false;
  }
}
