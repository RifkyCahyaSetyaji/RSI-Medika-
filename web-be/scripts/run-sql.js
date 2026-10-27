/**
 * Menjalankan file SQL ke database Supabase (PostgreSQL) secara langsung.
 *
 * Pakai:  node scripts/run-sql.js database/schema.sql [database/seed.sql ...]
 * Butuh:  DATABASE_URL di .env
 *         (Supabase Dashboard -> Connect -> Connection string -> URI)
 */
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import pg from 'pg';

const files = process.argv.slice(2);
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error('❌ DATABASE_URL belum di-set di .env');
  process.exit(1);
}
if (files.length === 0) {
  console.error('Pakai: node scripts/run-sql.js <file.sql> [file2.sql ...]');
  process.exit(1);
}

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log('✅ Terhubung ke database');

  for (const file of files) {
    const sql = await readFile(path.resolve(file), 'utf8');
    process.stdout.write(`▶ Menjalankan ${file} ... `);
    await client.query(sql);
    console.log('selesai');
  }
} catch (err) {
  console.error(`\n❌ Gagal: ${err.message}`);
  if (err.position) console.error(`   posisi karakter: ${err.position}`);
  process.exitCode = 1;
} finally {
  await client.end();
}
