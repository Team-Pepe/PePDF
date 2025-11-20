import { NextResponse } from "next/server"
import { Pool } from "pg"
import { S3Client, HeadBucketCommand } from "@aws-sdk/client-s3"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const dbResult: { ok: boolean; message?: string } = { ok: false }
  const s3Result: { ok: boolean; message?: string } = { ok: false }

  // DB check
  try {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) throw new Error("DATABASE_URL no está configurado")
    const useSSL = process.env.DATABASE_SSL === "true"
    const pool = new Pool({
      connectionString,
      max: 1,
      ssl: useSSL ? { rejectUnauthorized: false } : undefined,
    })
    const { rows } = await pool.query("SELECT 1 AS ok")
    await pool.end()
    if (rows?.[0]?.ok === 1) dbResult.ok = true
  } catch (err: any) {
    dbResult.message = err?.message ?? "Error al conectar con la base de datos"
  }

  // S3 check
  try {
    const region = process.env.S3_REGION
    const bucket = process.env.S3_BUCKET
    if (!region) throw new Error("S3_REGION no está configurado")
    if (!bucket) throw new Error("S3_BUCKET no está configurado")

    const s3 = new S3Client({ region })
    await s3.send(new HeadBucketCommand({ Bucket: bucket }))
    s3Result.ok = true
  } catch (err: any) {
    s3Result.message = err?.message ?? "Error al conectar con S3"
  }

  return NextResponse.json({ status: "ok", db: dbResult, s3: s3Result })
}