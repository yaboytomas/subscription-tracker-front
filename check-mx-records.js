const dns = require('dns');
const util = require('util');

// Convert DNS lookup to Promise-based
const resolveMx = util.promisify(dns.resolveMx);

async function checkMxRecords(domain) {
  console.log(`=================================================`);
  console.log(`📧 CHECKING MX RECORDS FOR ${domain.toUpperCase()}`);
  console.log(`=================================================`);
  
  try {
    const mxRecords = await resolveMx(domain);
    
    if (mxRecords && mxRecords.length > 0) {
      console.log(`\n✅ MX records found for ${domain}:`);
      
      // Sort by priority (lower is higher priority)
      mxRecords.sort((a, b) => a.priority - b.priority);
      
      mxRecords.forEach((record, index) => {
        console.log(`  ${index + 1}. Priority: ${record.priority}, Exchange: ${record.exchange}`);
      });
      
      console.log(`\nThis means your domain is configured to receive emails.`);
      console.log(`The mail server(s) listed above will handle incoming emails for ${domain}.`);
    } else {
      console.log(`\n❌ No MX records found for ${domain}`);
      console.log(`This means your domain is NOT configured to receive emails.`);
      console.log(`You need to set up MX records with your DNS provider.`);
    }
    
  } catch (error) {
    console.log(`\n❌ Error checking MX records: ${error.message}`);
    
    if (error.code === 'ENOTFOUND' || error.code === 'ENODATA') {
      console.log(`No MX records found for ${domain}`);
      console.log(`This means your domain is NOT configured to receive emails.`);
    }
  }
  
  console.log(`\n=================================================`);
  console.log(`WHAT THIS MEANS:`);
  console.log(`=================================================`);
  console.log(`1. If MX records are found: Your domain can receive emails.`);
  console.log(`   - The email test should be delivered to your mailbox.`);
  console.log(`   - Check your email service provider (the MX server listed).`);
  console.log(`\n2. If NO MX records are found: Your domain CANNOT receive emails.`);
  console.log(`   - You need to set up an email service for your domain.`);
  console.log(`   - Popular options: Google Workspace, Microsoft 365, Zoho Mail`);
  console.log(`   - After setting up, they will provide MX records to add.`);
  console.log(`=================================================`);
}

// Check MX records for zabotec.com
checkMxRecords('zabotec.com'); 