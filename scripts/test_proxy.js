const http = require('http');

const port = 9002;
const sid = 'ME82ccfac694f3c3f15b3dd03e41dfd83e';
const msgSid = 'MMa6758ef500cfb6f8adf81230ef7f7d46';

const url = `http://localhost:${port}/api/twilio-media?sid=${sid}&msgSid=${msgSid}`;

console.log(`Testing URL: ${url}`);

http.get(url, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);

  if (res.statusCode === 200) {
    console.log('Success! The proxy route returned 200.');
  } else {
    console.log(`Failed with status code: ${res.statusCode}`);
  }
  
  res.on('data', () => {}); // Consume data
  res.on('end', () => {
    process.exit(res.statusCode === 200 ? 0 : 1);
  });
}).on('error', (e) => {
  console.error(`Error: ${e.message}`);
  process.exit(1);
});
