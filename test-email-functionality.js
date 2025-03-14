require('dotenv').config();
// Fix the import path to use the correct relative path for TypeScript files
const { send2FACodeEmail, sendSignInVerificationEmail } = require('./lib/email-service.ts');

// Your verified email address to receive test emails
const testEmail = 'tomasszabo94@gmail.com'; // Replace with your actual email

async function testEmailFunctionality() {
  console.log('Starting email functionality test...');
  console.log(`Will send test emails to: ${testEmail}`);
  console.log('Resend API Key:', process.env.RESEND_API_KEY ? 'Present (first few chars: ' + 
    process.env.RESEND_API_KEY.substring(0, 3) + '...)' : 'MISSING');

  try {
    // Test 2FA email
    console.log('\n--- Testing 2FA Email ---');
    const testUser = {
      email: testEmail,
      name: 'Tomas Test'
    };
    
    // Generate a test 2FA code
    const testCode = '123456';
    
    console.log(`Sending 2FA test code (${testCode}) to ${testEmail}...`);
    const result2FA = await send2FACodeEmail(testUser, testCode, 10);
    console.log('2FA Email Result:', JSON.stringify(result2FA, null, 2));
    
    // Test Sign-in verification email
    console.log('\n--- Testing Sign-in Verification Email ---');
    const loginInfo = {
      ipAddress: '192.168.1.1',
      deviceInfo: 'Test Browser on Test OS',
      location: 'Test Location',
      time: new Date()
    };
    
    console.log(`Sending sign-in verification to ${testEmail}...`);
    const resultSignIn = await sendSignInVerificationEmail(testUser, loginInfo);
    console.log('Sign-in Email Result:', JSON.stringify(resultSignIn, null, 2));
    
    console.log('\nTest completed. Check your email inbox for test messages.');
    console.log('If you did not receive the emails, check:');
    console.log('1. Your spam/junk folder');
    console.log('2. Resend dashboard for delivery status');
    console.log('3. Server logs for any errors');
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

// Run the test
testEmailFunctionality(); 