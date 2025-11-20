import { Pool } from 'pg'

const useConnectionString = !!process.env.DATABASE_URL
const useSSL = (process.env.DATABASE_SSL === 'true') || (process.env.DB_SSL === 'true')
const debug = process.env.DB_DEBUG === 'true'

const pool = useConnectionString
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ssl: useSSL ? { rejectUnauthorized: false } : undefined,
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      ssl: useSSL ? { rejectUnauthorized: false } : undefined,
    })

if (debug) {
  try {
    const info = useConnectionString
      ? (() => {
          try {
            const u = new URL(process.env.DATABASE_URL as string)
            return {
              host: u.hostname,
              port: u.port || '5432',
              database: u.pathname.replace(/^\//, ''),
              user: u.username,
            }
          } catch {
            return { host: 'unknown', port: 'unknown', database: 'unknown', user: 'unknown' }
          }
        })()
      : {
          host: process.env.DB_HOST,
          port: process.env.DB_PORT || '5432',
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
        }
    console.log('DB init', { ...info, ssl: useSSL ? 'enabled' : 'disabled', useConnectionString })
    pool
      .query('SELECT 1')
      .then(() => console.log('DB connectivity ok'))
      .catch((err) => console.error('DB connectivity failed', { message: err?.message, code: (err as any)?.code }))
  } catch (e) {
    console.error('DB init log error', { message: (e as any)?.message })
  }
}

export async function query(text: string, params?: any[]) {
  const start = Date.now()
  try {
    if (debug) {
      console.log('DB query start', { text, paramsCount: params?.length || 0 })
    }
    const res = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: res.rowCount })
    return res
  } catch (error) {
    console.error('Database query error:', error)
    throw error
  }
}

export async function getClient() {
  if (debug) {
    console.log('DB getClient')
  }
  const client = await pool.connect()
  return client
}

export default pool
