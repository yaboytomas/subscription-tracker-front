// DMARC Record Generator
// This script provides instructions for setting up a DMARC record for your domain

console.log('=================================================');
console.log('📧 DMARC RECORD SETUP FOR ZABOTEC.COM');
console.log('=================================================');

console.log(`
WHAT IS DMARC?
-------------
DMARC (Domain-based Message Authentication, Reporting & Conformance) is an email 
authentication protocol that works with SPF and DKIM to protect your domain from 
email spoofing and improve deliverability.

YOUR RECOMMENDED DMARC RECORD:
-----------------------------
Type: TXT
Host/Name: _dmarc.zabotec.com
Value: v=DMARC1; p=none; sp=none; rua=mailto:tomasszabo94@gmail.com; aspf=r; adkim=r; pct=100; ri=86400

EXPLANATION:
-----------
- v=DMARC1: The DMARC version
- p=none: Policy for your domain (monitor only, don't reject or quarantine)
- sp=none: Policy for subdomains
- rua=mailto:tomasszabo94@gmail.com: Where aggregate reports should be sent
- aspf=r: SPF alignment is relaxed
- adkim=r: DKIM alignment is relaxed
- pct=100: Apply policy to 100% of emails
- ri=86400: Reporting interval (daily)

HOW TO ADD THIS RECORD:
---------------------
1. Log in to your DNS provider for zabotec.com
2. Add a new TXT record with the settings above
3. Save the changes
4. Allow 24-48 hours for DNS propagation

FUTURE RECOMMENDATIONS:
--------------------
Once you're receiving emails properly and have reviewed DMARC reports:
1. Change "p=none" to "p=quarantine" to mark failed messages as spam
2. Eventually move to "p=reject" to block all non-compliant emails

TESTING YOUR DMARC SETUP:
-----------------------
Use these free tools to check your DMARC implementation:
1. https://dmarcian.com/dmarc-inspector/
2. https://mxtoolbox.com/dmarc.aspx
`);

console.log('=================================================');
console.log('For institutional emails (like your IPSS address), adding DMARC');
console.log('significantly increases the chances of delivery.');
console.log('================================================='); 