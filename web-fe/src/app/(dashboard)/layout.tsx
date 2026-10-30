"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/shared/components/layout/sidebar";
import { HeaderBreadcrumb } from "@/shared/components/layout/header-breadcrumb";
import { SidebarProvider } from "@/shared/components/layout/sidebar-context";
import { useAuth } from "@/shared/providers/auth-provider";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, router]);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-[#ECECEC] text-[#202020]">
        {/* Responsive Sidebar (Drawer on mobile/tablet, Fixed on desktop) */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 p-3 sm:p-4 lg:p-3 lg:pl-2 overflow-y-auto max-h-screen">
          <div className="space-y-4 pb-12 sm:pb-16 pr-0 lg:pr-1">
            <HeaderBreadcrumb />
            <div className="animate-in fade-in duration-200">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
