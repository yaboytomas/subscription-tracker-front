require('dotenv').config();
const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Using Resend's default domain
const SENDER_EMAIL = 'Subscription Tracker <onboarding@resend.dev>'; // Using Resend's default domain

// Test sending an email
async function testEmail() {
  try {
    console.log('Testing email with Resend default domain...');
    console.log('Using Resend API key:', process.env.RESEND_API_KEY);
    console.log('From:', SENDER_EMAIL);
    
    // Based on the error, we must send to the verified email only
    const testRecipient = 'tomasszabo94@gmail.com'; // Your verified email address
    
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to: testRecipient,
      subject: 'Test Email',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email sent from Subscription Tracker.</p>
        <p>If you're seeing this, your email configuration is working correctly!</p>
      `
    });
    
    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send test email:', error);
    return { success: false, error };
  }
}

// Run the test
testEmail(); 