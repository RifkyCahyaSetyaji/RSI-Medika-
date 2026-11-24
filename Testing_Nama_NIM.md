# LAPORAN DOKUMENTASI PENGUJIAN PERANGKAT LUNAK (WHITE-BOX TESTING)

---

### **INFORMASI MAHASISWA & PROYEK**
- **Nama** : Rifky Cahya Setyaji
- **NIM** : [Isi NIM Anda] *(contoh: 21120120140xxx)*
- **Kelompok** : [Isi Nomor/Nama Kelompok Anda]
- **Topik SI** : Sistem Informasi Manajemen Rumah Sakit & HRIS Terpadu (RSI Medika)
- **Modul / Fitur** : Fitur Kepegawaian & Penggajian (Payroll System)
- **Metode Pengujian**: White-Box Testing (*Branch Testing* & *Domain Boundary Testing*)

---

## 1. Deskripsi Singkat Fungsi yang Diuji

Fungsi yang diuji adalah **`hitungKomponenGaji(pedoman, metrik)`** yang berlokasi pada berkas backend `web-be/src/services/penggajian.service.js`.

### **Deskripsi & Logika Bisnis:**
Fungsi `hitungKomponenGaji` merupakan fungsi inti kalkulasi penggajian pegawai/tenaga medis rumah sakit. Fungsi ini bertugas mengolah data tarif dasar pegawai dari master pedoman aktif (`pedoman`) dan data akumulasi kehadiran bulanan (`metrik`), lalu menghasilkan rincian slip gaji resmi. 

**Komponen & Aturan Perhitungan:**
1. **Sanitasi Nilai Input:** Parameter metrik kehadiran (shift malam, jam lembur, hari hadir, nilai jasa medis, hari alpa, keterlambatan) divalidasi ke nilai non-negatif melalui `Math.max(0, Number(val ?? 0))`.
2. **Kalkulasi Hak Pendapatan & Tunjangan:**
   - $\text{Tunjangan Shift Malam} = \text{jumlahShiftMalam} \times \text{tarifShiftMalam}$
   - $\text{Uang Lembur} = \text{jamLembur} \times \text{uangLemburPerJam}$
   - $\text{Tunjangan Kehadiran} = \text{hariHadir} \times \text{tunjanganHarian}$
   - $\text{Insentif Jasa Medis} = (\text{nilaiJasaMedis} \times \text{persenInsentif}) / 100$
   - $\text{Total Tunjangan} = \max(0, \text{Tunjangan Jabatan} + \text{Shift} + \text{Lembur} + \text{Kehadiran} + \text{Jasa Medis} + \text{Tunjangan Tambahan})$
   - $\text{Total Pendapatan} = \text{Gaji Pokok} + \text{Total Tunjangan}$
3. **Kalkulasi Potongan & Batasan Gaji Bersih:**
   - $\text{Potongan Tidak Hadir} = \text{hariAlpa} \times \text{potonganPerHari}$
   - $\text{Potongan Terlambat} = \text{jumlahTerlambat} \times \text{potonganPerKejadian}$
   - $\text{Total Potongan} = \max(0, \text{Potongan Tidak Hadir} + \text{Potongan Terlambat} + \text{Potongan Tambahan})$
   - $\text{Total Gaji Bersih} = \max(0, \text{Total Pendapatan} - \text{Total Potongan})$ *(Menjamin gaji bersih tidak pernah bernilai negatif meskipun akumulasi sanksi/potongan melebihi pendapatan).*

---

## 2. Potongan Source Code Fungsi

Berikut adalah implementasi fungsi `hitungKomponenGaji` dari `web-be/src/services/penggajian.service.js` (Baris 128–178):

```javascript
/** Hitung rincian komponen gaji sesuai rumus fungsi SQL hitung_gaji_tenaga_medis. */
export function hitungKomponenGaji(pedoman, metrik = {}) {
  // [Node 1] Sanitasi nilai metrik (Domain & Boundary Handling)
  const jumlahShiftMalam = Math.max(0, Number(metrik.jumlahShiftMalam ?? 0));
  const jamLembur = Math.max(0, Number(metrik.jamLembur ?? 0));
  const hariHadir = Math.max(0, Number(metrik.hariHadir ?? 0));
  const nilaiJasaMedis = Math.max(0, Number(metrik.nilaiJasaMedis ?? 0));
  const hariAlpa = Math.max(0, Number(metrik.hariAlpa ?? 0));
  const jumlahTerlambat = Math.max(0, Number(metrik.jumlahTerlambat ?? 0));
  const tunjanganTambahan = Number(metrik.tunjanganTambahan ?? 0);
  const potonganTambahan = Number(metrik.potonganTambahan ?? 0);

  // [Node 2] Perhitungan komponen tunjangan
  const gajiPokok = num(pedoman.gajiPokok);
  const tunjanganJabatan = num(pedoman.tunjanganJabatan);
  const tunjanganShiftMalam = round2(jumlahShiftMalam * num(pedoman.tunjanganShiftMalam));
  const uangLembur = round2(jamLembur * num(pedoman.uangLemburPerJam));
  const tunjanganKehadiran = round2(hariHadir * num(pedoman.tunjanganKehadiranPerHari));
  const insentifJasaMedis = round2((nilaiJasaMedis * num(pedoman.persenInsentifJasaMedis)) / 100);

  // [Decision 1 / Branch 1-2] Validasi total tunjangan non-negatif
  const tunjangan = Math.max(
    0,
    round2(tunjanganJabatan + tunjanganShiftMalam + uangLembur + tunjanganKehadiran + insentifJasaMedis + tunjanganTambahan),
  );

  // [Node 3] Perhitungan komponen potongan
  const potonganTidakHadir = round2(hariAlpa * num(pedoman.potonganTidakHadirPerHari));
  const potonganTerlambat = round2(jumlahTerlambat * num(pedoman.potonganTerlambatPerKejadian));
  
  // [Decision 2 / Branch 3-4] Validasi total potongan non-negatif
  const potongan = Math.max(0, round2(potonganTidakHadir + potonganTerlambat + potonganTambahan));

  // [Decision 3 / Branch 5-6] Validasi total gaji bersih non-negatif
  const totalPendapatan = round2(gajiPokok + tunjangan);
  const totalGaji = Math.max(0, round2(totalPendapatan - potongan));

  return {
    idPedoman: pedoman.idPedoman,
    gajiPokok,
    rincianTunjangan: {
      tunjanganJabatan, tunjanganShiftMalam, uangLembur,
      tunjanganKehadiran, insentifJasaMedis, tunjanganTambahan: round2(tunjanganTambahan),
    },
    tunjangan,
    rincianPotongan: {
      potonganTidakHadir, potonganTerlambat, potonganTambahan: round2(potonganTambahan),
    },
    potongan,
    totalPendapatan,
    totalGaji,
  };
}
```

---

## 3. Tabel Pengujian (Branch Testing & Domain Testing)

**Basis Pedoman Uji (Data Standar Tarif):**
- Gaji Pokok: Rp 5.000.000 | Tunjangan Jabatan: Rp 1.000.000 | Tunjangan Shift Malam: Rp 75.000/shift
- Lembur: Rp 50.000/jam | Tunjangan Kehadiran: Rp 25.000/hari | Insentif Jasa Medis: 5%
- Potongan Alpa: Rp 150.000/hari | Potongan Terlambat: Rp 50.000/kejadian

| ID Uji | Metode & Target Branch / Domain | Input (Metrik & Parameter) | Expected Result | Result (Actual) | Status |
| :--- | :--- | :--- | :--- | :--- | :---: |
| **TC-01** | **Branch Testing (Jalur Normal)**<br>• Tunjangan > 0 (True)<br>• Potongan > 0 (True)<br>• (Pendapatan - Potongan) > 0 (True) | `jumlahShiftMalam`: 4<br>`jamLembur`: 10<br>`hariHadir`: 20<br>`nilaiJasaMedis`: Rp 10.000.000<br>`hariAlpa`: 1<br>`jumlahTerlambat`: 2<br>`tunjanganTambahan`: Rp 200.000<br>`potonganTambahan`: Rp 0 | • Tunjangan = Rp 3.000.000<br>• Pendapatan = Rp 8.000.000<br>• Potongan = Rp 250.000<br>• Total Gaji = **Rp 7.750.000** | • Tunjangan = Rp 3.000.000<br>• Pendapatan = Rp 8.000.000<br>• Potongan = Rp 250.000<br>• Total Gaji = **Rp 7.750.000** | **PASS** |
| **TC-02** | **Domain Testing (Boundary Nol/Kosong)**<br>• Input metrik kosong `{}`<br>• Branch fallback `?? 0` aktif | `metrik` = `{}` *(tanpa atribut absensi dan lembur)* | • Tunjangan = Rp 1.000.000 (hanya Jabatan)<br>• Potongan = Rp 0<br>• Total Gaji = **Rp 6.000.000** | • Tunjangan = Rp 1.000.000<br>• Potongan = Rp 0<br>• Total Gaji = **Rp 6.000.000** | **PASS** |
| **TC-03** | **Branch Testing (Branch Defense Gaji Minus)**<br>• Potongan > Pendapatan (True)<br>• Branch `Math.max(0, net)` aktif | `hariAlpa`: 10 (Rp 1.500.000)<br>`potonganTambahan`: Rp 10.000.000<br>*(Total Potongan: Rp 11.500.000 melebihi pendapatan Rp 6.000.000)* | • Potongan = Rp 11.500.000<br>• Pendapatan = Rp 6.000.000<br>• Total Gaji = **Rp 0** *(tidak boleh bernilai negatif)* | • Potongan = Rp 11.500.000<br>• Pendapatan = Rp 6.000.000<br>• Total Gaji = **Rp 0** | **PASS** |
| **TC-04** | **Branch Testing (Branch Defense Tunjangan Minus)**<br>• Akumulasi tunjangan < 0 (True)<br>• Branch `Math.max(0, tunjangan)` aktif | `tunjanganTambahan`: -Rp 2.000.000<br>*(Mengimbangi tunjangan jabatan Rp 1.000.000 hingga bernilai negatif)* | • Tunjangan = **Rp 0** *(di-clamp ke 0)*<br>• Pendapatan = Rp 5.000.000<br>• Total Gaji = **Rp 5.000.000** | • Tunjangan = **Rp 0**<br>• Pendapatan = Rp 5.000.000<br>• Total Gaji = **Rp 5.000.000** | **PASS** |
| **TC-05** | **Domain Testing (Boundary Nilai Negatif)**<br>• Input tidak valid bernilai negatif<br>• Evaluasi sanitasi `Math.max(0, x)` | `jamLembur`: -5<br>`hariHadir`: -2<br>*(Input kesalahan operator)* | • Jam lembur & hari kehadiran diabaikan (dikonversi ke 0)<br>• Total Gaji = **Rp 6.000.000** | • Nilai negatif terfilter menjadi 0<br>• Total Gaji = **Rp 6.000.000** | **PASS** |
| **TC-06** | **Domain Testing (Presisi Desimal Pecahan)**<br>• Insentif persen pada nilai ganjil<br>• Evaluasi fungsi pembulatan `round2` | `nilaiJasaMedis`: Rp 3.333.333,33<br>*(Perhitungan: 3.333.333,33 * 5% = 166.666,6665)* | • Insentif = Rp 166.666,67<br>• Total Tunjangan = Rp 1.166.666,67<br>• Total Gaji = **Rp 6.166.666,67** | • Insentif = Rp 166.666,67<br>• Total Tunjangan = Rp 1.166.666,67<br>• Total Gaji = **Rp 6.166.666,67** | **PASS** |

---

### **Kesimpulan Pengujian:**
Seluruh skenario pengujian berbasis *White-Box Testing* (*Branch Coverage* dan *Domain Boundary Analysis*) pada fungsi `hitungKomponenGaji` berhasil dieksekusi dengan status **100% PASS**. Fungsi terbukti tangguh dalam menangani nilai ekstrem (boundary), kalkulasi normal, pecahan mata uang, serta proteksi terhadap nilai negatif pada hak tunjangan dan total penerimaan gaji pegawai.
