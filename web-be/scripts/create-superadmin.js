// Pakai: node scripts/create-superadmin.js <email> <password> [nama]
// Membuat (atau memperbarui) akun Super Admin. Karena setiap akun harus terhubung
// ke pegawai, script ini juga membuat baris pegawai khusus jika email belum terdaftar.
import bcrypt from 'bcryptjs';
import 'dotenv/config';

import prisma from '../src/config/prisma.js';

const [email, password, nama = 'Super Admin'] = process.argv.slice(2);
if (!email || !password) {
  console.error('Pakai: node scripts/create-superadmin.js <email> <password> [nama]');
  process.exit(1);
}
if (password.length < 8) {
  console.error('Password minimal 8 karakter');
  process.exit(1);
}

const hash = await bcrypt.hash(password, 12);

let pegawai = await prisma.pegawai.findUnique({ where: { email } });
if (!pegawai) {
  pegawai = await prisma.pegawai.create({
    data: {
      nama,
      nip: `SA-${Date.now()}`,
      email,
      jabatan: 'Super Admin',
      unitKerja: 'Sistem',
      statusPegawai: 'Aktif',
      tanggalMasuk: new Date(),
      sisaJatahCuti: 0,
    },
  });
  console.log(`Pegawai ${pegawai.idPegawai} dibuat untuk Super Admin`);
}

const username = email.length <= 50 ? email : pegawai.nip;
const akun = await prisma.akun.upsert({
  where: { idPegawai: pegawai.idPegawai },
  update: { password: hash, role: 'Super Admin' },
  create: { idPegawai: pegawai.idPegawai, username, password: hash, role: 'Super Admin' },
});

console.log(`Akun Super Admin siap: ${akun.username} (${akun.idAkun})`);
await prisma.$disconnect();

