"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth, UserRole } from "@/shared/providers/auth-provider";

export default function LoginPage() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("198904122014022001");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>("TENAGA_MEDIS");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole);
  };

  const handleQuickLogin = (role: UserRole) => {
    login(role);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 bg-[#ECECEC]">
      {/* Outer Card matching Figma Frame 1512x982 proportion */}
      <div className="w-full max-w-6xl h-auto min-h-[720px] bg-white rounded-[32px] shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-black/5">
        {/* Left Side: Hospital Photo + Purple Gradient + Branding */}
        <div className="lg:col-span-7 relative min-h-[380px] lg:min-h-full flex flex-col justify-between p-8 sm:p-12 overflow-hidden">
          {/* Background image */}
          <Image
            src="/images/login-bg.png"
            alt="Hospital Corridor"
            fill
            className="object-cover object-center"
            priority
          />
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#211071]/80 via-[#211071]/40 to-[#120847]/95" />

          {/* Top Logo */}
          <div className="relative z-10 flex items-center gap-3.5">
            <div className="relative w-12 h-12 shrink-0">
              <Image
                src="/images/medika-logo.png"
                alt="Medika Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-white font-bold text-2xl tracking-tight leading-tight">
                Medika
              </h1>
              <p className="text-white/80 text-xs font-normal tracking-wide">
                Hospital Workforce System
              </p>
            </div>
          </div>

          {/* Bottom Slogan */}
          <div className="relative z-10 space-y-3 max-w-md pt-24 lg:pt-0">
            <h2 className="text-white text-3xl sm:text-4xl font-bold leading-tight tracking-tight">
              Satu sistem untuk seluruh tim rumah sakit.
            </h2>
            <p className="text-white/85 text-base font-normal leading-relaxed">
              Kelola jadwal, kehadiran, pengajuan, dan penggajian dengan lebih mudah.
            </p>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="lg:col-span-5 bg-white p-8 sm:p-12 flex flex-col justify-between">
          <div className="space-y-8 my-auto">
            {/* Header text */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-[#5F5F5F] tracking-widest uppercase">
                Selamat Datang Kembali
              </span>
              <h3 className="text-3xl font-bold text-[#202020] tracking-tight">
                Masuk ke akun Anda
              </h3>
              <p className="text-sm text-[#5F5F5F] leading-relaxed">
                Informasi akun dapat dilihat melalui email penerimaan pegawai.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Field NIP / Email */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#202020]">
                  NIP atau email
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-[#7E7E7E] pointer-events-none">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Masukkan NIP atau email"
                    className="w-full bg-white border border-[#D8D8D8] focus:border-[#4731B6] focus:ring-2 focus:ring-[#C4BAF5] rounded-xl py-3 pl-12 pr-4 text-sm text-[#202020] transition-colors outline-none"
                  />
                </div>
              </div>

              {/* Field Kata Sandi */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-[#202020]">
                  Kata sandi
                </label>
                <div className="relative flex items-center">
                  <div className="absolute left-4 text-[#7E7E7E] pointer-events-none">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full bg-white border border-[#D8D8D8] focus:border-[#4731B6] focus:ring-2 focus:ring-[#C4BAF5] rounded-xl py-3 pl-12 pr-12 text-sm text-[#202020] transition-colors outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-[#7E7E7E] hover:text-[#202020] cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs sm:text-sm pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-[#3F3F3F]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#4731B6] focus:ring-[#4731B6] border-gray-300 cursor-pointer"
                  />
                  <span>Ingat saya</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert("Silakan hubungi administrator Medika untuk reset kata sandi.")}
                  className="text-[#4731B6] hover:underline font-medium cursor-pointer"
                >
                  Lupa kata sandi?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3.5 px-6 rounded-xl bg-[#4731B6] hover:bg-[#3A269E] text-white text-base font-semibold shadow-md transition-all cursor-pointer mt-2"
              >
                Masuk
              </button>
            </form>

            {/* Quick Demo Access Bar */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-[#7E7E7E] mb-2.5 text-center">
                Demo Quick Access (Pilih Peran):
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("TENAGA_MEDIS")}
                  className="px-3 py-2 text-xs font-medium rounded-lg border border-[#C4BAF5] bg-[#F2F1F9] text-[#4731B6] hover:bg-[#4731B6] hover:text-white transition-colors cursor-pointer text-center"
                >
                  Tenaga Medis
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("HRD")}
                  className="px-3 py-2 text-xs font-medium rounded-lg border border-[#C4BAF5] bg-[#F2F1F9] text-[#4731B6] hover:bg-[#4731B6] hover:text-white transition-colors cursor-pointer text-center"
                >
                  HRD
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("SEKRETARIS")}
                  className="px-3 py-2 text-xs font-medium rounded-lg border border-[#C4BAF5] bg-[#F2F1F9] text-[#4731B6] hover:bg-[#4731B6] hover:text-white transition-colors cursor-pointer text-center"
                >
                  Sekretaris Unit
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("KEUANGAN")}
                  className="px-3 py-2 text-xs font-medium rounded-lg border border-[#C4BAF5] bg-[#F2F1F9] text-[#4731B6] hover:bg-[#4731B6] hover:text-white transition-colors cursor-pointer text-center"
                >
                  Keuangan
                </button>
              </div>
            </div>
          </div>

          {/* Footer help text */}
          <div className="pt-6 text-center text-xs text-[#7E7E7E]">
            Butuh bantuan? Hubungi administrator Medika Hospital.
          </div>
        </div>
      </div>
    </div>
  );
}
