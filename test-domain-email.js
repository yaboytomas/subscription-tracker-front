require('dotenv').config();
const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Using the verified domain
const SENDER_EMAIL = 'Subscription Tracker <noreply@zabotec.com>';

// Test sending an email to multiple recipients
async function testDomainEmail() {
  try {
    console.log('Testing email with verified domain...');
    console.log('From:', SENDER_EMAIL);
    
    // Multiple recipients for testing
    const recipients = [
      'tomas.szabo.undurraga@estudiante.ipss.cl',
      'tomasszabo94@gmail.com' // Verified email address with Resend
    ];
    
    console.log(`Sending test emails to: ${recipients.join(', ')}`);
    
    // Send to each recipient individually to track which ones succeed/fail
    for (const recipient of recipients) {
      try {
        console.log(`\nSending to: ${recipient}`);
        const data = await resend.emails.send({
          from: SENDER_EMAIL,
          to: recipient,
          subject: 'Domain Verification Test',
          html: `
            <h1>Domain Verification Test</h1>
            <p>This is a test email sent from your verified domain zabotec.com.</p>
            <p>If you're seeing this, your domain is properly configured with Resend!</p>
            <p>This means you can now send emails to any recipient.</p>
            <p>Timestamp: ${new Date().toISOString()}</p>
          `
        });
        
        console.log(`Email to ${recipient} sent successfully:`, data);
      } catch (error) {
        console.error(`Failed to send email to ${recipient}:`, error);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Failed to run test:', error);
    if (error.message && error.message.includes('verify a domain')) {
      console.error('DOMAIN VERIFICATION ERROR: Your domain might not be fully verified yet');
      console.error('Please check the verification status at https://resend.com/domains');
    }
    return { success: false, error };
  }
}

// Run the test
testDomainEmail(); 