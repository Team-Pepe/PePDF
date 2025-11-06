const getEnv = () => ({
  db: {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 5432),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
  },
  s3: {
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_REGION,
  },
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  cookieSecret: process.env.COOKIE_SECRET || 'change-me-in-prod',
  sessionTtlDays: Number(process.env.SESSION_TTL_DAYS || 7),
  secureCookie: process.env.SECURE_COOKIE === 'true',
});

module.exports = { getEnv };