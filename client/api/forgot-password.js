// forgot-password.js — Generates password reset link with stateless cryptographic signature
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

  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required.' });
  }

  if (email.toLowerCase() !== ADMIN_CREDENTIALS.email.toLowerCase()) {
    return res.status(401).json({ success: false, message: 'No admin account found with that Gmail address.' });
  }

  // Generate secure random token and 15-minute expiry
  const token = crypto.randomBytes(24).toString('hex');
  const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes

  // Generate signature using the current password as the secret key
  const sig = getSignature(token, expiry, ADMIN_CREDENTIALS.password);

  return res.status(200).json({
    success: true,
    token,
    expiry,
    sig
  });
};
