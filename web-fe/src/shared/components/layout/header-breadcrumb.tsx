"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { useAuth, UserRole } from "@/shared/providers/auth-provider";
import { ChevronDown, Sparkles, Menu } from "lucide-react";
import { useSidebarContext } from "./sidebar-context";

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
  const { toggleSidebar } = useSidebarContext();
  const currentTitle = TITLE_MAP[pathname] || "Dashboard";

  return (
    <div className="w-full bg-white rounded-2xl px-3.5 sm:px-6 py-2.5 sm:py-3 shadow-xs border border-black/5 flex items-center justify-between gap-2 sm:gap-4">
      <div className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-medium text-[#5F5F5F] min-w-0">
        {/* Mobile Hamburger Menu Button */}
        <button
          type="button"
          onClick={toggleSidebar}
          className="p-1.5 -ml-1 rounded-xl text-gray-600 hover:text-[#4731B6] hover:bg-gray-100 lg:hidden cursor-pointer shrink-0 transition-colors"
          aria-label="Buka menu navigasi"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="font-semibold text-[#202020] lg:text-[#5F5F5F] truncate">
          {currentTitle}
        </span>
      </div>

      {/* Role Switcher widget for testing */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <span className="text-xs text-[#7E7E7E] items-center gap-1 font-medium hidden md:inline-flex">
          <Sparkles className="w-3.5 h-3.5 text-[#4731B6]" /> Mode Role:
        </span>
        <div className="relative inline-block">
          <select
            value={role}
            onChange={(e) => switchRole(e.target.value as UserRole)}
            className="appearance-none bg-[#F2F1F9] hover:bg-[#EBE9F8] text-[#4731B6] text-[11px] sm:text-xs font-semibold py-1.5 pl-2.5 sm:pl-3 pr-7 sm:pr-8 rounded-lg border border-[#C4BAF5] cursor-pointer transition-colors focus:outline-none"
          >
            <option value="TENAGA_MEDIS">Tenaga Medis</option>
            <option value="HRD">HRD</option>
            <option value="SEKRETARIS">Sekretaris Unit</option>
            <option value="KEUANGAN">Manajemen Keuangan</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#4731B6] absolute right-2 sm:right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}
