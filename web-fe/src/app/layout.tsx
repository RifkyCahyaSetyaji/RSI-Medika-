import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/shared/providers/auth-provider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

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
    <html lang="id" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full font-sans bg-[#ECECEC] text-[#202020] flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
