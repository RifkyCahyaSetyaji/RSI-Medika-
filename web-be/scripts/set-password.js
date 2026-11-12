// Pakai: node scripts/set-password.js <username> <passwordBaru>
// Mengganti hash password akun (mis. akun seed yang hash-nya belum valid).
import bcrypt from 'bcryptjs';
import 'dotenv/config';

import prisma from '../src/config/prisma.js';

const [username, password] = process.argv.slice(2);
if (!username || !password) {
  console.error('Pakai: node scripts/set-password.js <username> <passwordBaru>');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);
const result = await prisma.akun.updateMany({ where: { username }, data: { password: hash } });
console.log(result.count ? `Password "${username}" diperbarui` : `Username "${username}" tidak ditemukan`);
await prisma.$disconnect();
