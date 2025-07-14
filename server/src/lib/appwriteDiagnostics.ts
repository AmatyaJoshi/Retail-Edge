import { Client, Users, Account, ID } from 'node-appwrite';

export async function diagnoseAppwriteConfiguration() {
  console.log('=== Appwrite Configuration Diagnostics ===');
  
  // Check environment variables
  console.log('\n1. Environment Variables:');
  console.log('- APPWRITE_ENDPOINT:', process.env.APPWRITE_ENDPOINT || 'NOT SET');
  console.log('- APPWRITE_PROJECT_ID:', process.env.APPWRITE_PROJECT_ID || 'NOT SET');
  console.log('- APPWRITE_API_KEY:', process.env.APPWRITE_API_KEY ? 'SET (hidden)' : 'NOT SET');
  
  if (!process.env.APPWRITE_ENDPOINT || !process.env.APPWRITE_PROJECT_ID || !process.env.APPWRITE_API_KEY) {
    console.log('\n❌ ERROR: Missing required environment variables!');
    return false;
  }
  
  try {
    // Test basic connection
    console.log('\n2. Testing Appwrite Connection:');
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT)
      .setProject(process.env.APPWRITE_PROJECT_ID)
      .setKey(process.env.APPWRITE_API_KEY);
    
    const users = new Users(client);
    
    // Try to list users (this will test if the API key has proper permissions)
    try {
      const userList = await users.list([], '1');
      console.log('✅ Successfully connected to Appwrite');
      console.log('- Total users in project:', userList.total);
    } catch (error: any) {
      console.log('❌ Failed to connect to Appwrite:', error.message);
      console.log('This might indicate:');
      console.log('- Invalid API key');
      console.log('- API key lacks proper permissions');
      console.log('- Invalid project ID');
      return false;
    }
    
    // Test Email OTP functionality
    console.log('\n3. Testing Email OTP Configuration:');
    const testEmail = `test-${Date.now()}@example.com`;
    
    const account = new Account(client);
    
    try {
      console.log('Attempting to create Email OTP for:', testEmail);
      const sessionToken = await account.createEmailToken(
        ID.unique(),
        testEmail
      );
      
      console.log('✅ Email OTP created successfully!');
      console.log('- userId:', sessionToken.userId);
      console.log('- secret length:', sessionToken.secret ? sessionToken.secret.length : 0);
      console.log('- secret preview:', sessionToken.secret ? `${sessionToken.secret.substring(0, 10)}...` : 'EMPTY');
      
      if (!sessionToken.secret || sessionToken.secret.trim() === '') {
        console.log('\n❌ PROBLEM: Secret is empty!');
        console.log('This indicates that Email OTP is not properly configured in your Appwrite project.');
        console.log('\nTo fix this, you need to:');
        console.log('1. Go to your Appwrite Console');
        console.log('2. Navigate to your project');
        console.log('3. Go to "Auth" → "Settings"');
        console.log('4. Enable "Email OTP" authentication method');
        console.log('5. Configure your email provider (SMTP settings)');
        console.log('6. Save the settings');
        return false;
      }
      
      return true;
      
    } catch (error: any) {
      console.log('❌ Failed to create Email OTP:', error.message);
      console.log('Error code:', error.code);
      console.log('This might indicate:');
      console.log('- Email OTP not enabled in project settings');
      console.log('- Email provider not configured');
      console.log('- Invalid email format');
      return false;
    }
    
  } catch (error: any) {
    console.log('❌ Unexpected error during diagnostics:', error.message);
    return false;
  }
}

export async function testEmailOTPFlow(email: string) {
  console.log(`\n=== Testing Email OTP Flow for ${email} ===`);
  
  try {
    const client = new Client()
      .setEndpoint(process.env.APPWRITE_ENDPOINT!)
      .setProject(process.env.APPWRITE_PROJECT_ID!)
      .setKey(process.env.APPWRITE_API_KEY!);
    
    const account = new Account(client);
    
    // Step 1: Create Email OTP
    console.log('1. Creating Email OTP...');
    const sessionToken = await account.createEmailToken(
      ID.unique(),
      email
    );
    
    console.log('✅ Email OTP created');
    console.log('- userId:', sessionToken.userId);
    console.log('- secret length:', sessionToken.secret ? sessionToken.secret.length : 0);
    
    if (!sessionToken.secret || sessionToken.secret.trim() === '') {
      console.log('❌ Secret is empty - Email OTP not configured properly');
      return false;
    }
    
    // Step 2: Verify Email OTP (this would normally be done with user input)
    console.log('2. Email OTP verification would happen here with user input');
    console.log('The secret contains the OTP that the user needs to enter');
    
    return {
      success: true,
      userId: sessionToken.userId,
      secret: sessionToken.secret
    };
    
  } catch (error: any) {
    console.log('❌ Error in Email OTP flow:', error.message);
    return false;
  }
} 