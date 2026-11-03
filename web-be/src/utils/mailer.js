import nodemailer from 'nodemailer';

import { env } from '../config/env.js';

let transporter;
function getTransporter() {
  if (!env.smtp.host || !env.smtp.user) {
    throw new Error('SMTP belum dikonfigurasi (SMTP_HOST / SMTP_USER di .env)');
  }
  transporter ??= nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });
  return transporter;
}

const escapeHtml = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** Kirim kredensial akun baru ke email pegawai. */
export async function kirimEmailAkunBaru({ to, nama, username, password, role }) {
  const loginUrl = `${env.appUrl.replace(/\/$/, '')}/login`;
  const n = escapeHtml(nama);
  const u = escapeHtml(username);
  const p = escapeHtml(password);
  const r = escapeHtml(role);

  const text = `Halo ${nama},

Akun Anda di Sistem RSI Medika telah dibuat dengan peran: ${role}.

Email / Username : ${username}
Password sementara: ${password}

Silakan login di ${loginUrl}
PENTING: Segera ganti password Anda setelah login pertama kali. Jangan bagikan password ini kepada siapa pun.

Salam,
HRD RSI Medika`;

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#222">
    <h2 style="color:#0a7d4f">Akun RSI Medika Anda Telah Dibuat</h2>
    <p>Halo <b>${n}</b>,</p>
    <p>Akun Anda di Sistem RSI Medika telah dibuat dengan peran <b>${r}</b>. Berikut data login Anda:</p>
    <table style="border-collapse:collapse;margin:12px 0">
      <tr><td style="padding:6px 12px;background:#f2f2f2">Email / Username</td><td style="padding:6px 12px"><b>${u}</b></td></tr>
      <tr><td style="padding:6px 12px;background:#f2f2f2">Password sementara</td><td style="padding:6px 12px"><code style="font-size:15px">${p}</code></td></tr>
    </table>
    <p><a href="${loginUrl}" style="background:#0a7d4f;color:#fff;padding:10px 18px;border-radius:4px;text-decoration:none">Login Sekarang</a></p>
    <p style="background:#fff4e5;border-left:4px solid #f0a020;padding:10px">
      <b>Penting:</b> Anda <b>wajib mengganti password</b> setelah login pertama kali.
      Jangan bagikan password ini kepada siapa pun.
    </p>
    <p>Salam,<br/>HRD RSI Medika</p>
  </div>`;

  await getTransporter().sendMail({
    from: env.smtp.from,
    to,
    subject: 'Akun Sistem RSI Medika Anda',
    text,
    html,
  });
}

