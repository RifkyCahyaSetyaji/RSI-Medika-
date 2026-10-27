-- =====================================================================
-- RSI Medika - Data contoh (seed) sesuai kolom "Contoh Data" kamus data
-- Jalankan SETELAH schema.sql. Aman dijalankan ulang (ON CONFLICT DO NOTHING).
-- =====================================================================

BEGIN;

INSERT INTO pegawai ("idPegawai","nama","nip","alamat","noTelp","email","jabatan","unitKerja","statusPegawai","tanggalMasuk","sisaJatahCuti","idPeran")
VALUES ('PGW0000001','Andi Pratama','198765432101','Jl. Melati No. 10','081234567890','andi@example.com','Perawat','Unit Rawat Inap','Aktif','2024-01-15',12,'PRN0000004')
ON CONFLICT DO NOTHING;

-- ---------------------------------------------------------------------
-- PEDOMAN PENGGAJIAN - isi nominal sesuai kebijakan RS, lalu uncomment.
-- Urutan kolom: gajiPokok, tunjanganJabatan, tunjanganShiftMalam,
--   uangLemburPerJam, tunjanganKehadiranPerHari, persenInsentifJasaMedis,
--   potonganTidakHadirPerHari, potonganTerlambatPerKejadian
-- ---------------------------------------------------------------------
-- INSERT INTO pedoman_penggajian
--   ("idPeran","gajiPokok","tunjanganJabatan","tunjanganShiftMalam","uangLemburPerJam",
--    "tunjanganKehadiranPerHari","persenInsentifJasaMedis","potonganTidakHadirPerHari",
--    "potonganTerlambatPerKejadian","berlakuMulai","keterangan")
-- VALUES
--   ('PRN0000001', 0, 0, 0, 0, 0, 0, 0, 0, '2026-01-01', 'Dokter Umum'),
--   ('PRN0000002', 0, 0, 0, 0, 0, 0, 0, 0, '2026-01-01', 'Dokter Spesialis'),
--   ('PRN0000003', 0, 0, 0, 0, 0, 0, 0, 0, '2026-01-01', 'Dokter Gigi'),
--   ('PRN0000004', 0, 0, 0, 0, 0, 0, 0, 0, '2026-01-01', 'Perawat'),
--   ('PRN0000005', 0, 0, 0, 0, 0, 0, 0, 0, '2026-01-01', 'Bidan'),
--   ('PRN0000006', 0, 0, 0, 0, 0, 0, 0, 0, '2026-01-01', 'Apoteker'),
--   ('PRN0000007', 0, 0, 0, 0, 0, 0, 0, 0, '2026-01-01', 'Analis Laboratorium'),
--   ('PRN0000008', 0, 0, 0, 0, 0, 0, 0, 0, '2026-01-01', 'Radiografer'),
--   ('PRN0000009', 0, 0, 0, 0, 0, 0, 0, 0, '2026-01-01', 'Fisioterapis'),
--   ('PRN0000010', 0, 0, 0, 0, 0, 0, 0, 0, '2026-01-01', 'Ahli Gizi')
-- ON CONFLICT DO NOTHING;

-- password: ganti dengan hash bcrypt asli dari backend (contoh di bawah bukan hash valid)
INSERT INTO akun ("idAkun","idPegawai","username","password","role")
VALUES ('AKN0000001','PGW0000001','andipratama','$2b$12$contohHash','Tenaga Medis')
ON CONFLICT DO NOTHING;

INSERT INTO jadwal ("idJadwal","idPegawai","tanggal","jamMulai","jamSelesai","jenisJadwal")
VALUES ('JDW0000001','PGW0000001','2026-11-02','08:00:00','16:00:00','Shift Pagi')
ON CONFLICT DO NOTHING;

INSERT INTO pengajuan_jadwal ("idPengajuan","idPegawai","idJadwal","jenisPengajuan","tanggalBaru","jamMulaiBaru","jamSelesaiBaru","alasan","status","alasanPenolakan","sisaJatahCuti")
VALUES ('PJAD00000001','PGW0000001','JDW0000001','Perubahan Jadwal','2026-11-03','09:00:00','17:00:00','Ada keperluan keluarga','Menunggu',NULL,12)
ON CONFLICT DO NOTHING;

INSERT INTO pengajuan_cuti ("idPengajuan","idPegawai","tanggalMulai","tanggalSelesai","durasi","jenisCuti","alasan","status","keputusan","catatan")
VALUES ('CUTI00000001','PGW0000001','2026-11-02','2026-11-03',2,'Cuti Tahunan','Keperluan keluarga','Menunggu',NULL,NULL)
ON CONFLICT DO NOTHING;

INSERT INTO data_cuti_tanggal ("tanggal","kuotaMaksimal","jumlahTerpakai")
VALUES ('2026-11-02',10,7)
ON CONFLICT DO NOTHING;

INSERT INTO surat_hasil_cuti ("idSurat","idPengajuan","nomorSurat","tanggalTerbit","keputusan","dokumenSurat")
VALUES ('SRT00000001','CUTI00000001','SKC/001/XI/2026','2026-10-25','Disetujui','dokumen/surat001.pdf')
ON CONFLICT DO NOTHING;

INSERT INTO notifikasi ("idNotifikasi","idAkun","idPengajuan","pesan","statusKirim","tanggalKirim")
VALUES ('NTF00000001','AKN0000001','CUTI00000001','Pengajuan cuti Anda disetujui','Terkirim','2026-10-25 10:30:00')
ON CONFLICT DO NOTHING;

INSERT INTO absensi ("idAbsensi","idPegawai","idJadwal","tanggal","waktuMasuk","waktuPulang","statusKehadiran","statusPulang")
VALUES ('ABS000000001','PGW0000001','JDW0000001','2026-11-02','2026-11-02 07:55:00','2026-11-02 16:05:00','Hadir','Sudah Pulang')
ON CONFLICT DO NOTHING;

INSERT INTO pengajuan_ketidakhadiran ("idPengajuan","idPegawai","tanggalMulai","tanggalSelesai","jenis","alasan","berkasPendukung","status","catatan")
VALUES ('KTH00000001','PGW0000001','2026-11-02','2026-11-02','Izin','Keperluan mendesak','berkas/surat_izin.pdf','Menunggu','Menunggu pemeriksaan')
ON CONFLICT DO NOTHING;

INSERT INTO pengajuan_koreksi ("idKoreksi","idAbsensi","waktuMasukBaru","waktuPulangBaru","alasanKoreksi","berkasPendukung","status","catatan")
VALUES ('KOR00000001','ABS000000001','2026-11-02 08:00:00','2026-11-02 16:00:00','Mesin presensi mengalami gangguan','berkas/bukti_koreksi.pdf','Menunggu','Menunggu verifikasi')
ON CONFLICT DO NOTHING;

INSERT INTO penggajian ("idGaji","idPegawai","periodeGaji","gajiPokok","tunjangan","potongan","totalGaji","statusPembayaran")
VALUES ('GJI00000001','PGW0000001','2026-10',5000000.00,750000.00,100000.00,5650000.00,'Belum Dibayar')
ON CONFLICT DO NOTHING;

INSERT INTO pengajuan_banding_gaji ("idPengajuan","idPegawai","periodeGaji","alasanBanding","buktiPendukung","status","keputusan")
VALUES ('BDG00000001','PGW0000001','2026-10','Tunjangan belum tercatat','berkas/bukti_gaji.pdf','Menunggu',NULL)
ON CONFLICT DO NOTHING;

INSERT INTO rekening_pegawai ("idRekening","idPegawai","namaBank","nomorRekening","atasNama")
VALUES ('REK00000001','PGW0000001','Bank Mandiri','123456789012','Andi Pratama')
ON CONFLICT DO NOTHING;

INSERT INTO transaksi_pembayaran ("idTransaksi","idPegawai","idRekening","nominal","jenisTransaksi","status","tanggalTransaksi")
VALUES ('TRX00000001','PGW0000001','REK00000001',5650000.00,'Pembayaran Gaji','Berhasil','2026-10-25 09:00:00')
ON CONFLICT DO NOTHING;

-- Majukan sequence supaya ID otomatis berikutnya tidak bentrok dengan data seed
SELECT setval('seq_pegawai',                  GREATEST((SELECT COUNT(*) FROM pegawai), 1));
SELECT setval('seq_akun',                     GREATEST((SELECT COUNT(*) FROM akun), 1));
SELECT setval('seq_jadwal',                   GREATEST((SELECT COUNT(*) FROM jadwal), 1));
SELECT setval('seq_pengajuan_jadwal',         GREATEST((SELECT COUNT(*) FROM pengajuan_jadwal), 1));
SELECT setval('seq_pengajuan_cuti',           GREATEST((SELECT COUNT(*) FROM pengajuan_cuti), 1));
SELECT setval('seq_surat_hasil_cuti',         GREATEST((SELECT COUNT(*) FROM surat_hasil_cuti), 1));
SELECT setval('seq_notifikasi',               GREATEST((SELECT COUNT(*) FROM notifikasi), 1));
SELECT setval('seq_absensi',                  GREATEST((SELECT COUNT(*) FROM absensi), 1));
SELECT setval('seq_pengajuan_ketidakhadiran', GREATEST((SELECT COUNT(*) FROM pengajuan_ketidakhadiran), 1));
SELECT setval('seq_pengajuan_koreksi',        GREATEST((SELECT COUNT(*) FROM pengajuan_koreksi), 1));
SELECT setval('seq_penggajian',               GREATEST((SELECT COUNT(*) FROM penggajian), 1));
SELECT setval('seq_pengajuan_banding_gaji',   GREATEST((SELECT COUNT(*) FROM pengajuan_banding_gaji), 1));
SELECT setval('seq_rekening_pegawai',         GREATEST((SELECT COUNT(*) FROM rekening_pegawai), 1));
SELECT setval('seq_transaksi_pembayaran',     GREATEST((SELECT COUNT(*) FROM transaksi_pembayaran), 1));

COMMIT;
