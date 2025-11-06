const crypto = require('crypto');
const { getEnv } = require('./env');

function signSession(userId) {
  const { cookieSecret, sessionTtlDays } = getEnv();
  const exp = Math.floor(Date.now() / 1000) + sessionTtlDays * 86400;
  const payload = `${userId}|${exp}`;
  const sig = crypto.createHmac('sha256', cookieSecret).update(payload).digest('hex');
  const value = `${payload}|${sig}`;
  return { value, exp };
}

function verifySession(value) {
  try {
    const { cookieSecret } = getEnv();
    const [userIdStr, expStr, sig] = String(value).split('|');
    if (!userIdStr || !expStr || !sig) return null;
    const payload = `${userIdStr}|${expStr}`;
    const expected = crypto.createHmac('sha256', cookieSecret).update(payload).digest('hex');
    if (!timingSafeEqualHex(expected, sig)) return null;
    const exp = Number(expStr);
    if (Number.isNaN(exp) || exp < Math.floor(Date.now() / 1000)) return null;
    const userId = Number(userIdStr);
    if (Number.isNaN(userId)) return null;
    return { userId };
  } catch (_) {
    return null;
  }
}

function timingSafeEqualHex(a, b) {
  const aBuf = Buffer.from(a, 'hex');
  const bBuf = Buffer.from(b, 'hex');
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function buildSetCookie(value) {
  const { secureCookie, sessionTtlDays } = getEnv();
  const maxAge = sessionTtlDays * 86400;
  const attrs = [
    `session=${value}`,
    'HttpOnly',
    'SameSite=Lax',
    'Path=/'
  ];
  if (secureCookie) attrs.push('Secure');
  attrs.push(`Max-Age=${maxAge}`);
  return attrs.join('; ');
}

function buildClearCookie() {
  const attrs = [
    'session=; Path=/',
    'HttpOnly',
    'SameSite=Lax',
    'Max-Age=0'
  ];
  const { secureCookie } = getEnv();
  if (secureCookie) attrs.push('Secure');
  return attrs.join('; ');
}

function parseCookies(event) {
  // HTTP API v2 puts cookies in event.cookies (array). REST API uses headers.cookie
  const raw = Array.isArray(event.cookies) && event.cookies.length
    ? event.cookies.join('; ')
    : (event.headers && (event.headers.cookie || event.headers.Cookie)) || '';
  const out = {};
  raw.split(';').map(s => s.trim()).filter(Boolean).forEach(pair => {
    const idx = pair.indexOf('=');
    if (idx > -1) {
      const key = pair.slice(0, idx);
      const val = pair.slice(idx + 1);
      out[key] = val;
    }
  });
  return out;
}

module.exports = { signSession, verifySession, buildSetCookie, buildClearCookie, parseCookies };