// reset-password.js — Verifies signature, updates adminConfig.js, and pushes update to GitHub
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

  const { token, expiry, sig, password } = req.body || {};

  if (!token || !expiry || !sig || !password) {
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

  // Generate new adminConfig.js content
  const newConfigContent = `// adminConfig.js — Admin Credentials Configuration
// ==================================================
// This file stores the admin Gmail and the current admin password.
// It is kept in the api/ directory so Vercel does not expose it publicly on any frontend route.
// 
// To manually update the credentials:
// 1. Change the email and password values below.
// 2. Commit and push the changes to GitHub.

export const ADMIN_CREDENTIALS = {
  email: '${ADMIN_CREDENTIALS.email}',
  password: '${password}'
};
`;

  // Commit and Push to GitHub using GitHub REST API
  const githubToken = process.env.GITHUB_TOKEN;
  if (!githubToken) {
    console.error('Missing GITHUB_TOKEN environment variable in Vercel settings.');
    return res.status(500).json({
      success: false,
      message: 'Server error: GITHUB_TOKEN environment variable not set on Vercel.'
    });
  }

  try {
    const owner = 'Ezitom';
    const repo = 'ezitom';
    const filePath = 'client/api/adminConfig.js';
    const getUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`;

    // 1. Get file SHA from GitHub
    const getRes = await fetch(getUrl, {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Vercel-Serverless-Function'
      }
    });

    let sha = null;
    if (getRes.status === 200) {
      const fileData = await getRes.json();
      sha = fileData.sha;
    } else {
      const getErr = await getRes.json();
      throw new Error(`GitHub GET failed (${getRes.status}): ${getErr.message || 'unknown'}`);
    }

    // 2. Commit the new file contents back
    const payload = {
      message: 'fix: reset admin password (sync across devices)',
      content: Buffer.from(newConfigContent).toString('base64'),
      sha: sha
    };

    const putRes = await fetch(getUrl, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Vercel-Serverless-Function'
      },
      body: JSON.stringify(payload)
    });

    const putData = await putRes.json();
    if (putRes.status !== 200 && putRes.status !== 201) {
      throw new Error(`GitHub PUT failed (${putRes.status}): ${putData.message || 'unknown'}`);
    }

    return res.status(200).json({ success: true, message: 'Password updated and pushed to Git.' });

  } catch (err) {
    console.error('[Web3Forms/GitHub Reset] Error:', err);
    return res.status(500).json({ success: false, message: `Failed to commit to GitHub: ${err.message}` });
  }
};
