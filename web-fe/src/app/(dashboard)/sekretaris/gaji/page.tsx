"use client";

import React from "react";
import { SalaryDetailView } from "@/shared/components/gaji/salary-detail-view";

export default function SekretarisGajiPage() {
  return (
    <SalaryDetailView
      defaultData={{
        gajiPokok: 4500000,
        tunjanganPeran: 1100000,
        tugasTambahan: 500000,
        insentifShift: 500000,
        potonganAbsensi: 0,
        bpjsKesehatan: 250000,
        bpjsKetenagakerjaan: 150000,
        pph21: 550000,
      }}
    />
  );
}
