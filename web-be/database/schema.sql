-- =====================================================================
-- RSI Medika - Skema Database (Supabase / PostgreSQL)
-- ---------------------------------------------------------------------
-- Cara pakai: buka Supabase Dashboard -> SQL Editor -> paste file ini -> Run.
-- Script ini idempotent untuk create (IF NOT EXISTS). Untuk reset total,
-- jalankan bagian "RESET" di paling bawah terlebih dahulu.
--
-- Catatan pemetaan tipe (kamus data ditulis dengan gaya MySQL):
--   TINYINT UNSIGNED -> SMALLINT + CHECK (>= 0 / rentang sesuai constraint)
--   DATETIME         -> TIMESTAMP
--   VARCHAR/DATE/TIME/DECIMAL/CHAR -> sama
--
-- Nama tabel memakai snake_case huruf kecil, nama kolom memakai camelCase
-- (di-quote) agar sama persis dengan kamus data & langsung cocok dengan
-- objek JavaScript yang dikembalikan supabase-js.
--
-- PRIMARY KEY di PostgreSQL otomatis NOT NULL + UNIQUE.
-- ID dibuat otomatis lewat sequence dengan format sesuai contoh data
-- (mis. PGW0000001), tapi tetap boleh diisi manual saat INSERT.
-- =====================================================================

BEGIN;

-- ---------------------------------------------------------------------
-- Sequence untuk generator ID
-- ---------------------------------------------------------------------
CREATE SEQUENCE IF NOT EXISTS seq_pegawai;
CREATE SEQUENCE IF NOT EXISTS seq_akun;
CREATE SEQUENCE IF NOT EXISTS seq_jadwal;
CREATE SEQUENCE IF NOT EXISTS seq_pengajuan_jadwal;
CREATE SEQUENCE IF NOT EXISTS seq_pengajuan_cuti;
CREATE SEQUENCE IF NOT EXISTS seq_surat_hasil_cuti;
CREATE SEQUENCE IF NOT EXISTS seq_notifikasi;
CREATE SEQUENCE IF NOT EXISTS seq_absensi;
CREATE SEQUENCE IF NOT EXISTS seq_pengajuan_ketidakhadiran;
CREATE SEQUENCE IF NOT EXISTS seq_pengajuan_koreksi;
CREATE SEQUENCE IF NOT EXISTS seq_penggajian;
CREATE SEQUENCE IF NOT EXISTS seq_pengajuan_banding_gaji;
CREATE SEQUENCE IF NOT EXISTS seq_rekening_pegawai;
CREATE SEQUENCE IF NOT EXISTS seq_transaksi_pembayaran;

-- =====================================================================
-- 1. PEGAWAI
-- =====================================================================
CREATE TABLE IF NOT EXISTS pegawai (
  "idPegawai"     VARCHAR(10)  PRIMARY KEY
                  DEFAULT 'PGW' || LPAD(nextval('seq_pegawai')::TEXT, 7, '0'),
  "nama"          VARCHAR(100) NOT NULL,
  "nip"           VARCHAR(30)  NOT NULL UNIQUE,
  "alamat"        VARCHAR(255) NULL,
  "noTelp"        VARCHAR(15)  NULL,
  "email"         VARCHAR(100) NOT NULL UNIQUE,
  "jabatan"       VARCHAR(50)  NOT NULL,
  "unitKerja"     VARCHAR(100) NOT NULL,
  "statusPegawai" VARCHAR(20)  NOT NULL,
  "tanggalMasuk"  DATE         NOT NULL,
  "sisaJatahCuti" SMALLINT     NOT NULL
                  CONSTRAINT chk_pegawai_sisa_cuti CHECK ("sisaJatahCuti" BETWEEN 0 AND 12)
);

-- =====================================================================
-- 2. AKUN  (Pegawai 1 : Akun 0..1)
-- =====================================================================
CREATE TABLE IF NOT EXISTS akun (
  "idAkun"    VARCHAR(10)  PRIMARY KEY
              DEFAULT 'AKN' || LPAD(nextval('seq_akun')::TEXT, 7, '0'),
  "idPegawai" VARCHAR(10)  NOT NULL UNIQUE
              REFERENCES pegawai ("idPegawai") ON UPDATE CASCADE ON DELETE CASCADE,
  "username"  VARCHAR(50)  NOT NULL UNIQUE,
  "password"  VARCHAR(255) NOT NULL,   -- simpan HASH password (bcrypt), bukan plain text
  "role"      VARCHAR(30)  NOT NULL,
);
-- =====================================================================
-- 3. JADWAL  (Pegawai 1 : Jadwal 0..*)
-- =====================================================================
CREATE TABLE IF NOT EXISTS jadwal (
  "idJadwal"    VARCHAR(10) PRIMARY KEY
                DEFAULT 'JDW' || LPAD(nextval('seq_jadwal')::TEXT, 7, '0'),
  "idPegawai"   VARCHAR(10) NOT NULL
                REFERENCES pegawai ("idPegawai") ON UPDATE CASCADE ON DELETE RESTRICT,
  "tanggal"     DATE        NOT NULL,
  "jamMulai"    TIME        NOT NULL,
  "jamSelesai"  TIME        NOT NULL,
  "jenisJadwal" VARCHAR(50) NOT NULL
);

-- =====================================================================
-- 4. PENGAJUAN_JADWAL  (Pegawai 1 : 0..*, Jadwal 1 : 0..*)
-- =====================================================================
CREATE TABLE IF NOT EXISTS pengajuan_jadwal (
  "idPengajuan"     VARCHAR(12)  PRIMARY KEY
                    DEFAULT 'PJAD' || LPAD(nextval('seq_pengajuan_jadwal')::TEXT, 8, '0'),
  "idPegawai"       VARCHAR(10)  NOT NULL
                    REFERENCES pegawai ("idPegawai") ON UPDATE CASCADE ON DELETE RESTRICT,
  "idJadwal"        VARCHAR(10)  NOT NULL
                    REFERENCES jadwal ("idJadwal") ON UPDATE CASCADE ON DELETE RESTRICT,
  "jenisPengajuan"  VARCHAR(50)  NOT NULL,
  "tanggalBaru"     DATE         NULL,   -- NULL jika tidak mengubah tanggal
  "jamMulaiBaru"    TIME         NULL,   -- NULL jika tidak mengubah jam
  "jamSelesaiBaru"  TIME         NULL,   -- NULL jika tidak mengubah jam
  "alasan"          VARCHAR(255) NOT NULL,
  "status"          VARCHAR(20)  NOT NULL,
  "alasanPenolakan" VARCHAR(255) NULL,   -- NULL jika belum ditolak
  "sisaJatahCuti"   SMALLINT     NOT NULL
                    CONSTRAINT chk_pengajuan_jadwal_sisa_cuti CHECK ("sisaJatahCuti" BETWEEN 0 AND 12)
);

-- =====================================================================
-- 5. PENGAJUAN_CUTI  (Pegawai 1 : 0..*)
-- =====================================================================
CREATE TABLE IF NOT EXISTS pengajuan_cuti (
  "idPengajuan"    VARCHAR(12)  PRIMARY KEY
                   DEFAULT 'CUTI' || LPAD(nextval('seq_pengajuan_cuti')::TEXT, 8, '0'),
  "idPegawai"      VARCHAR(10)  NOT NULL
                   REFERENCES pegawai ("idPegawai") ON UPDATE CASCADE ON DELETE RESTRICT,
  "tanggalMulai"   DATE         NOT NULL,
  "tanggalSelesai" DATE         NOT NULL,
  "durasi"         SMALLINT     NOT NULL
                   CONSTRAINT chk_cuti_durasi CHECK ("durasi" > 0),
  "jenisCuti"      VARCHAR(30)  NOT NULL,
  "alasan"         VARCHAR(255) NOT NULL,
  "status"         VARCHAR(20)  NOT NULL,
  "keputusan"      VARCHAR(20)  NULL,    -- NULL sebelum keputusan diberikan
  "catatan"        VARCHAR(255) NULL,
  CONSTRAINT chk_cuti_tanggal CHECK ("tanggalSelesai" >= "tanggalMulai")
);

-- =====================================================================
-- 6. DATA_CUTI_TANGGAL  (kuota cuti per tanggal)
-- =====================================================================
CREATE TABLE IF NOT EXISTS data_cuti_tanggal (
  "tanggal"        DATE     PRIMARY KEY,
  "kuotaMaksimal"  SMALLINT NOT NULL DEFAULT 10
                   CONSTRAINT chk_kuota_maksimal CHECK ("kuotaMaksimal" BETWEEN 1 AND 10),
  "jumlahTerpakai" SMALLINT NOT NULL DEFAULT 0
                   CONSTRAINT chk_jumlah_terpakai CHECK ("jumlahTerpakai" BETWEEN 0 AND 10),
  -- tambahan logis: pemakaian tidak boleh melebihi kuota
  CONSTRAINT chk_terpakai_le_kuota CHECK ("jumlahTerpakai" <= "kuotaMaksimal")
);

-- =====================================================================
-- 7. SURAT_HASIL_CUTI  (PengajuanCuti 1 : SuratHasilCuti 0..1)
-- =====================================================================
CREATE TABLE IF NOT EXISTS surat_hasil_cuti (
  "idSurat"       VARCHAR(12)  PRIMARY KEY
                  DEFAULT 'SRT' || LPAD(nextval('seq_surat_hasil_cuti')::TEXT, 8, '0'),
  "idPengajuan"   VARCHAR(12)  NOT NULL UNIQUE
                  REFERENCES pengajuan_cuti ("idPengajuan") ON UPDATE CASCADE ON DELETE RESTRICT,
  "nomorSurat"    VARCHAR(50)  NOT NULL UNIQUE,
  "tanggalTerbit" DATE         NOT NULL,
  "keputusan"     VARCHAR(20)  NOT NULL,
  "dokumenSurat"  VARCHAR(255) NULL      -- NULL jika surat belum dibuat
);

-- =====================================================================
-- 8. NOTIFIKASI  (PengajuanCuti 1 : Notifikasi 0..*)
-- =====================================================================
CREATE TABLE IF NOT EXISTS notifikasi (
  "idNotifikasi" VARCHAR(12)  PRIMARY KEY
                 DEFAULT 'NTF' || LPAD(nextval('seq_notifikasi')::TEXT, 8, '0'),
  "idAkun"       VARCHAR(10)  NOT NULL
                 REFERENCES akun ("idAkun") ON UPDATE CASCADE ON DELETE CASCADE,
  "idPengajuan"  VARCHAR(12)  NOT NULL
                 REFERENCES pengajuan_cuti ("idPengajuan") ON UPDATE CASCADE ON DELETE CASCADE,
  "pesan"        VARCHAR(255) NOT NULL,
  "statusKirim"  VARCHAR(20)  NOT NULL,
  "tanggalKirim" TIMESTAMP    NOT NULL
);

-- =====================================================================
-- 9. ABSENSI  (Pegawai 1 : Absensi 0..*)
-- =====================================================================
CREATE TABLE IF NOT EXISTS absensi (
  "idAbsensi"       VARCHAR(12) PRIMARY KEY
                    DEFAULT 'ABS' || LPAD(nextval('seq_absensi')::TEXT, 9, '0'),
  "idPegawai"       VARCHAR(10) NOT NULL
                    REFERENCES pegawai ("idPegawai") ON UPDATE CASCADE ON DELETE RESTRICT,
  "idJadwal"        VARCHAR(10) NOT NULL
                    REFERENCES jadwal ("idJadwal") ON UPDATE CASCADE ON DELETE RESTRICT,
  "tanggal"         DATE        NOT NULL,
  "waktuMasuk"      TIMESTAMP   NULL,    -- NULL jika belum presensi masuk
  "waktuPulang"     TIMESTAMP   NULL,    -- NULL jika belum presensi pulang
  "statusKehadiran" VARCHAR(20) NOT NULL,
  "statusPulang"    VARCHAR(20) NULL     -- NULL jika belum presensi pulang
);

-- =====================================================================
-- 10. PENGAJUAN_KETIDAKHADIRAN  (Pegawai 1 : 0..*)
-- =====================================================================
CREATE TABLE IF NOT EXISTS pengajuan_ketidakhadiran (
  "idPengajuan"     VARCHAR(12)  PRIMARY KEY
                    DEFAULT 'KTH' || LPAD(nextval('seq_pengajuan_ketidakhadiran')::TEXT, 8, '0'),
  "idPegawai"       VARCHAR(10)  NOT NULL
                    REFERENCES pegawai ("idPegawai") ON UPDATE CASCADE ON DELETE RESTRICT,
  "tanggalMulai"    DATE         NOT NULL,
  "tanggalSelesai"  DATE         NOT NULL,
  "jenis"           VARCHAR(30)  NOT NULL,
  "alasan"          VARCHAR(255) NOT NULL,
  "berkasPendukung" VARCHAR(255) NULL,
  "status"          VARCHAR(20)  NOT NULL,
  "catatan"         VARCHAR(255) NULL,
  CONSTRAINT chk_ketidakhadiran_tanggal CHECK ("tanggalSelesai" >= "tanggalMulai")
);

-- =====================================================================
-- 11. PENGAJUAN_KOREKSI  (Absensi 1 : PengajuanKoreksi 0..*)
-- =====================================================================
CREATE TABLE IF NOT EXISTS pengajuan_koreksi (
  "idKoreksi"       VARCHAR(12)  PRIMARY KEY
                    DEFAULT 'KOR' || LPAD(nextval('seq_pengajuan_koreksi')::TEXT, 8, '0'),
  "idAbsensi"       VARCHAR(12)  NOT NULL
                    REFERENCES absensi ("idAbsensi") ON UPDATE CASCADE ON DELETE RESTRICT,
  "waktuMasukBaru"  TIMESTAMP    NULL,   -- NULL jika tidak mengoreksi waktu masuk
  "waktuPulangBaru" TIMESTAMP    NULL,   -- NULL jika tidak mengoreksi waktu pulang
  "alasanKoreksi"   VARCHAR(255) NOT NULL,
  "berkasPendukung" VARCHAR(255) NULL,
  "status"          VARCHAR(20)  NOT NULL,
  "catatan"         VARCHAR(255) NULL
);

-- =====================================================================
-- 12. PENGGAJIAN  (Pegawai 1 : Penggajian 0..*)
-- =====================================================================
CREATE TABLE IF NOT EXISTS penggajian (
  "idGaji"           VARCHAR(12)   PRIMARY KEY
                     DEFAULT 'GJI' || LPAD(nextval('seq_penggajian')::TEXT, 8, '0'),
  "idPegawai"        VARCHAR(10)   NOT NULL
                     REFERENCES pegawai ("idPegawai") ON UPDATE CASCADE ON DELETE RESTRICT,
  "periodeGaji"      CHAR(7)       NOT NULL
                     CONSTRAINT chk_penggajian_periode CHECK ("periodeGaji" ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  "gajiPokok"        DECIMAL(12,2) NOT NULL
                     CONSTRAINT chk_gaji_pokok CHECK ("gajiPokok" >= 0),
  "tunjangan"        DECIMAL(12,2) NOT NULL DEFAULT 0
                     CONSTRAINT chk_tunjangan CHECK ("tunjangan" >= 0),
  "potongan"         DECIMAL(12,2) NOT NULL DEFAULT 0
                     CONSTRAINT chk_potongan CHECK ("potongan" >= 0),
  "totalGaji"        DECIMAL(12,2) NOT NULL
                     CONSTRAINT chk_total_gaji CHECK ("totalGaji" >= 0),
  "statusPembayaran" VARCHAR(20)   NOT NULL
);

-- =====================================================================
-- 13. PENGAJUAN_BANDING_GAJI  (Pegawai 1 : 0..*)
-- =====================================================================
CREATE TABLE IF NOT EXISTS pengajuan_banding_gaji (
  "idPengajuan"    VARCHAR(12)  PRIMARY KEY
                   DEFAULT 'BDG' || LPAD(nextval('seq_pengajuan_banding_gaji')::TEXT, 8, '0'),
  "idPegawai"      VARCHAR(10)  NOT NULL
                   REFERENCES pegawai ("idPegawai") ON UPDATE CASCADE ON DELETE RESTRICT,
  "periodeGaji"    CHAR(7)      NOT NULL
                   CONSTRAINT chk_banding_periode CHECK ("periodeGaji" ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  "alasanBanding"  VARCHAR(255) NOT NULL,
  "buktiPendukung" VARCHAR(255) NULL,
  "status"         VARCHAR(20)  NOT NULL,
  "keputusan"      VARCHAR(20)  NULL     -- NULL sebelum keputusan diberikan
);

-- =====================================================================
-- 14. REKENING_PEGAWAI  (Pegawai 1 : RekeningPegawai 0..*)
-- =====================================================================
CREATE TABLE IF NOT EXISTS rekening_pegawai (
  "idRekening"    VARCHAR(12)  PRIMARY KEY
                  DEFAULT 'REK' || LPAD(nextval('seq_rekening_pegawai')::TEXT, 8, '0'),
  "idPegawai"     VARCHAR(10)  NOT NULL
                  REFERENCES pegawai ("idPegawai") ON UPDATE CASCADE ON DELETE RESTRICT,
  "namaBank"      VARCHAR(50)  NOT NULL,
  "nomorRekening" VARCHAR(30)  NOT NULL,
  "atasNama"      VARCHAR(100) NOT NULL
);

-- =====================================================================
-- 15. TRANSAKSI_PEMBAYARAN  (Pegawai 1 : TransaksiPembayaran 0..*)
-- =====================================================================
CREATE TABLE IF NOT EXISTS transaksi_pembayaran (
  "idTransaksi"      VARCHAR(12)   PRIMARY KEY
                     DEFAULT 'TRX' || LPAD(nextval('seq_transaksi_pembayaran')::TEXT, 8, '0'),
  "idPegawai"        VARCHAR(10)   NOT NULL
                     REFERENCES pegawai ("idPegawai") ON UPDATE CASCADE ON DELETE RESTRICT,
  "idRekening"       VARCHAR(12)   NOT NULL
                     REFERENCES rekening_pegawai ("idRekening") ON UPDATE CASCADE ON DELETE RESTRICT,
  "nominal"          DECIMAL(12,2) NOT NULL
                     CONSTRAINT chk_nominal CHECK ("nominal" > 0),
  "jenisTransaksi"   VARCHAR(30)   NOT NULL,
  "status"           VARCHAR(20)   NOT NULL,
  "tanggalTransaksi" TIMESTAMP     NOT NULL
);

-- =====================================================================
-- 16. PERAN_TENAGA_MEDIS  (master peran: Dokter, Perawat, dll)
--     Pegawai 0..* : PeranTenagaMedis 0..1
--     akun.role tetap kategori umum (mis. 'Tenaga Medis'); peran detail
--     disimpan di pegawai."idPeran" (NULL untuk pegawai non-medis).
-- =====================================================================
CREATE SEQUENCE IF NOT EXISTS seq_peran_tenaga_medis;
CREATE SEQUENCE IF NOT EXISTS seq_pedoman_penggajian;

CREATE TABLE IF NOT EXISTS peran_tenaga_medis (
  "idPeran"   VARCHAR(10)  PRIMARY KEY
              DEFAULT 'PRN' || LPAD(nextval('seq_peran_tenaga_medis')::TEXT, 7, '0'),
  "namaPeran" VARCHAR(50)  NOT NULL UNIQUE,
  "kategori"  VARCHAR(50)  NOT NULL,
  "deskripsi" VARCHAR(255) NULL
);

INSERT INTO peran_tenaga_medis ("idPeran","namaPeran","kategori","deskripsi") VALUES
  ('PRN0000001','Dokter Umum',         'Medis',                 'Dokter layanan umum / IGD / poli umum'),
  ('PRN0000002','Dokter Spesialis',    'Medis',                 'Dokter dengan kualifikasi spesialis'),
  ('PRN0000003','Dokter Gigi',         'Medis',                 'Dokter layanan gigi dan mulut'),
  ('PRN0000004','Perawat',             'Keperawatan',           'Tenaga keperawatan'),
  ('PRN0000005','Bidan',               'Kebidanan',             'Tenaga kebidanan'),
  ('PRN0000006','Apoteker',            'Kefarmasian',           'Tenaga kefarmasian / instalasi farmasi'),
  ('PRN0000007','Analis Laboratorium', 'Penunjang Medis',       'Tenaga laboratorium klinik'),
  ('PRN0000008','Radiografer',         'Penunjang Medis',       'Tenaga radiologi'),
  ('PRN0000009','Fisioterapis',        'Penunjang Medis',       'Tenaga fisioterapi / rehabilitasi medik'),
  ('PRN0000010','Ahli Gizi',           'Penunjang Medis',       'Tenaga gizi klinik')
ON CONFLICT DO NOTHING;

SELECT setval('seq_peran_tenaga_medis', GREATEST((SELECT COUNT(*) FROM peran_tenaga_medis), 1));

-- Pegawai -> peran (NULL untuk non-medis). Pakai ALTER agar aman juga
-- untuk database yang sudah dibuat sebelumnya.
ALTER TABLE pegawai ADD COLUMN IF NOT EXISTS "idPeran" VARCHAR(10) NULL
  REFERENCES peran_tenaga_medis ("idPeran") ON UPDATE CASCADE ON DELETE SET NULL;

-- =====================================================================
-- 17. PEDOMAN_PENGGAJIAN  (PeranTenagaMedis 1 : PedomanPenggajian 0..*)
--     Satu peran bisa punya beberapa versi pedoman berdasarkan masa
--     berlaku. Semua nominal dalam Rupiah.
-- =====================================================================
CREATE TABLE IF NOT EXISTS pedoman_penggajian (
  "idPedoman"                    VARCHAR(12)   PRIMARY KEY
                                 DEFAULT 'PDG' || LPAD(nextval('seq_pedoman_penggajian')::TEXT, 8, '0'),
  "idPeran"                      VARCHAR(10)   NOT NULL
                                 REFERENCES peran_tenaga_medis ("idPeran") ON UPDATE CASCADE ON DELETE RESTRICT,
  -- komponen pendapatan
  "gajiPokok"                    DECIMAL(12,2) NOT NULL CHECK ("gajiPokok" >= 0),
  "tunjanganJabatan"             DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK ("tunjanganJabatan" >= 0),             -- tetap per bulan
  "tunjanganShiftMalam"          DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK ("tunjanganShiftMalam" >= 0),          -- per shift malam
  "uangLemburPerJam"             DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK ("uangLemburPerJam" >= 0),             -- per jam lembur
  "tunjanganKehadiranPerHari"    DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK ("tunjanganKehadiranPerHari" >= 0),    -- per hari hadir
  "persenInsentifJasaMedis"      DECIMAL(5,2)  NOT NULL DEFAULT 0 CHECK ("persenInsentifJasaMedis" BETWEEN 0 AND 100), -- % dari nilai jasa/tindakan
  -- komponen potongan
  "potonganTidakHadirPerHari"    DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK ("potonganTidakHadirPerHari" >= 0),    -- per hari alpa
  "potonganTerlambatPerKejadian" DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK ("potonganTerlambatPerKejadian" >= 0), -- per kejadian terlambat
  -- masa berlaku
  "berlakuMulai"                 DATE          NOT NULL,
  "berlakuSampai"                DATE          NULL,   -- NULL = masih berlaku
  "keterangan"                   VARCHAR(255)  NULL,
  CONSTRAINT chk_pedoman_berlaku CHECK ("berlakuSampai" IS NULL OR "berlakuSampai" >= "berlakuMulai"),
  CONSTRAINT uq_pedoman_peran_mulai UNIQUE ("idPeran", "berlakuMulai")
);

-- Penggajian -> pedoman yang dipakai saat perhitungan (NULL untuk non-medis / input manual)
ALTER TABLE penggajian ADD COLUMN IF NOT EXISTS "idPedoman" VARCHAR(12) NULL
  REFERENCES pedoman_penggajian ("idPedoman") ON UPDATE CASCADE ON DELETE RESTRICT;

-- ---------------------------------------------------------------------
-- Fungsi perhitungan gaji tenaga medis berdasarkan pedoman.
-- Mengambil pedoman yang berlaku pada periode tsb untuk peran pegawai,
-- lalu menghitung rincian. Hasilnya dipakai backend untuk mengisi
-- penggajian ("gajiPokok","tunjangan","potongan","totalGaji","idPedoman").
--
-- Rumus:
--   tunjangan = tunjanganJabatan
--             + jumlahShiftMalam * tunjanganShiftMalam
--             + jamLembur        * uangLemburPerJam
--             + hariHadir        * tunjanganKehadiranPerHari
--             + nilaiJasaMedis   * persenInsentifJasaMedis / 100
--   potongan  = hariAlpa         * potonganTidakHadirPerHari
--             + jumlahTerlambat  * potonganTerlambatPerKejadian
--   totalGaji = MAX(gajiPokok + tunjangan - potongan, 0)
--
-- Contoh (supabase-js):
--   supabase.rpc('hitung_gaji_tenaga_medis', {
--     p_id_pegawai: 'PGW0000001', p_periode: '2026-10',
--     p_jumlah_shift_malam: 6, p_jam_lembur: 10, p_hari_hadir: 22,
--     p_nilai_jasa_medis: 0, p_hari_alpa: 0, p_jumlah_terlambat: 1 })
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION hitung_gaji_tenaga_medis(
  p_id_pegawai         VARCHAR,
  p_periode            CHAR(7),
  p_jumlah_shift_malam INTEGER DEFAULT 0,
  p_jam_lembur         NUMERIC DEFAULT 0,
  p_hari_hadir         INTEGER DEFAULT 0,
  p_nilai_jasa_medis   NUMERIC DEFAULT 0,
  p_hari_alpa          INTEGER DEFAULT 0,
  p_jumlah_terlambat   INTEGER DEFAULT 0
)
RETURNS TABLE (
  "idPedoman"           VARCHAR,
  "namaPeran"           VARCHAR,
  "gajiPokok"           NUMERIC,
  "tunjanganJabatan"    NUMERIC,
  "tunjanganShiftMalam" NUMERIC,
  "uangLembur"          NUMERIC,
  "tunjanganKehadiran"  NUMERIC,
  "insentifJasaMedis"   NUMERIC,
  "tunjangan"           NUMERIC,
  "potonganTidakHadir"  NUMERIC,
  "potonganTerlambat"   NUMERIC,
  "potongan"            NUMERIC,
  "totalGaji"           NUMERIC
)
LANGUAGE plpgsql
STABLE
AS $$
#variable_conflict use_column
DECLARE
  v_awal  DATE;
  v_akhir DATE;
  v_peran VARCHAR(10);
  r       pedoman_penggajian%ROWTYPE;
BEGIN
  IF p_periode !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' THEN
    RAISE EXCEPTION 'Format periode harus YYYY-MM, diterima: %', p_periode;
  END IF;

  IF LEAST(p_jumlah_shift_malam, p_jam_lembur, p_hari_hadir, p_nilai_jasa_medis,
           p_hari_alpa, p_jumlah_terlambat) < 0 THEN
    RAISE EXCEPTION 'Nilai input perhitungan tidak boleh negatif';
  END IF;

  v_awal  := TO_DATE(p_periode || '-01', 'YYYY-MM-DD');
  v_akhir := (v_awal + INTERVAL '1 month' - INTERVAL '1 day')::DATE;

  SELECT pg."idPeran" INTO v_peran FROM pegawai pg WHERE pg."idPegawai" = p_id_pegawai;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Pegawai % tidak ditemukan', p_id_pegawai;
  END IF;
  IF v_peran IS NULL THEN
    RAISE EXCEPTION 'Pegawai % bukan tenaga medis (idPeran kosong)', p_id_pegawai;
  END IF;

  SELECT pd.* INTO r
  FROM pedoman_penggajian pd
  WHERE pd."idPeran" = v_peran
    AND pd."berlakuMulai" <= v_akhir
    AND (pd."berlakuSampai" IS NULL OR pd."berlakuSampai" >= v_awal)
  ORDER BY pd."berlakuMulai" DESC
  LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Belum ada pedoman penggajian yang berlaku untuk peran % pada periode %', v_peran, p_periode;
  END IF;

  "idPedoman"           := r."idPedoman";
  "namaPeran"           := (SELECT pr."namaPeran" FROM peran_tenaga_medis pr WHERE pr."idPeran" = v_peran);
  "gajiPokok"           := r."gajiPokok";
  "tunjanganJabatan"    := r."tunjanganJabatan";
  "tunjanganShiftMalam" := p_jumlah_shift_malam * r."tunjanganShiftMalam";
  "uangLembur"          := ROUND(p_jam_lembur * r."uangLemburPerJam", 2);
  "tunjanganKehadiran"  := p_hari_hadir * r."tunjanganKehadiranPerHari";
  "insentifJasaMedis"   := ROUND(p_nilai_jasa_medis * r."persenInsentifJasaMedis" / 100, 2);
  "tunjangan"           := "tunjanganJabatan" + "tunjanganShiftMalam" + "uangLembur"
                           + "tunjanganKehadiran" + "insentifJasaMedis";
  "potonganTidakHadir"  := p_hari_alpa * r."potonganTidakHadirPerHari";
  "potonganTerlambat"   := p_jumlah_terlambat * r."potonganTerlambatPerKejadian";
  "potongan"            := "potonganTidakHadir" + "potonganTerlambat";
  "totalGaji"           := GREATEST("gajiPokok" + "tunjangan" - "potongan", 0);

  RETURN NEXT;
END;
$$;

-- Hanya backend (service role) yang boleh memanggil lewat RPC
REVOKE EXECUTE ON FUNCTION hitung_gaji_tenaga_medis(VARCHAR, CHAR, INTEGER, NUMERIC, INTEGER, NUMERIC, INTEGER, INTEGER) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION hitung_gaji_tenaga_medis(VARCHAR, CHAR, INTEGER, NUMERIC, INTEGER, NUMERIC, INTEGER, INTEGER) TO service_role;

-- ---------------------------------------------------------------------
-- Index untuk kolom FK (PostgreSQL tidak membuatnya otomatis)
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_jadwal_pegawai             ON jadwal ("idPegawai");
CREATE INDEX IF NOT EXISTS idx_jadwal_tanggal             ON jadwal ("tanggal");
CREATE INDEX IF NOT EXISTS idx_pengajuan_jadwal_pegawai   ON pengajuan_jadwal ("idPegawai");
CREATE INDEX IF NOT EXISTS idx_pengajuan_jadwal_jadwal    ON pengajuan_jadwal ("idJadwal");
CREATE INDEX IF NOT EXISTS idx_pengajuan_cuti_pegawai     ON pengajuan_cuti ("idPegawai");
CREATE INDEX IF NOT EXISTS idx_notifikasi_akun            ON notifikasi ("idAkun");
CREATE INDEX IF NOT EXISTS idx_notifikasi_pengajuan       ON notifikasi ("idPengajuan");
CREATE INDEX IF NOT EXISTS idx_absensi_pegawai            ON absensi ("idPegawai");
CREATE INDEX IF NOT EXISTS idx_absensi_jadwal             ON absensi ("idJadwal");
CREATE INDEX IF NOT EXISTS idx_absensi_tanggal            ON absensi ("tanggal");
CREATE INDEX IF NOT EXISTS idx_ketidakhadiran_pegawai     ON pengajuan_ketidakhadiran ("idPegawai");
CREATE INDEX IF NOT EXISTS idx_koreksi_absensi            ON pengajuan_koreksi ("idAbsensi");
CREATE INDEX IF NOT EXISTS idx_penggajian_pegawai         ON penggajian ("idPegawai");
CREATE INDEX IF NOT EXISTS idx_banding_pegawai            ON pengajuan_banding_gaji ("idPegawai");
CREATE INDEX IF NOT EXISTS idx_rekening_pegawai           ON rekening_pegawai ("idPegawai");
CREATE INDEX IF NOT EXISTS idx_transaksi_pegawai          ON transaksi_pembayaran ("idPegawai");
CREATE INDEX IF NOT EXISTS idx_transaksi_rekening         ON transaksi_pembayaran ("idRekening");
CREATE INDEX IF NOT EXISTS idx_pegawai_peran              ON pegawai ("idPeran");
CREATE INDEX IF NOT EXISTS idx_penggajian_pedoman         ON penggajian ("idPedoman");

-- ---------------------------------------------------------------------
-- Row Level Security
-- Tabel di schema public otomatis terekspos lewat API Supabase (anon key).
-- RLS diaktifkan TANPA policy => hanya backend (service role key) yang
-- bisa membaca/menulis. Tambahkan policy nanti jika frontend perlu akses
-- langsung.
-- ---------------------------------------------------------------------
ALTER TABLE pegawai                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE akun                     ENABLE ROW LEVEL SECURITY;
ALTER TABLE jadwal                   ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengajuan_jadwal         ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengajuan_cuti           ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_cuti_tanggal        ENABLE ROW LEVEL SECURITY;
ALTER TABLE surat_hasil_cuti         ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifikasi               ENABLE ROW LEVEL SECURITY;
ALTER TABLE absensi                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengajuan_ketidakhadiran ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengajuan_koreksi        ENABLE ROW LEVEL SECURITY;
ALTER TABLE penggajian               ENABLE ROW LEVEL SECURITY;
ALTER TABLE pengajuan_banding_gaji   ENABLE ROW LEVEL SECURITY;
ALTER TABLE rekening_pegawai         ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaksi_pembayaran     ENABLE ROW LEVEL SECURITY;
ALTER TABLE peran_tenaga_medis       ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedoman_penggajian       ENABLE ROW LEVEL SECURITY;

COMMIT;

-- =====================================================================
-- RESET (opsional) - HAPUS SEMUA TABEL. Uncomment & jalankan jika perlu.
-- =====================================================================
-- DROP TABLE IF EXISTS
--   transaksi_pembayaran, rekening_pegawai, pengajuan_banding_gaji, penggajian,
--   pengajuan_koreksi, pengajuan_ketidakhadiran, absensi, notifikasi,
--   surat_hasil_cuti, data_cuti_tanggal, pengajuan_cuti, pengajuan_jadwal,
--   jadwal, akun, pegawai, pedoman_penggajian, peran_tenaga_medis CASCADE;
-- DROP FUNCTION IF EXISTS hitung_gaji_tenaga_medis;
-- DROP SEQUENCE IF EXISTS
--   seq_pegawai, seq_akun, seq_jadwal, seq_pengajuan_jadwal, seq_pengajuan_cuti,
--   seq_surat_hasil_cuti, seq_notifikasi, seq_absensi, seq_pengajuan_ketidakhadiran,
--   seq_pengajuan_koreksi, seq_penggajian, seq_pengajuan_banding_gaji,
--   seq_rekening_pegawai, seq_transaksi_pembayaran,
--   seq_peran_tenaga_medis, seq_pedoman_penggajian;
