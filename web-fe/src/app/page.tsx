"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, ROLE_PATHS } from "@/shared/providers/auth-provider";

export default function RootPage() {
  const { isAuthenticated, role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(`/${ROLE_PATHS[role]}/dashboard`);
    } else {
      router.replace("/login");
    }
  }, [isAuthenticated, role, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#ECECEC]">
      <div className="w-8 h-8 border-4 border-[#4731B6] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
