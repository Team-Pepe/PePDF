const crypto = require('crypto');
const { query } = require('../utils/db');
const { getEnv } = require('../utils/env');
const { verifySession, parseCookies } = require('../utils/cookies');
const { S3Client, PutObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');

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

function requireAuth(event) {
  const cookies = parseCookies(event);
  const token = cookies['session'];
  const session = verifySession(token);
  return session; // null si no válido
}

function s3Client() {
  const { s3 } = getEnv();
  return new S3Client({ region: s3.region });
}

// POST /files/presign
async function presign(event) {
  const session = requireAuth(event);
  if (!session) return json(401, { error: 'No autenticado' });
  const { s3 } = getEnv();
  const { name, type } = parseBody(event);
  if (!name || !type) return json(400, { error: 'name y type son requeridos' });
  const safeName = String(name).replace(/[^a-zA-Z0-9._-]/g, '_');
  const random = crypto.randomBytes(8).toString('hex');
  const key = `users/${session.userId}/${Date.now()}-${random}-${safeName}`;
  const putCmd = new PutObjectCommand({ Bucket: s3.bucket, Key: key, ContentType: type });
  const url = await getSignedUrl(s3Client(), putCmd, { expiresIn: 900 }); // 15 min
  return json(200, { uploadUrl: url, s3Key: key });
}

// POST /files/finalize
async function finalize(event) {
  const session = requireAuth(event);
  if (!session) return json(401, { error: 'No autenticado' });
  const { name, type, size, s3Key, status } = parseBody(event);
  if (!name || !type || !size || !s3Key) return json(400, { error: 'name, type, size y s3Key son requeridos' });
  const st = status || 'Procesado';
  const res = await query(
    'INSERT INTO files (user_id, name, type, size, s3_key, status) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, created_at',
    [session.userId, name, type, Number(size), s3Key, st]
  );
  const row = res.rows[0];
  return json(201, { id: row.id, created_at: row.created_at });
}

// GET /files
async function listFiles(event) {
  const session = requireAuth(event);
  if (!session) return json(401, { error: 'No autenticado' });
  const res = await query(
    'SELECT id, name, type, size, s3_key, status, created_at FROM files WHERE user_id = $1 ORDER BY created_at DESC',
    [session.userId]
  );
  return json(200, { files: res.rows });
}

// GET /files/{id}/download
async function downloadFile(event) {
  const session = requireAuth(event);
  if (!session) return json(401, { error: 'No autenticado' });
  const idStr = event.pathParameters && event.pathParameters.id;
  const id = Number(idStr);
  if (!id) return json(400, { error: 'id inválido' });
  const rowRes = await query('SELECT s3_key FROM files WHERE id = $1 AND user_id = $2', [id, session.userId]);
  if (!rowRes.rows.length) return json(404, { error: 'Archivo no encontrado' });
  const { s3_key } = rowRes.rows[0];
  const { s3 } = getEnv();
  const getCmd = new GetObjectCommand({ Bucket: s3.bucket, Key: s3_key });
  const url = await getSignedUrl(s3Client(), getCmd, { expiresIn: 900 }); // 15 min
  return json(200, { downloadUrl: url });
}

// OPTIONS
async function options() {
  return {
    statusCode: 204,
    headers: { ...corsHeaders(), 'Access-Control-Allow-Headers': 'Content-Type' },
    body: ''
  };
}

module.exports = { presign, finalize, listFiles, downloadFile, options };