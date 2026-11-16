/**
 * Generator Slip Gaji PDF Resmi RSI Medika
 * Menghasilkan file PDF berbasis standar ISO PDF-1.4 tanpa dependensi eksternal berat.
 */

export interface PayslipPdfData {
  periode: string;
  cutoff?: string;
  status: string;
  pegawai: string;
  nip: string;
  jabatan: string;
  unit: string;
  tanggalBayar: string;
  rekening: string;
  gajiPokok: number;
  tunjanganPeran: number;
  tugasTambahan: number;
  insentifShift: number;
  bpjsKesehatan: number;
  bpjsKetenagakerjaan: number;
  pph21: number;
  potonganAbsensi: number;
  totalPendapatan: number;
  totalPotongan: number;
  takeHomePay: number;
}

const formatRupiah = (val: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val);
};

// Escape text untuk format literal PDF string `( ... )`
const esc = (text: string | number | undefined | null): string => {
  if (text == null) return "";
  return String(text)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
};

export function createPayslipPdfBinary(data: PayslipPdfData): string {
  const stream: string[] = [];
  const add = (cmd: string) => stream.push(cmd);

  // Line width
  add("0.8 w");

  // Kop Header RSI Medika (Background ungu khas Medika #4731B6 -> 0.278, 0.192, 0.714)
  add("0.278 0.192 0.714 rg");
  add("35 745 525 65 re f");

  // Teks Header Kop (Putih)
  add("1 1 1 rg");
  add("BT /F1 16 Tf 50 785 Td (RUMAH SAKIT ISLAM MEDIKA) Tj ET");
  add("BT /F2 10 Tf 50 770 Td (Hospital Workforce & Payroll Management System) Tj ET");
  add("BT /F2 8.5 Tf 50 755 Td (Jl. Medika Sehat No. 12, Jakarta | Layanan SDM: sdm@rsi-medika.co.id) Tj ET");

  // Judul Dokumen
  add("0.125 0.125 0.125 rg");
  add("BT /F1 14 Tf 50 715 Td (SLIP GAJI KARYAWAN) Tj ET");
  add("0.4 0.4 0.4 rg");
  add(
    `BT /F2 10 Tf 50 700 Td (Periode: ${esc(data.periode)} | Status Pembayaran: ${esc(data.status)}) Tj ET`
  );

  // Garis Pembatas
  add("0.8 0.8 0.8 RG");
  add("35 685 m 560 685 l S");

  // Box Informasi Karyawan (Abu-abu muda halus)
  add("0.96 0.96 0.98 rg");
  add("35 605 525 70 re f");

  add("0.15 0.15 0.15 rg");
  add("BT /F1 9.5 Tf 45 658 Td (Nama Pegawai :) Tj ET");
  add(`BT /F2 9.5 Tf 135 658 Td (${esc(data.pegawai)}) Tj ET`);

  add("BT /F1 9.5 Tf 330 658 Td (NIP :) Tj ET");
  add(`BT /F2 9.5 Tf 380 658 Td (${esc(data.nip)}) Tj ET`);

  add("BT /F1 9.5 Tf 45 640 Td (Jabatan :) Tj ET");
  add(`BT /F2 9.5 Tf 135 640 Td (${esc(data.jabatan)}) Tj ET`);

  add("BT /F1 9.5 Tf 330 640 Td (Unit Kerja :) Tj ET");
  add(`BT /F2 9.5 Tf 395 640 Td (${esc(data.unit)}) Tj ET`);

  add("BT /F1 9.5 Tf 45 622 Td (Tgl Transfer :) Tj ET");
  add(`BT /F2 9.5 Tf 135 622 Td (${esc(data.tanggalBayar)}) Tj ET`);

  add("BT /F1 9.5 Tf 330 622 Td (Rekening :) Tj ET");
  add(`BT /F2 9.5 Tf 395 622 Td (${esc(data.rekening)}) Tj ET`);

  // Section Header: Pendapatan (Kiri - Hijau) vs Potongan (Kanan - Merah)
  add("0.05 0.38 0.0 rg");
  add("35 575 255 22 re f");
  add("1 1 1 rg");
  add("BT /F1 9.5 Tf 45 582 Td (KOMPONEN PENDAPATAN (+)) Tj ET");

  add("0.6 0.15 0.0 rg");
  add("305 575 255 22 re f");
  add("1 1 1 rg");
  add("BT /F1 9.5 Tf 315 582 Td (KOMPONEN POTONGAN (-)) Tj ET");

  // Baris Komponen Gaji
  const drawRow = (
    y: number,
    lLabel: string,
    lVal: string,
    rLabel?: string,
    rVal?: string
  ) => {
    add("0.2 0.2 0.2 rg");
    add(`BT /F2 9 Tf 45 ${y} Td (${esc(lLabel)}) Tj ET`);
    add(`BT /F1 9 Tf 210 ${y} Td (${esc(lVal)}) Tj ET`);

    if (rLabel) {
      add(`BT /F2 9 Tf 315 ${y} Td (${esc(rLabel)}) Tj ET`);
      add(`BT /F1 9 Tf 480 ${y} Td (${esc(rVal)}) Tj ET`);
    }

    add("0.9 0.9 0.9 RG");
    add(`35 ${y - 5} m 290 ${y - 5} l S`);
    add(`305 ${y - 5} m 560 ${y - 5} l S`);
  };

  drawRow(555, "Gaji Pokok", formatRupiah(data.gajiPokok), "BPJS Kesehatan (4%)", formatRupiah(data.bpjsKesehatan));
  drawRow(535, "Tunjangan Peran", formatRupiah(data.tunjanganPeran), "BPJS Ketenagakerjaan", formatRupiah(data.bpjsKetenagakerjaan));
  drawRow(515, "Tugas Tambahan/Lembur", formatRupiah(data.tugasTambahan), "Pajak Penghasilan (PPh21)", formatRupiah(data.pph21));
  drawRow(495, "Insentif Shift & Pelayanan", formatRupiah(data.insentifShift), "Potongan Keterlambatan", formatRupiah(data.potonganAbsensi));

  // Subtotal Pendapatan & Potongan
  add("0.9 0.96 0.9 rg");
  add("35 465 255 22 re f");
  add("0.05 0.4 0.0 rg");
  add("BT /F1 9.5 Tf 45 472 Td (Total Pendapatan :) Tj ET");
  add(`BT /F1 9.5 Tf 200 472 Td (${esc(formatRupiah(data.totalPendapatan))}) Tj ET`);

  add("0.98 0.92 0.92 rg");
  add("305 465 255 22 re f");
  add("0.6 0.15 0.0 rg");
  add("BT /F1 9.5 Tf 315 472 Td (Total Potongan :) Tj ET");
  add(`BT /F1 9.5 Tf 470 472 Td (- ${esc(formatRupiah(data.totalPotongan))}) Tj ET`);

  // Grand Total Take Home Pay Card (Warna Khas Ungu Medika)
  add("0.278 0.192 0.714 rg");
  add("35 395 525 50 re f");

  add("1 1 1 rg");
  add("BT /F2 10.5 Tf 50 426 Td (TOTAL GAJI BERSIH (TAKE HOME PAY) :) Tj ET");
  add(`BT /F1 16 Tf 50 405 Td (${esc(formatRupiah(data.takeHomePay))}) Tj ET`);
  add("BT /F2 9 Tf 360 415 Td (Status: LUNAS DITRANSFER) Tj ET");

  // Catatan & Tanda Tangan
  add("0.4 0.4 0.4 rg");
  add("BT /F2 8.5 Tf 50 350 Td (Catatan: Slip gaji ini diterbitkan secara elektronik dan sah tanpa tanda tangan basah.) Tj ET");
  add(`BT /F2 8.5 Tf 50 336 Td (Dicetak melalui Sistem RSI Medika pada ${new Date().toLocaleDateString("id-ID", { dateStyle: "long" })}) Tj ET`);

  // Tanda Tangan
  add("0.2 0.2 0.2 rg");
  add("BT /F2 9 Tf 70 280 Td (Pegawai Penerima,) Tj ET");
  add(`BT /F1 9 Tf 70 220 Td (${esc(data.pegawai)}) Tj ET`);

  add("BT /F2 9 Tf 380 280 Td (Manajer Keuangan & Payroll,) Tj ET");
  add("BT /F1 9 Tf 380 220 Td (Bambang Sudiro, S.E., Ak.) Tj ET");

  const content = stream.join("\n");
  const objects: string[] = [];
  const addObject = (str: string) => {
    objects.push(str);
    return objects.length;
  };

  addObject("<< /Type /Catalog /Pages 2 0 R >>");
  addObject("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  addObject(
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>"
  );
  addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);

  let pdf = "%PDF-1.4\n";
  const xref: number[] = [0];
  let offset = pdf.length;

  for (let i = 0; i < objects.length; i++) {
    xref.push(offset);
    const objStr = `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
    pdf += objStr;
    offset += objStr.length;
  }

  const xrefOffset = offset;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(xref[i]).padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF\n`;

  return pdf;
}

/**
 * Memicu pengunduhan file .pdf langsung di browser
 */
export function downloadPayslipPdf(data: PayslipPdfData) {
  try {
    const pdfData = createPayslipPdfBinary(data);
    const blob = new Blob([pdfData], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const sanitizedName = data.pegawai.replace(/[^a-zA-Z0-9]/g, "_");
    const sanitizedPeriode = data.periode.replace(/[^a-zA-Z0-9]/g, "_");

    a.href = url;
    a.download = `Slip_Gaji_${sanitizedPeriode}_${sanitizedName}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Gagal mengunduh slip PDF:", err);
    // Fallback cetak dokumen via window
    printPayslipDocument(data);
  }
}

/**
 * Membuka jendela cetak HTML resmi siap cetak / simpan sebagai PDF dari browser
 */
export function printPayslipDocument(data: PayslipPdfData) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const html = `
    <!DOCTYPE html>
    <html lang="id">
    <head>
      <meta charset="utf-8">
      <title>Slip Gaji - ${data.periode} - ${data.pegawai}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          color: #202020;
          margin: 0;
          padding: 30px;
          background: #fff;
        }
        .slip-container {
          max-width: 720px;
          margin: 0 auto;
          border: 1px solid #ddd;
          padding: 30px;
          border-radius: 12px;
        }
        .header {
          background: #4731B6;
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 24px;
        }
        .header h1 { margin: 0 0 4px 0; font-size: 20px; }
        .header p { margin: 0; font-size: 12px; opacity: 0.9; }
        .title {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        .subtitle {
          font-size: 12px;
          color: #666;
          margin-bottom: 16px;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          background: #F9F9FB;
          padding: 16px;
          border-radius: 8px;
          font-size: 12px;
          margin-bottom: 24px;
        }
        .info-row { display: flex; justify-content: space-between; }
        .info-label { color: #666; }
        .info-val { font-weight: bold; }
        .tables-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 24px;
        }
        .table-box {
          border: 1px solid #eee;
          border-radius: 8px;
          overflow: hidden;
        }
        .table-head-g { background: #E8F5E9; color: #0E6100; font-weight: bold; padding: 10px 14px; font-size: 12px; }
        .table-head-r { background: #FFEBEE; color: #C62828; font-weight: bold; padding: 10px 14px; font-size: 12px; }
        .table-body { padding: 10px 14px; font-size: 12px; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
        .row:last-child { border-bottom: none; }
        .subtotal-g { background: #C8E6C9; color: #0E6100; font-weight: bold; padding: 10px 14px; display: flex; justify-content: space-between; font-size: 12px; }
        .subtotal-r { background: #FFCDD2; color: #C62828; font-weight: bold; padding: 10px 14px; display: flex; justify-content: space-between; font-size: 12px; }
        .take-home-pay {
          background: #4731B6;
          color: white;
          padding: 18px 24px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 28px;
        }
        .thp-title { font-size: 12px; opacity: 0.9; }
        .thp-val { font-size: 22px; font-weight: bold; margin-top: 4px; }
        .signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 40px;
          font-size: 12px;
          text-align: center;
        }
        .sig-box { width: 200px; }
        .sig-space { height: 60px; }
        @media print {
          body { padding: 0; }
          .slip-container { border: none; padding: 0; }
        }
      </style>
    </head>
    <body>
      <div class="slip-container">
        <div class="header">
          <h1>RUMAH SAKIT ISLAM MEDIKA</h1>
          <p>Hospital Workforce & Payroll Management System</p>
        </div>

        <div class="title">SLIP GAJI KARYAWAN</div>
        <div class="subtitle">Periode Pembayaran: ${data.periode} · Status: ${data.status}</div>

        <div class="info-grid">
          <div class="info-row"><span class="info-label">Nama Pegawai</span><span class="info-val">${data.pegawai}</span></div>
          <div class="info-row"><span class="info-label">NIP</span><span class="info-val">${data.nip}</span></div>
          <div class="info-row"><span class="info-label">Jabatan</span><span class="info-val">${data.jabatan}</span></div>
          <div class="info-row"><span class="info-label">Unit Kerja</span><span class="info-val">${data.unit}</span></div>
          <div class="info-row"><span class="info-label">Tanggal Cair</span><span class="info-val">${data.tanggalBayar}</span></div>
          <div class="info-row"><span class="info-label">Rekening</span><span class="info-val">${data.rekening}</span></div>
        </div>

        <div class="tables-grid">
          <div class="table-box">
            <div class="table-head-g">PENDAPATAN (+)</div>
            <div class="table-body">
              <div class="row"><span>Gaji Pokok</span><span>${formatRupiah(data.gajiPokok)}</span></div>
              <div class="row"><span>Tunjangan Peran</span><span>${formatRupiah(data.tunjanganPeran)}</span></div>
              <div class="row"><span>Tugas Tambahan/Lembur</span><span>${formatRupiah(data.tugasTambahan)}</span></div>
              <div class="row"><span>Insentif Shift</span><span>${formatRupiah(data.insentifShift)}</span></div>
            </div>
            <div class="subtotal-g">
              <span>Total Pendapatan</span><span>${formatRupiah(data.totalPendapatan)}</span>
            </div>
          </div>

          <div class="table-box">
            <div class="table-head-r">POTONGAN (-)</div>
            <div class="table-body">
              <div class="row"><span>BPJS Kesehatan (4%)</span><span>${formatRupiah(data.bpjsKesehatan)}</span></div>
              <div class="row"><span>BPJS Ketenagakerjaan</span><span>${formatRupiah(data.bpjsKetenagakerjaan)}</span></div>
              <div class="row"><span>Pajak PPh 21</span><span>${formatRupiah(data.pph21)}</span></div>
              <div class="row"><span>Potongan Absensi</span><span>${formatRupiah(data.potonganAbsensi)}</span></div>
            </div>
            <div class="subtotal-r">
              <span>Total Potongan</span><span>- ${formatRupiah(data.totalPotongan)}</span>
            </div>
          </div>
        </div>

        <div class="take-home-pay">
          <div>
            <div class="thp-title">GAJI BERSIH (TAKE HOME PAY)</div>
            <div class="thp-val">${formatRupiah(data.takeHomePay)}</div>
          </div>
          <div style="font-size: 11px; text-align: right; opacity: 0.9;">
            Lunas Ditransfer<br>${data.rekening}
          </div>
        </div>

        <div style="font-size: 10px; color: #888; margin-top: 10px;">
          Dokumen ini dicetak otomatis secara elektronik dan sah sesuai regulasi internal RSI Medika.
        </div>

        <div class="signatures">
          <div class="sig-box">
            <div>Pegawai Penerima,</div>
            <div class="sig-space"></div>
            <strong>${data.pegawai}</strong>
          </div>
          <div class="sig-box">
            <div>Manajer Payroll & Keuangan,</div>
            <div class="sig-space"></div>
            <strong>Bambang Sudiro, S.E., Ak.</strong>
          </div>
        </div>
      </div>
      <script>
        window.onload = function() { window.print(); };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
