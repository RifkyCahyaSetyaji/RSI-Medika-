import React from "react";
import { cn } from "@/shared/lib/utils";

export type StatusVariant =
  | "disetujui"
  | "menunggu"
  | "diproses"
  | "hadir"
  | "tidakhadir"
  | "terlambat"
  | "izin"
  | "sakit"
  | "cuti"
  | "terbayar";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const norm = status.toLowerCase().replace(/[\s/_-]/g, "");

  let style = "bg-gray-100 text-[#3F3F3F]";

  if (norm.includes("setuju") || norm.includes("hadir") || norm.includes("terbayar") || norm.includes("sukses")) {
    style = "bg-[#D8F0D3] text-[#0E6100]";
  } else if (norm.includes("tunggu") || norm.includes("pending")) {
    style = "bg-[#FEF8D3] text-[#8A7C00]";
  } else if (norm.includes("proses")) {
    style = "bg-[#D9E8FC] text-[#003E9A]";
  } else if (norm.includes("tidak") || norm.includes("tolak") || norm.includes("alpa")) {
    style = "bg-[#FCDFD8] text-[#9A2500]";
  } else if (norm.includes("lambat") || norm.includes("terlambat")) {
    style = "bg-[#FCE8D5] text-[#A34F00]";
  } else if (norm.includes("izin") || norm.includes("sakit") || norm.includes("cuti")) {
    style = "bg-[#E6DEFC] text-[#4731B6]";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center px-4 py-1 rounded-full text-xs font-medium tracking-wide transition-colors",
        style,
        className
      )}
    >
      {status}
    </span>
  );
}
