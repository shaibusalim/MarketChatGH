const fs = require('fs');

const key = fs.readFileSync('service-account.json');
const base64Key = Buffer.from(key).toString('base64');

console.log(base64Key);
