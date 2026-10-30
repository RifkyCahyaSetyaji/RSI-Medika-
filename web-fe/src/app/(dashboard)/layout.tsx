"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/shared/components/layout/sidebar";
import { HeaderBreadcrumb } from "@/shared/components/layout/header-breadcrumb";
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
    <div className="flex min-h-screen bg-[#ECECEC] text-[#202020]">
      {/* Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 p-3 pl-2 overflow-y-auto max-h-screen">
        <div className="space-y-4 pb-12 pr-1">
          <HeaderBreadcrumb />
          <div className="animate-in fade-in duration-200">{children}</div>
        </div>
      </main>
    </div>
  );
}
