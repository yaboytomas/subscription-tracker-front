// test-email.js
const fetch = require('node-fetch');
require('dotenv').config({ path: '.env.local' });  // Load environment variables

console.log('Testing API endpoints with different routing patterns...');

// Test the Pages Router endpoint
async function testPagesEndpoint() {
  try {
    console.log('\nTesting Pages Router API endpoint...');
    const response = await fetch('http://localhost:3000/api/test');
    
    if (!response.ok) {
      console.log('Pages Router - Response status:', response.status);
      return false;
    }
    
    const data = await response.json();
    console.log('Pages Router API response:', data);
    return true;
  } catch (error) {
    console.error('Error with Pages Router endpoint:', error.message);
    return false;
  }
}

// Test the App Router endpoint
async function testAppEndpoint() {
  try {
    console.log('\nTesting App Router API endpoint...');
    const response = await fetch('http://localhost:3000/api/test/route');
    
    if (!response.ok) {
      console.log('App Router - Response status:', response.status);
      
      // Try without /route
      console.log('Trying without /route...');
      const response2 = await fetch('http://localhost:3000/api/test');
      
      if (!response2.ok) {
        console.log('App Router (alt) - Response status:', response2.status);
        return false;
      }
      
      const data2 = await response2.json();
      console.log('App Router API response (alt):', data2);
      return true;
    }
    
    const data = await response.json();
    console.log('App Router API response:', data);
    return true;
  } catch (error) {
    console.error('Error with App Router endpoint:', error.message);
    return false;
  }
}

// Run tests to determine routing pattern
async function determineRoutingPattern() {
  const pagesRouterWorks = await testPagesEndpoint();
  const appRouterWorks = await testAppEndpoint();
  
  if (pagesRouterWorks) {
    console.log("\n✅ Your project uses Pages Router! We'll set up the cron endpoint there.");
    return 'pages';
  } else if (appRouterWorks) {
    console.log("\n✅ Your project uses App Router! We'll set up the cron endpoint there.");
    return 'app';
  } else {
    console.log("\n❌ Neither routing pattern worked. There might be a configuration issue.");
    return null;
  }
}

determineRoutingPattern().then(routingPattern => {
  console.log(`\nDetected routing pattern: ${routingPattern || 'none'}`);
});

// We need to use dynamic imports since this is an ES module project
async function runTest() {
  try {
    console.log('Loading email service...');
    console.log(`RESEND_API_KEY is ${process.env.RESEND_API_KEY ? 'set' : 'not set'}`);
    
    // Change this to your own email address for testing
    const TEST_EMAIL = 'your-email@example.com';
    
    // Import using dynamic import to handle ES modules
    const { sendTestEmail } = await import('./lib/email-service.js');
    
    console.log('Sending test email...');
    const result = await sendTestEmail(TEST_EMAIL);
    console.log('Test result:', result);
  } catch (error) {
    console.error('Error running test:', error);
  }
}

runTest();