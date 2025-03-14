require('dotenv').config();
const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Using the verified domain
const SENDER_EMAIL = 'Subscription Tracker <noreply@zabotec.com>';
const RECIPIENT = 'tomas@zabotec.com'; // Using your own domain

// Test sending emails to your own domain
async function testZabotecEmailDelivery() {
  console.log('=================================================');
  console.log('📧 ZABOTEC.COM EMAIL DELIVERY TEST');
  console.log('=================================================');
  console.log(`Testing delivery to: ${RECIPIENT}`);
  console.log(`From: ${SENDER_EMAIL}`);
  console.log('=================================================');
  
  // Simple test email
  try {
    console.log('\n----- Sending test email to tomas@zabotec.com -----');
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to: RECIPIENT,
      subject: 'Test Email to Zabotec Domain',
      html: `
        <h1>Test Email to Zabotec.com</h1>
        <p>This is a test email sent from noreply@zabotec.com to tomas@zabotec.com.</p>
        <p>If you're receiving this email, it means your domain can both send and receive emails.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `
    });
    
    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Failed to send email:', error);
  }
  
  console.log('\n=================================================');
  console.log('NEXT STEPS:');
  console.log('=================================================');
  console.log('1. Check if you received the email at tomas@zabotec.com');
  console.log('2. If you received it, your domain\'s email system is working correctly');
  console.log('3. If you didn\'t receive it:');
  console.log('   - Check if you have an email service set up for zabotec.com');
  console.log('   - Verify your domain\'s MX records are properly configured');
  console.log('   - Make sure your email hosting provider is active');
  console.log('=================================================');
}

// Run the test
testZabotecEmailDelivery(); 