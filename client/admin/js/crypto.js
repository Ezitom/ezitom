/**
 * crypto.js - Stateless cryptographic signature helpers using Web Crypto API.
 */

async function getSignature(token, expiry, adminPassword) {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(adminPassword);
  const msgData = encoder.encode(`${token}:${expiry}`);

  const key = await window.crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sigBuffer = await window.crypto.subtle.sign('HMAC', key, msgData);
  return Array.from(new Uint8Array(sigBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
