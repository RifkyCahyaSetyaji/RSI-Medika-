"use client";

import React, { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/shared/components/layout/sidebar";
import { SidebarProvider, useSidebarContext } from "@/shared/components/layout/sidebar-context";
import { useAuth, ROLE_PATHS, PATH_TO_ROLE, UserRole } from "@/shared/providers/auth-provider";
import { ShieldAlert, ArrowLeft, Menu } from "lucide-react";

const ROLE_LABELS: Record<UserRole, string> = {
  TENAGA_MEDIS: "Tenaga Medis",
  HRD: "HRD & Personalia",
  SEKRETARIS: "Sekretaris Unit",
  KEUANGAN: "Manajemen Keuangan",
};

function MobileNavToggle() {
  const { toggleSidebar } = useSidebarContext();
  return (
    <div className="lg:hidden flex items-center justify-between pb-3">
      <button
        type="button"
        onClick={toggleSidebar}
        className="p-2 rounded-xl bg-white border border-black/5 text-[#202020] hover:text-[#4731B6] shadow-xs cursor-pointer inline-flex items-center gap-2 text-xs font-semibold"
        aria-label="Buka menu navigasi"
      >
        <Menu className="w-4 h-4" />
        <span>Menu</span>
      </button>
    </div>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Deteksi modul tujuan berdasarkan segment pertama URL
  const targetSegment = pathname.split("/").filter(Boolean)[0] || "";
  const targetRole = PATH_TO_ROLE[targetSegment];
  const isUnauthorized = Boolean(targetRole && targetRole !== role);

  useEffect(() => {
    // Jika tidak terautentikasi dan tidak loading, arahkan ke login
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Tampilkan loader saat sesi sedang diverifikasi
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#ECECEC] gap-3">
        <div className="w-10 h-10 border-4 border-[#4731B6] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-500 font-medium tracking-wide">Memverifikasi hak akses...</p>
      </div>
    );
  }

  // Jika tidak terautentikasi, jangan render apa pun agar anak komponen tidak trigger API
  if (!isAuthenticated) {
    return null;
  }

  // Jika mencoba mengakses rute milik role lain (Pelanggaran RBAC)
  if (isUnauthorized) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen bg-[#ECECEC] text-[#202020]">
          {/* Sidebar tetap menampilkan menu milik role yang sah */}
          <Sidebar />

          <main className="flex-1 flex flex-col min-w-0 p-3.5 sm:p-5 lg:py-4 lg:pr-6 lg:pl-6 xl:pl-8 overflow-y-auto max-h-screen">
            <MobileNavToggle />
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="bg-white rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-lg border border-black/5 space-y-5 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-[#202020] tracking-tight">
                    Akses Ditolak (403)
                  </h2>
                  <p className="text-sm text-[#7E7E7E] leading-relaxed">
                    Halaman ini khusus untuk peran{" "}
                    <span className="font-semibold text-rose-600">
                      {ROLE_LABELS[targetRole] || targetRole}
                    </span>
                    . Akun Anda saat ini memiliki peran{" "}
                    <span className="font-semibold text-[#4731B6]">
                      {ROLE_LABELS[role] || role}
                    </span>
                    .
                  </p>
                </div>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => router.push(`/${ROLE_PATHS[role]}/dashboard`)}
                    className="inline-flex items-center justify-center gap-2 w-full py-3 px-5 bg-[#4731B6] hover:bg-[#3B2896] text-white rounded-xl font-semibold text-sm transition-colors cursor-pointer shadow-sm"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali ke Beranda Saya
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#ECECEC] text-[#202020]">
        {/* Responsive Sidebar (Drawer on mobile/tablet, Fixed on desktop) */}
        <Sidebar />

        {/* Main Content Area with generous gap from sidebar */}
        <main className="flex-1 flex flex-col min-w-0 p-3.5 sm:p-5 lg:py-6 lg:pr-6 lg:pl-6 xl:pl-8 overflow-y-auto max-h-screen">
          <MobileNavToggle />
          <div className="animate-in fade-in duration-200 pb-12 sm:pb-16">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
