require('dotenv').config();
const { Resend } = require('resend');

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Using the verified domain
const SENDER_EMAIL = 'Subscription Tracker <noreply@zabotec.com>';
const RECIPIENT = 'tomas.szabo.undurraga@estudiante.ipss.cl';

// Test sending emails with different characteristics to bypass filters
async function testIPSSEmailDelivery() {
  console.log('=================================================');
  console.log('📧 IPSS EMAIL DELIVERY TEST');
  console.log('=================================================');
  console.log(`Testing delivery to: ${RECIPIENT}`);
  console.log(`From: ${SENDER_EMAIL}`);
  console.log('=================================================');
  
  // Test 1: Simple text email (no HTML)
  try {
    console.log('\n----- Test 1: Simple Text Email -----');
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to: RECIPIENT,
      subject: 'Test Message - No HTML',
      text: 'This is a plain text email without any HTML formatting. Some email filters are less strict with plain text emails.',
    });
    
    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Failed to send plain text email:', error);
  }
  
  // Test 2: Minimal HTML (no images, links, or complex formatting)
  try {
    console.log('\n----- Test 2: Minimal HTML Email -----');
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to: RECIPIENT,
      subject: 'Test Message - Minimal HTML',
      html: `
        <p>This is a simple HTML email with minimal formatting.</p>
        <p>Some institutional filters block emails with complex HTML or many links.</p>
      `
    });
    
    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Failed to send minimal HTML email:', error);
  }
  
  // Test 3: Different subject line (avoiding common spam trigger words)
  try {
    console.log('\n----- Test 3: Clean Subject Line -----');
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to: RECIPIENT,
      subject: 'Message from Zabotec Domain Testing',
      html: `
        <p>This email uses a subject line that avoids common spam trigger words.</p>
        <p>Words like "test", "free", "urgent" etc. can sometimes trigger spam filters.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `
    });
    
    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Failed to send email with clean subject:', error);
  }
  
  // Test 4: Reply-to header
  try {
    console.log('\n----- Test 4: With Reply-To Header -----');
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to: RECIPIENT,
      reply_to: 'tomasszabo94@gmail.com',
      subject: 'Message with Reply-To Header',
      html: `
        <p>This email includes a reply-to header pointing to your Gmail account.</p>
        <p>This can help with deliverability in some cases.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `
    });
    
    console.log('Email sent successfully:', data);
  } catch (error) {
    console.error('Failed to send email with reply-to:', error);
  }
  
  console.log('\n=================================================');
  console.log('NEXT STEPS:');
  console.log('=================================================');
  console.log('1. Check your IPSS email account for these test messages');
  console.log('2. Check spam/junk folders and any quarantine sections');
  console.log('3. If none are received, contact your IPSS IT department to ask:');
  console.log('   - If they block emails from new domains');
  console.log('   - If they have special requirements for email delivery');
  console.log('   - If they can whitelist zabotec.com');
  console.log('4. Add the DMARC record as suggested in the setup-dmarc.js script');
  console.log('=================================================');
}

// Run the test
testIPSSEmailDelivery(); 