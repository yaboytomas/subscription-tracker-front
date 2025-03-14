require('dotenv').config();
const axios = require('axios');

async function listAllDomains() {
  try {
    const response = await axios.get('https://api.resend.com/domains', {
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      }
    });
    console.log('Domains:', JSON.stringify(response.data, null, 2));
    
    // Check if zabotec.com is in the list and log its status
    const zabotecDomain = response.data.data.find(domain => domain.name === 'zabotec.com');
    if (zabotecDomain) {
      console.log('\nZabotec.com domain status:', zabotecDomain.status);
      console.log('Region:', zabotecDomain.region);
      console.log('Created at:', zabotecDomain.created_at);
      console.log('Records:');
      zabotecDomain.records.forEach(record => {
        console.log(`- Type: ${record.type}, Name: ${record.name}, Value: ${record.value}, Status: ${record.status}`);
      });
    } else {
      console.log('\nzabotec.com domain not found in the list');
    }
  } catch (error) {
    console.error('Error listing domains:', error.response ? error.response.data : error.message);
  }
}

listAllDomains(); 