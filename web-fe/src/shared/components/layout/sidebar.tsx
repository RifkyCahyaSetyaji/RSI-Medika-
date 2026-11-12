"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  Fingerprint,
  Mail,
  Users,
  FileText,
  Clock,
  BookOpen,
  User,
  LogOut,
  CheckSquare,
  X,
} from "lucide-react";
import { useAuth, UserRole, ROLE_PATHS } from "@/shared/providers/auth-provider";
import { LogoutModal } from "@/shared/components/modals/logout-modal";
import { useSidebarContext } from "./sidebar-context";
import { cn } from "@/shared/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

export function Sidebar() {
  const pathname = usePathname();
  const { role, logout } = useAuth();
  const [showLogout, setShowLogout] = useState(false);
  const { isOpen, closeSidebar } = useSidebarContext();

  // Dynamic navigation items based on active role separated with role prefix
  const getNavItems = (currentRole: UserRole): NavItem[] => {
    switch (currentRole) {
      case "HRD":
        return [
          { label: "Beranda", href: "/hrd/dashboard", icon: Home },
          { label: "Kepegawaian", href: "/hrd/kepegawaian", icon: Users },
          { label: "Aju Banding", href: "/hrd/aju-banding", icon: FileText },
          { label: "Absensi", href: "/hrd/absensi", icon: Clock },
          { label: "Pedoman Gaji", href: "/hrd/pedoman-gaji", icon: BookOpen },
          { label: "Gaji", href: "/hrd/gaji", icon: Mail },
        ];
      case "SEKRETARIS":
        return [
          { label: "Beranda", href: "/sekretaris/dashboard", icon: Home },
          { label: "Jadwal", href: "/sekretaris/jadwal", icon: Calendar },
          { label: "Pengajuan Absensi", href: "/sekretaris/absensi", icon: CheckSquare },
          { label: "Gaji", href: "/sekretaris/gaji", icon: Mail },
        ];
      case "KEUANGAN":
        return [
          { label: "Beranda", href: "/keuangan/dashboard", icon: Home },
          { label: "Kelola Gaji", href: "/keuangan/kelola-gaji", icon: Mail },
          { label: "Aju Banding", href: "/keuangan/aju-banding", icon: FileText },
          { label: "Pedoman Gaji", href: "/keuangan/pedoman-gaji", icon: BookOpen },
        ];
      case "TENAGA_MEDIS":
      default:
        return [
          { label: "Beranda", href: "/tenaga-medis/dashboard", icon: Home },
          { label: "Jadwal", href: "/tenaga-medis/jadwal", icon: Calendar },
          { label: "Absensi", href: "/tenaga-medis/absensi", icon: Fingerprint },
          { label: "Gaji", href: "/tenaga-medis/gaji", icon: Mail },
        ];
    }
  };

  const navItems = getNavItems(role);
  const homeHref = `/${ROLE_PATHS[role]}/dashboard`;
  const profilHref = `/${ROLE_PATHS[role]}/profil`;

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      {/* Top: Logo & Nav items */}
      <div className="space-y-6 sm:space-y-8">
        {/* Brand header with mobile close button */}
        <div className="flex items-center justify-between px-2">
          <Link
            href={homeHref}
            onClick={closeSidebar}
            className="flex items-center gap-3 group"
          >
            <div className="relative w-10 h-10 sm:w-11 sm:h-11 shrink-0">
              <Image
                src="/images/medika-logo.png"
                alt="Medika Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg sm:text-xl leading-tight text-[#202020] tracking-tight">
                Medika
              </span>
              <span className="text-[11px] sm:text-xs text-[#5F5F5F] font-normal leading-tight">
                Portal Rumah Sakit
              </span>
            </div>
          </Link>

          {/* Close button on mobile */}
          <button
            type="button"
            onClick={closeSidebar}
            className="p-1.5 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 lg:hidden cursor-pointer"
            aria-label="Tutup menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5 sm:space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeSidebar}
                className={cn(
                  "flex items-center gap-3.5 px-4 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-[#4731B6] text-white shadow-sm"
                    : "text-[#3F3F3F] hover:bg-gray-100 hover:text-[#202020]"
                )}
              >
                <Icon
                  className={cn(
                    "w-5 h-5 shrink-0 transition-colors",
                    isActive ? "text-white" : "text-[#3F3F3F]"
                  )}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom: Profil & Logout buttons */}
      <div className="space-y-2.5 sm:space-y-3 pt-4 sm:pt-6 border-t border-gray-100">
        <Link
          href={profilHref}
          onClick={closeSidebar}
          className={cn(
            "flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium transition-all",
            pathname === profilHref
              ? "bg-[#4731B6] text-white"
              : "border border-gray-200 text-[#3F3F3F] hover:bg-gray-50"
          )}
        >
          <User className="w-4 h-4 shrink-0" />
          <span>Profil</span>
        </Link>

        <button
          type="button"
          onClick={() => {
            closeSidebar();
            setShowLogout(true);
          }}
          className="flex items-center justify-center gap-2.5 w-full py-2.5 px-4 rounded-xl bg-[#9A2500] hover:bg-[#801F00] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Overlay Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Mobile Drawer Sidebar */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] bg-white p-5 shadow-2xl transition-transform duration-300 ease-in-out lg:hidden flex flex-col justify-between overflow-y-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex w-64 min-w-64 bg-white rounded-[28px] p-6 shadow-xs border border-black/5 flex-col justify-between shrink-0 my-4 ml-4 lg:ml-5 h-[calc(100vh-32px)] sticky top-4">
        {sidebarContent}
      </aside>

      <LogoutModal
        isOpen={showLogout}
        onClose={() => setShowLogout(false)}
        onConfirm={logout}
      />
    </>
  );
}
