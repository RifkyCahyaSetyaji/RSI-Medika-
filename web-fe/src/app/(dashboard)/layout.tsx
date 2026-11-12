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

        {/* Main Content Area with generous gap from sidebar */}
        <main className="flex-1 flex flex-col min-w-0 p-3.5 sm:p-5 lg:py-4 lg:pr-6 lg:pl-6 xl:pl-8 overflow-y-auto max-h-screen">
          <div className="space-y-5 pb-12 sm:pb-16">
            <HeaderBreadcrumb />
            <div className="animate-in fade-in duration-200">{children}</div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
