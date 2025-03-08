// This is a script to test the email service directly
const dotenv = require('dotenv');
const path = require('path');
const { Resend } = require('resend');

// Load environment variables
dotenv.config({ path: '.env.local' });

const resend = new Resend(process.env.RESEND_API_KEY);

// Change to your actual email address
const TEST_EMAIL = 'tomasszabo94@gmail.com';

async function sendTestEmail() {
  try {
    console.log('Testing email service directly using Resend...');
    console.log(`RESEND_API_KEY is ${process.env.RESEND_API_KEY ? 'set' : 'not set'}`);
    console.log(`Sending test email to ${TEST_EMAIL}...`);
    
    const data = await resend.emails.send({
      from: 'Subscription Tracker <onboarding@resend.dev>',
      to: TEST_EMAIL,
      subject: 'Test Email from Subscription Tracker',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from Subscription Tracker.</p>
        <p>If you're seeing this, the email service is working correctly!</p>
      `
    });
    
    console.log('Email API response:', data);
    
    if (data.error) {
      console.error('❌ Failed to send email:', data.error.message);
      return { success: false, error: data.error };
    } else {
      console.log('✅ Email sent successfully! Check your inbox.');
      return { success: true, data };
    }
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return { success: false, error };
  }
}

// Run the test
sendTestEmail(); 