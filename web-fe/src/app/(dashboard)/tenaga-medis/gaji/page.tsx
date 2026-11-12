"use client";

import React from "react";
import { SalaryDetailView } from "@/shared/components/gaji/salary-detail-view";

export default function TenagaMedisGajiPage() {
  return (
    <SalaryDetailView
      defaultData={{
        gajiPokok: 5250000,
        tunjanganPeran: 1250000,
        tugasTambahan: 500000,
        insentifShift: 1250000,
        potonganAbsensi: 120000,
        bpjsKesehatan: 300000,
        bpjsKetenagakerjaan: 200000,
        pph21: 750000,
      }}
    />
  );
}
