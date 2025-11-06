const { query } = require('../utils/db');
const { getEnv } = require('../utils/env');
const { hashPassword, verifyPassword } = require('../utils/password');
const { signSession, verifySession, buildSetCookie, buildClearCookie, parseCookies } = require('../utils/cookies');

function corsHeaders() {
  const { corsOrigin } = getEnv();
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Credentials': 'true',
  };
}

function json(statusCode, data, extraHeaders = {}) {
  return {
    statusCode,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(), ...extraHeaders },
    body: JSON.stringify(data),
  };
}

function parseBody(event) {
  try { return JSON.parse(event.body || '{}'); } catch (_) { return {}; }
}

// POST /auth/register
async function register(event) {
  const { email, password, name } = parseBody(event);
  if (!email || !password || !name) {
    return json(400, { error: 'email, password y name son requeridos' });
  }
  const passwordHash = hashPassword(password);
  try {
    const res = await query(
      'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
      [email, passwordHash, name]
    );
    const user = res.rows[0];
    // Opcional: iniciar sesión tras registro
    const { value } = signSession(user.id);
    return json(201, { id: user.id, email: user.email, name: user.name }, { 'Set-Cookie': buildSetCookie(value) });
  } catch (err) {
    if (err && err.code === '23505') {
      return json(409, { error: 'Email ya registrado' });
    }
    return json(500, { error: 'Error creando usuario' });
  }
}

// POST /auth/login
async function login(event) {
  const { email, password } = parseBody(event);
  if (!email || !password) {
    return json(400, { error: 'email y password son requeridos' });
  }
  const res = await query('SELECT id, email, password, name FROM users WHERE email = $1', [email]);
  if (!res.rows.length) {
    return json(401, { error: 'Credenciales inválidas' });
  }
  const user = res.rows[0];
  if (!verifyPassword(password, user.password)) {
    return json(401, { error: 'Credenciales inválidas' });
  }
  await query('UPDATE users SET last_access = NOW() WHERE id = $1', [user.id]);
  const { value } = signSession(user.id);
  return json(200, { id: user.id, email: user.email, name: user.name }, { 'Set-Cookie': buildSetCookie(value) });
}

// POST /auth/logout
async function logout(event) {
  return json(200, { ok: true }, { 'Set-Cookie': buildClearCookie() });
}

// GET /auth/me
async function me(event) {
  const cookies = parseCookies(event);
  const token = cookies['session'];
  const session = verifySession(token);
  if (!session) return json(401, { error: 'No autenticado' });
  const res = await query('SELECT id, email, name, created_at, last_access FROM users WHERE id = $1', [session.userId]);
  if (!res.rows.length) return json(404, { error: 'Usuario no encontrado' });
  const u = res.rows[0];
  return json(200, { id: u.id, email: u.email, name: u.name, created_at: u.created_at, last_access: u.last_access });
}

// OPTIONS preflight (opcional si no configuras CORS en API Gateway)
async function options() {
  return {
    statusCode: 204,
    headers: { ...corsHeaders(), 'Access-Control-Allow-Headers': 'Content-Type' },
    body: ''
  };
}

module.exports = { register, login, logout, me, options };