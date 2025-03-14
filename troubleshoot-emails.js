require('dotenv').config();
const { Resend } = require('resend');
const axios = require('axios');

// Initialize Resend with API key
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const resend = new Resend(RESEND_API_KEY);

// Configuration
const SENDER_EMAIL = 'Subscription Tracker <noreply@zabotec.com>'; // Using verified domain
const TEST_RECIPIENTS = [
  'tomasszabo94@gmail.com', // Your verified email with Resend
  'tomas.szabo.undurraga@estudiante.ipss.cl' // Your other email
];

// Utility function to log results
function logResult(name, result) {
  console.log(`\n==== ${name} ====`);
  if (result.success) {
    console.log('✅ Success!');
    console.log('ID:', result.data?.id || 'N/A');
  } else {
    console.log('❌ Failed');
    console.log('Error:', result.error);
  }
}

// 1. Check API key validity
async function checkApiKey() {
  try {
    // Try to make a basic API call to check if the key is valid
    const response = await axios.get('https://api.resend.com/domains', {
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`
      }
    });
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
}

// 2. Check domain verification status
async function checkDomainStatus() {
  try {
    const response = await axios.get('https://api.resend.com/domains', {
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`
      }
    });
    
    const domains = response.data.data || [];
    const zabotecDomain = domains.find(domain => domain.name === 'zabotec.com');
    
    return { 
      success: zabotecDomain?.status === 'verified', 
      data: zabotecDomain || { status: 'not found' } 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message 
    };
  }
}

// 3. Test sending a plain email without custom domain
async function testDefaultDomainEmail(recipient) {
  try {
    const data = await resend.emails.send({
      from: 'Subscription Tracker <onboarding@resend.dev>',
      to: recipient,
      subject: 'Test Email with Default Domain',
      html: `
        <h1>Test Email (Default Domain)</h1>
        <p>This is a test email sent from the default Resend domain (onboarding@resend.dev).</p>
        <p>If you're seeing this, the basic email functionality is working.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `
    });
    
    return { success: !data.error, data };
  } catch (error) {
    return { success: false, error };
  }
}

// 4. Test sending email with custom domain
async function testCustomDomainEmail(recipient) {
  try {
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to: recipient,
      subject: 'Test Email with Custom Domain',
      html: `
        <h1>Test Email (Custom Domain)</h1>
        <p>This is a test email sent from your verified domain (noreply@zabotec.com).</p>
        <p>If you're seeing this, your domain is properly configured with Resend!</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `
    });
    
    return { success: !data.error, data };
  } catch (error) {
    return { success: false, error };
  }
}

// 5. Test sending email with attachments
async function testEmailWithAttachments(recipient) {
  try {
    const data = await resend.emails.send({
      from: SENDER_EMAIL,
      to: recipient,
      subject: 'Test Email with Attachments',
      html: `
        <h1>Test Email with Attachments</h1>
        <p>This email includes a simple text attachment.</p>
        <p>If you're seeing this and can access the attachment, advanced email features are working.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
      attachments: [
        {
          filename: 'test.txt',
          content: Buffer.from('This is a test attachment.').toString('base64'),
        },
      ],
    });
    
    return { success: !data.error, data };
  } catch (error) {
    return { success: false, error };
  }
}

// Run all tests
async function runTests() {
  console.log('=================================================');
  console.log('🔍 RESEND EMAIL TROUBLESHOOTING TOOL');
  console.log('=================================================');
  console.log(`API Key: ${RESEND_API_KEY ? RESEND_API_KEY.substring(0, 8) + '...' : 'Missing'}`);
  console.log(`Sender: ${SENDER_EMAIL}`);
  console.log(`Recipients: ${TEST_RECIPIENTS.join(', ')}`);
  console.log('=================================================');
  
  // Step 1: Check API key
  const apiKeyResult = await checkApiKey();
  logResult('API Key Check', apiKeyResult);
  
  if (!apiKeyResult.success) {
    console.log('\n❌ API Key is invalid. Cannot proceed with further tests.');
    return;
  }
  
  // Step 2: Check domain verification
  const domainResult = await checkDomainStatus();
  logResult('Domain Verification', domainResult);
  console.log('Domain Status:', domainResult.data.status);
  
  // Steps 3-5: Test different email types
  for (const recipient of TEST_RECIPIENTS) {
    console.log(`\n----- Testing emails to: ${recipient} -----`);
    
    // Test default domain email
    const defaultDomainResult = await testDefaultDomainEmail(recipient);
    logResult(`Default Domain Email to ${recipient}`, defaultDomainResult);
    
    // Test custom domain email
    const customDomainResult = await testCustomDomainEmail(recipient);
    logResult(`Custom Domain Email to ${recipient}`, customDomainResult);
    
    // Test email with attachments
    const attachmentResult = await testEmailWithAttachments(recipient);
    logResult(`Email with Attachments to ${recipient}`, attachmentResult);
  }
  
  console.log('\n=================================================');
  console.log('🔍 TROUBLESHOOTING RECOMMENDATIONS:');
  console.log('=================================================');
  console.log('1. If emails are sending successfully but not being received:');
  console.log('   - Check your SPAM/JUNK folders');
  console.log('   - Check if your email provider is blocking the messages');
  console.log('   - New domains often have lower deliverability until they establish a reputation');
  console.log('\n2. For domain verification issues:');
  console.log('   - Verify all DNS records were added correctly');
  console.log('   - Allow up to 48 hours for DNS propagation');
  console.log('\n3. Next steps:');
  console.log('   - Check your email logs in the Resend dashboard: https://resend.com/overview');
  console.log('   - Set up DMARC for improved deliverability');
  console.log('=================================================');
}

// Run all tests
runTests(); 