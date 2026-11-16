import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/shared/providers/auth-provider";

export const metadata: Metadata = {
  title: "Medika - Hospital Workforce System",
  description: "Portal Terpadu Jadwal, Kehadiran, Pengajuan, dan Penggajian Rumah Sakit",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full font-sans bg-[#ECECEC] text-[#202020] flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
