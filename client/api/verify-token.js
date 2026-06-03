// verify-token.js — Verifies reset token signature state-free
const crypto = require('crypto');
const { ADMIN_CREDENTIALS } = await import('./adminConfig.js');

function getSignature(token, expiry, adminPassword) {
  return crypto
    .createHmac('sha256', adminPassword)
    .update(`${token}:${expiry}`)
    .digest('hex');
}

module.exports = async (req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { token, expiry, sig } = req.body || {};

  if (!token || !expiry || !sig) {
    return res.status(400).json({ success: false, message: 'Missing parameters.' });
  }

  // Check expiry
  if (Date.now() > parseInt(expiry, 10)) {
    return res.status(401).json({ success: false, message: 'Link has expired.' });
  }

  // Validate signature
  const expectedSig = getSignature(token, expiry, ADMIN_CREDENTIALS.password);
  if (sig !== expectedSig) {
    return res.status(401).json({ success: false, message: 'Invalid token or signature.' });
  }

  return res.status(200).json({ success: true });
};
