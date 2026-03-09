
const fetch = require('node-fetch');

async function main() {
    const port = 9002;
    const url = `http://localhost:${port}/api/whatsapp`;
    const sellerId = '233209832978';

    // Use URLSearchParams for application/x-www-form-urlencoded
    const params = new URLSearchParams();
    params.append('Body', 'Test Product URL Encoded\nPrice: GHC 200');
    params.append('From', `whatsapp:+${sellerId}`);
    params.append('MessageSid', `TEST_MSG_${Date.now()}`);
    params.append('NumMedia', '1');
    params.append('MediaUrl0', 'https://via.placeholder.com/600x400.png?text=Test+Image');

    console.log(`Sending simulated WhatsApp message to ${url}...`);

    try {
        const fetchFn = global.fetch || fetch;
        const response = await fetchFn(url, {
            method: 'POST',
            body: params,
            // Headers handled automatically for URLSearchParams
        });

        const text = await response.text();
        console.log(`Response Status: ${response.status}`);
        console.log(`Response Body: ${text.substring(0, 500)}...`);

    } catch (error) {
        console.error('Simulation failed:', error);
    }
}

main();
