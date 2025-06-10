import { sendEmail } from './config/email';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
const envPath = path.resolve(__dirname, '../.env');
console.log('Looking for .env file at:', envPath);
dotenv.config({ path: envPath });

// Debug: Print environment variables
console.log('Environment variables loaded:', {
  RESEND_API_KEY: process.env.RESEND_API_KEY ? 'Present (hidden)' : 'Not found',
  NODE_ENV: process.env.NODE_ENV,
});

const testEmail = async () => {
  try {
    const testHtml = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <h2 style="color: #0056b3;">Test Email from RetailEdge</h2>
        <p>Hello,</p>
        <p>This is a test email to verify that our email configuration is working correctly.</p>
        <p>If you're receiving this email, it means our Resend integration is working properly!</p>
        <p>Thank you,<br>The RetailEdge Team</p>
      </div>
    `;

    await sendEmail(
      'retailedgeoperations@gmail.com',
      'Test Email from RetailEdge',
      testHtml
    );

    console.log('Test email sent successfully!');
  } catch (error) {
    console.error('Failed to send test email:', error);
  }
};

// Run the test
testEmail(); 