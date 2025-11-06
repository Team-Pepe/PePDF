const crypto = require('crypto');

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt:${salt.toString('base64')}:${hash.toString('hex')}`;
}

function verifyPassword(password, stored) {
  const [algo, saltB64, hex] = String(stored).split(':');
  if (algo !== 'scrypt' || !saltB64 || !hex) return false;
  const salt = Buffer.from(saltB64, 'base64');
  const expected = Buffer.from(hex, 'hex');
  const actual = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return crypto.timingSafeEqual(actual, expected);
}

module.exports = { hashPassword, verifyPassword };