"use client";

import React from "react";
import { SalaryDetailView } from "@/shared/components/gaji/salary-detail-view";

export default function HRDGajiPage() {
  return (
    <SalaryDetailView
      defaultData={{
        gajiPokok: 6200000,
        tunjanganPeran: 1600000,
        tugasTambahan: 500000,
        insentifShift: 500000,
        potonganAbsensi: 0,
        bpjsKesehatan: 350000,
        bpjsKetenagakerjaan: 250000,
        pph21: 750000,
      }}
    />
  );
}
