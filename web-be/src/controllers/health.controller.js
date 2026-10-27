import { supabase } from '../config/supabase.js';
import { asyncHandler } from '../utils/http.js';

export const getHealth = (req, res) => {
  res.json({
    success: true,
    message: 'RSI Medika API berjalan',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
};

/** Cek koneksi ke Supabase (memanggil Auth admin API, tidak butuh tabel apa pun). */
export const getDbHealth = asyncHandler(async (req, res) => {
  if (!supabase) {
    return res.status(503).json({ success: false, message: 'Supabase belum dikonfigurasi' });
  }

  const { error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
  if (error) {
    return res.status(503).json({ success: false, message: 'Gagal terhubung ke Supabase', error: error.message });
  }

  res.json({ success: true, message: 'Terhubung ke Supabase' });
});
