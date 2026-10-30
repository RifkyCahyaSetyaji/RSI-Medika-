"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth, UserRole } from "@/shared/providers/auth-provider";
import { ChevronDown, Sparkles } from "lucide-react";

const TITLE_MAP: Record<string, string> = {
  "/dashboard": "Beranda",
  "/jadwal": "Jadwal Kerja",
  "/kelola-jadwal": "Kelola Jadwal",
  "/absensi": "Absensi",
  "/rekap-absensi": "Rekap Absensi",
  "/gaji": "Gaji",
  "/kepegawaian": "Kepegawaian",
  "/aju-banding": "Aju Banding",
  "/pedoman-gaji": "Pedoman Gaji",
  "/profil": "Profil",
};

export function HeaderBreadcrumb() {
  const pathname = usePathname();
  const { role, switchRole } = useAuth();
  const currentTitle = TITLE_MAP[pathname] || "Dashboard";

  const roleLabels: Record<UserRole, string> = {
    TENAGA_MEDIS: "Tenaga Medis",
    HRD: "HRD",
    SEKRETARIS: "Sekretaris Unit",
    KEUANGAN: "Manajemen Keuangan",
  };

  return (
    <div className="w-full bg-white rounded-2xl px-6 py-3 shadow-xs border border-black/5 flex items-center justify-between gap-4">
      <div className="flex items-center gap-2 text-sm font-medium text-[#5F5F5F]">
        <span>{currentTitle}</span>
      </div>

      {/* Role Switcher demo widget for quick testing */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-[#7E7E7E] flex items-center gap-1 font-medium hidden sm:inline-flex">
          <Sparkles className="w-3.5 h-3.5 text-[#4731B6]" /> Mode Role:
        </span>
        <div className="relative inline-block">
          <select
            value={role}
            onChange={(e) => switchRole(e.target.value as UserRole)}
            className="appearance-none bg-[#F2F1F9] hover:bg-[#EBE9F8] text-[#4731B6] text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg border border-[#C4BAF5] cursor-pointer transition-colors focus:outline-none"
          >
            <option value="TENAGA_MEDIS">Tenaga Medis</option>
            <option value="HRD">HRD</option>
            <option value="SEKRETARIS">Sekretaris Unit</option>
            <option value="KEUANGAN">Manajemen Keuangan</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#4731B6] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
