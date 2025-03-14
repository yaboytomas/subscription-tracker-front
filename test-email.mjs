import { Resend } from 'resend';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Your verified email address
const testEmail = 'tomasszabo94@gmail.com';

async function testResendEmail() {
  console.log('Starting basic Resend email test...');
  console.log(`Will send test email to: ${testEmail}`);
  console.log('Resend API Key:', process.env.RESEND_API_KEY ? 'Present (first few chars: ' + 
    process.env.RESEND_API_KEY.substring(0, 3) + '...)' : 'MISSING');

  try {
    // Send a basic test email
    console.log('\n--- Sending Basic Test Email ---');
    
    const data = await resend.emails.send({
      from: 'Subscription Tracker <noreply@zabotec.com>',
      to: testEmail,
      subject: 'Test Email - Diagnosing Email Issues',
      html: `
        <h1>Email Test</h1>
        <p>This is a test email to diagnose email delivery issues.</p>
        <p>If you're seeing this, the basic Resend functionality is working.</p>
        <p>Time sent: ${new Date().toLocaleString()}</p>
      `
    });
    
    console.log('Email Result:', JSON.stringify(data, null, 2));
    console.log('\nTest completed. Check your email inbox for the test message.');
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testResendEmail(); 