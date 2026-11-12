"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Eye, EyeOff } from "lucide-react";
import { useAuth, UserRole, ROLE_PROFILES } from "@/shared/providers/auth-provider";

/* Figma Node #206:22121 SVG Icon */
function MedikaLogoIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M2.41666 11.4792C2.41669 10.1346 2.82459 8.82155 3.58649 7.71361C4.34839 6.60567 5.42845 5.7549 6.68402 5.27367C7.93959 4.79244 9.3116 4.70339 10.6188 5.01828C11.9261 5.33317 13.1071 6.03719 14.0058 7.03735C14.0691 7.10503 14.1456 7.15899 14.2306 7.19588C14.3156 7.23277 14.4073 7.25181 14.5 7.25181C14.5927 7.25181 14.6843 7.23277 14.7694 7.19588C14.8544 7.15899 14.9309 7.10503 14.9942 7.03735C15.8901 6.03069 17.0713 5.32075 18.3807 5.00204C19.6901 4.68332 21.0655 4.77094 22.3238 5.25323C23.5821 5.73552 24.6637 6.5896 25.4247 7.70181C26.1856 8.81402 26.5897 10.1316 26.5833 11.4792C26.5833 14.2463 24.7708 16.3125 22.9583 18.125L16.3222 24.5449C16.097 24.8035 15.8194 25.0112 15.5078 25.1543C15.1962 25.2973 14.8577 25.3724 14.5148 25.3746C14.172 25.3768 13.8326 25.3059 13.5192 25.1668C13.2058 25.0278 12.9256 24.8236 12.6972 24.5678L6.04166 18.125C4.22916 16.3125 2.41666 14.2583 2.41666 11.4792Z"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#4731B6"
      />
      <path
        d="M3.89111 15.7083H11.4794L12.0836 14.5L14.5003 19.9375L16.9169 11.4791L18.7294 15.7083H25.0974"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="#4731B6"
      />
    </svg>
  );
}

/* Figma Node #206:22084 SVG Mail Icon */
function FigmaEmailIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M27.5001 8.74985L16.2614 15.9086C15.88 16.1301 15.4468 16.2468 15.0058 16.2468C14.5647 16.2468 14.1315 16.1301 13.7502 15.9086L2.50017 8.74985"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
      <path
        d="M5.00017 5.00022H25.0001C26.3809 5.00022 27.5001 6.1195 27.5001 7.50021V22.5002C27.5001 23.8809 26.3809 25.0002 25.0001 25.0002H5.00017C3.61946 25.0002 2.50017 23.8809 2.50017 22.5002V7.50021C2.50017 6.1195 3.61946 5.00022 5.00017 5.00022Z"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </svg>
  );
}

/* Figma Node #206:22093 SVG Lock Icon */
function FigmaLockIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M16.2514 20.0005C16.2514 20.6912 15.6915 21.2511 15.0009 21.2511C14.3102 21.2511 13.7503 20.6912 13.7503 20.0005C13.7503 19.3099 14.3102 18.75 15.0009 18.75C15.6915 18.75 16.2514 19.3099 16.2514 20.0005Z"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
      <path
        d="M6.24988 12.5H23.7499C25.1306 12.5 26.2499 13.6193 26.2499 15V25C26.2499 26.3807 25.1306 27.5 23.7499 27.5H6.24988C4.86917 27.5 3.74988 26.3807 3.74988 25V15C3.74988 13.6193 4.86917 12.5 6.24988 12.5Z"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
      <path
        d="M8.75035 12.4999V8.74986C8.75035 7.09225 9.40883 5.50254 10.5809 4.33044C11.753 3.15834 13.3427 2.49986 15.0003 2.49986C16.6579 2.49986 18.2477 3.15834 19.4198 4.33044C20.5919 5.50254 21.2503 7.09225 21.2503 8.74986V12.4999"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        stroke="currentColor"
      />
    </svg>
  );
}

export default function LoginPage() {
  const { login } = useAuth();
  const [identifier, setIdentifier] = useState("198904122014022001");
  const [password, setPassword] = useState("••••••••••••");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [selectedRole, setSelectedRole] = useState<UserRole>("TENAGA_MEDIS");

  const detectRoleFromIdentifier = (val: string): UserRole => {
    const lower = val.toLowerCase().trim();
    if (lower.includes("hrd") || lower.includes("198205152008011003") || lower.includes("athaya")) return "HRD";
    if (lower.includes("sekretaris") || lower.includes("199103202015022002") || lower.includes("rizky")) return "SEKRETARIS";
    if (lower.includes("keuangan") || lower.includes("payroll") || lower.includes("198511102010011005") || lower.includes("bambang")) return "KEUANGAN";
    return selectedRole || "TENAGA_MEDIS";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const roleToLogin = detectRoleFromIdentifier(identifier);
    login(roleToLogin);
  };

  const handleQuickLogin = (role: UserRole) => {
    setSelectedRole(role);
    setIdentifier(ROLE_PROFILES[role]?.nip || "");
    login(role);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 bg-[#ECECEC]">
      {/* Outer Card matching Figma Frame 1512x982 proportion (#206:21723) */}
      <div className="w-full max-w-[1280px] min-h-[768px] bg-white rounded-[32px] shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-black/5">
        
        {/* Left Side: Hospital Image + Figma Purple Gradient Overlay + Branding */}
        <div className="lg:col-span-7 relative min-h-[440px] lg:min-h-full flex flex-col justify-between p-8 lg:p-12 overflow-hidden">
          {/* Background image */}
          <Image
            src="/images/login-bg.png"
            alt="Hospital Corridor"
            fill
            className="object-cover object-center"
            priority
          />
          
          {/* Figma Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#211071]/85 via-[#211071]/50 to-[#120847]/95" />

          {/* Top Logo Container (#206:22119) */}
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#FFFAFA] flex items-center justify-center shadow-md shrink-0">
              <MedikaLogoIcon className="w-7 h-7" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-white font-bold text-2xl lg:text-[28px] tracking-tight leading-none">
                Medika
              </h1>
              <p className="text-[#FFFAFA]/85 text-xs lg:text-sm font-normal tracking-wide">
                Hospital Workforce System
              </p>
            </div>
          </div>

          {/* Bottom Slogan Container (#206:22129) */}
          <div className="relative z-10 flex flex-col gap-3 max-w-lg pt-16 lg:pt-0">
            <h2 className="text-white text-2xl sm:text-3xl lg:text-4xl font-semibold leading-tight tracking-tight">
              Satu sistem untuk seluruh tim rumah sakit.
            </h2>
            <p className="text-[#F2F1F9]/90 text-sm sm:text-base font-normal leading-relaxed">
              Kelola jadwal, kehadiran, pengajuan, dan penggajian dengan lebih mudah.
            </p>
          </div>
        </div>

        {/* Right Side: Login Form (#206:22029) */}
        <div className="lg:col-span-5 bg-white p-8 sm:p-10 lg:p-12 flex flex-col justify-between gap-8">
          <div className="my-auto flex flex-col gap-8">
            
            {/* Header Text (#206:22037) */}
            <div className="flex flex-col gap-2">
              <span className="text-xs sm:text-sm font-semibold text-[#5F5F5F] tracking-[0.05em] uppercase">
                Selamat Datang Kembali
              </span>
              <h3 className="text-2xl sm:text-3xl lg:text-[32px] font-bold text-[#202020] tracking-tight leading-tight">
                Masuk ke akun Anda
              </h3>
              <p className="text-xs sm:text-sm text-[#5F5F5F] leading-relaxed">
                Informasi akun dapat dilihat melalui email penerimaan pegawai.
              </p>
            </div>

            {/* Login Form (#206:22044) */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              
              {/* Field 1: NIP atau email (#206:22080) */}
              <div className="flex flex-col gap-2">
                <label className="text-sm sm:text-base font-medium text-[#202020]">
                  NIP atau email
                </label>
                <div className="relative flex items-center h-14 px-4 bg-white border-[1.5px] border-[#C5C5C5] rounded-xl transition-all duration-200 focus-within:border-[#5A3FE1] focus-within:ring-4 focus-within:ring-[#5A3FE1]/15 gap-3">
                  <div className="text-[#7E7E7E] shrink-0 pointer-events-none">
                    <FigmaEmailIcon className="w-6 h-6" />
                  </div>
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Masukkan NIP atau email"
                    className="w-full h-full bg-transparent text-sm sm:text-base text-[#202020] placeholder:text-[#9E9E9E] outline-none"
                  />
                </div>
              </div>

              {/* Field 2: Kata sandi (#206:22089) */}
              <div className="flex flex-col gap-2">
                <label className="text-sm sm:text-base font-medium text-[#202020]">
                  Kata sandi
                </label>
                <div className="relative flex items-center h-14 px-4 bg-white border-[1.5px] border-[#C5C5C5] rounded-xl transition-all duration-200 focus-within:border-[#5A3FE1] focus-within:ring-4 focus-within:ring-[#5A3FE1]/15 gap-3">
                  <div className="text-[#7E7E7E] shrink-0 pointer-events-none">
                    <FigmaLockIcon className="w-6 h-6" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full h-full bg-transparent text-sm sm:text-base text-[#202020] placeholder:text-[#9E9E9E] outline-none pr-8"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 text-[#7E7E7E] hover:text-[#202020] transition-colors p-1 cursor-pointer"
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row (#206:22104) */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs sm:text-sm text-[#5F5F5F]">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-5 h-5 rounded-[4px] border-[1.5px] border-[#767676] text-[#5A3FE1] focus:ring-[#5A3FE1] cursor-pointer accent-[#5A3FE1]"
                  />
                  <span>Ingat saya</span>
                </label>
                <button
                  type="button"
                  onClick={() => alert("Silakan hubungi administrator Medika untuk reset kata sandi.")}
                  className="text-xs sm:text-sm font-medium text-[#5A3FE1] hover:text-[#4731B6] hover:underline cursor-pointer transition-colors"
                >
                  Lupa kata sandi?
                </button>
              </div>

              {/* Submit Button (#206:22114) */}
              <button
                type="submit"
                className="w-full h-14 rounded-xl bg-[#5A3FE1] hover:bg-[#4731B6] active:scale-[0.99] text-white text-base sm:text-lg font-medium shadow-md shadow-[#5A3FE1]/20 transition-all cursor-pointer flex items-center justify-center mt-2"
              >
                Masuk
              </button>
            </form>

            {/* Quick Demo Access Bar */}
            <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
              <p className="text-xs font-semibold text-[#7E7E7E] text-center">
                Demo Quick Access (Pilih Peran):
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin("TENAGA_MEDIS")}
                  className="h-10 px-3 text-xs font-medium rounded-xl border border-[#C4BAF5] bg-[#F2F1F9] text-[#4731B6] hover:bg-[#4731B6] hover:text-white transition-all cursor-pointer flex items-center justify-center"
                >
                  Tenaga Medis
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("HRD")}
                  className="h-10 px-3 text-xs font-medium rounded-xl border border-[#C4BAF5] bg-[#F2F1F9] text-[#4731B6] hover:bg-[#4731B6] hover:text-white transition-all cursor-pointer flex items-center justify-center"
                >
                  HRD
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("SEKRETARIS")}
                  className="h-10 px-3 text-xs font-medium rounded-xl border border-[#C4BAF5] bg-[#F2F1F9] text-[#4731B6] hover:bg-[#4731B6] hover:text-white transition-all cursor-pointer flex items-center justify-center"
                >
                  Sekretaris Unit
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickLogin("KEUANGAN")}
                  className="h-10 px-3 text-xs font-medium rounded-xl border border-[#C4BAF5] bg-[#F2F1F9] text-[#4731B6] hover:bg-[#4731B6] hover:text-white transition-all cursor-pointer flex items-center justify-center"
                >
                  Keuangan
                </button>
              </div>
            </div>
          </div>

          {/* Footer help text (#206:22116) */}
          <div className="pt-4 text-center text-xs text-[#7E7E7E]">
            Butuh bantuan? Hubungi administrator Medika Hospital.
          </div>
        </div>
      </div>
    </div>
  );
}
