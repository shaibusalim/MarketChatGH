
async function check() {
  try {
    const res = await fetch('http://localhost:9002/sellers');
    console.log('Status:', res.status);
    // Don't print body for HTML pages
  } catch (e) {
    console.error('Error:', e);
  }
}

check();
