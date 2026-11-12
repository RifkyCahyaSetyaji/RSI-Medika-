"use client";

import React, { useState } from "react";
import {
  Camera,
  CreditCard,
  KeyRound,
  ChevronRight,
  X,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { useAuth } from "@/shared/providers/auth-provider";

export default function ProfilPage() {
  const { user } = useAuth();
  const [showBankModal, setShowBankModal] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");

  // Bank state
  const [bankName, setBankName] = useState<string>("Bank Mandiri");
  const [accountNumber, setAccountNumber] = useState<string>("1400018482103");
  const [accountHolder, setAccountHolder] = useState<string>(user?.nama || "Ayu Lestari");

  // Password state
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    setShowBankModal(false);
    setToastMessage("Rekening bank penggajian berhasil diperbarui!");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3500);
  };

  const handleSavePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Kata sandi baru dan konfirmasi tidak cocok!");
      return;
    }
    setShowPasswordModal(false);
    setToastMessage("Kata sandi akun Anda berhasil diperbarui!");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3500);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Toast Alert */}
      {showSuccessToast && (
        <div className="p-4 rounded-2xl bg-[#D8F0D3] border border-[#0E6100]/20 text-[#0E6100] text-sm flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setShowSuccessToast(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Profile Header Avatar */}
      <div className="flex flex-col items-center text-center space-y-3 pt-4">
        <div className="relative group cursor-pointer">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-[#E6DEFC] border-4 border-white shadow-md flex items-center justify-center text-3xl font-extrabold text-[#4731B6]">
            {user?.initials || "AL"}
          </div>
          <div className="absolute bottom-0 right-0 p-2 rounded-full bg-[#4731B6] text-white shadow-md hover:scale-110 transition-transform">
            <Camera className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-0.5">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#202020]">
            {user?.nama || "Ns. Ayu Lestari, S.Kep., Ns."}
          </h2>
          <p className="text-sm text-[#7E7E7E]">
            {user?.jabatan || "Perawat Pelaksana"}
          </p>
        </div>
      </div>

      {/* 2-Columns or Grid of Settings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Card 1: Data Pegawai */}
        <div className="bg-white rounded-[28px] p-6 sm:p-7 shadow-xs border border-black/5 space-y-4">
          <h3 className="font-bold text-sm text-[#202020]">Data pegawai</h3>

          <div className="space-y-3.5 text-xs sm:text-sm divide-y divide-gray-100">
            <div className="flex justify-between py-2 text-[#3F3F3F]">
              <span className="text-[#7E7E7E]">Nama lengkap</span>
              <span className="font-medium text-[#202020] text-right">{user?.nama}</span>
            </div>
            <div className="flex justify-between py-2 text-[#3F3F3F]">
              <span className="text-[#7E7E7E]">NIP</span>
              <span className="font-mono text-[#202020] text-right">{user?.nip}</span>
            </div>
            <div className="flex justify-between py-2 text-[#3F3F3F]">
              <span className="text-[#7E7E7E]">Jabatan</span>
              <span className="font-medium text-[#202020] text-right">{user?.jabatan}</span>
            </div>
            <div className="flex justify-between py-2 text-[#3F3F3F]">
              <span className="text-[#7E7E7E]">Unit</span>
              <span className="font-medium text-[#202020] text-right">{user?.unit}</span>
            </div>
          </div>
        </div>

        {/* Card 2: Rekening Gaji & Card 3: Keamanan */}
        <div className="space-y-6">
          {/* Rekening Gaji */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#202020]">Rekening gaji</h3>

            <div
              onClick={() => setShowBankModal(true)}
              className="bg-white rounded-[24px] p-5 shadow-xs border border-black/5 flex items-center justify-between gap-4 hover:border-[#4731B6] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#EBE9F8] text-[#4731B6] flex items-center justify-center shrink-0">
                  <CreditCard className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#202020] group-hover:text-[#4731B6] transition-colors">
                    {bankName}
                  </h4>
                  <p className="text-xs text-[#7E7E7E] mt-0.5">
                    •••• 4821 · {accountHolder}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#4731B6] transition-colors" />
            </div>
          </div>

          {/* Keamanan */}
          <div className="space-y-3">
            <h3 className="font-bold text-sm text-[#202020]">Keamanan</h3>

            <div
              onClick={() => setShowPasswordModal(true)}
              className="bg-white rounded-[24px] p-5 shadow-xs border border-black/5 flex items-center justify-between gap-4 hover:border-[#4731B6] transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-[#EBE9F8] text-[#4731B6] flex items-center justify-center shrink-0">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-[#202020] group-hover:text-[#4731B6] transition-colors">
                    Ubah kata sandi
                  </h4>
                  <p className="text-xs text-[#7E7E7E] mt-0.5">
                    Terakhir diubah 3 bulan lalu
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-[#4731B6] transition-colors" />
            </div>
          </div>
        </div>
      </div>

      {/* Modal Ubah Rekening (Figma #225:2) */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-lg text-[#202020]">
                Ubah Rekening Bank
              </h3>
              <button
                onClick={() => setShowBankModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBank} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#202020]">Bank Penerima</label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full p-3 rounded-xl border border-gray-300 text-xs text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                >
                  <option value="Bank Mandiri">Bank Mandiri</option>
                  <option value="Bank BCA">Bank Central Asia (BCA)</option>
                  <option value="Bank BNI">Bank Negara Indonesia (BNI)</option>
                  <option value="Bank BRI">Bank Rakyat Indonesia (BRI)</option>
                  <option value="Bank BSI">Bank Syariah Indonesia (BSI)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#202020]">Nomor Rekening</label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#202020]">Nama Pemilik Rekening</label>
                <input
                  type="text"
                  required
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  Simpan Perubahan
                </button>
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-[#3F3F3F] hover:bg-gray-50 text-sm font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ubah Kata Sandi */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-[28px] p-6 sm:p-8 shadow-2xl border border-gray-100 space-y-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="font-bold text-lg text-[#202020]">
                Ubah Kata Sandi
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#202020]">Kata Sandi Saat Ini</label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Masukkan kata sandi lama"
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#202020]">Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimal 8 karakter"
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#202020]">Konfirmasi Kata Sandi Baru</label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full p-2.5 rounded-xl border border-gray-300 text-xs text-[#202020] focus:ring-2 focus:ring-[#4731B6] outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] text-white font-semibold text-sm transition-colors cursor-pointer"
                >
                  Perbarui Sandi
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="px-5 py-3 rounded-xl border border-gray-200 text-[#3F3F3F] hover:bg-gray-50 text-sm font-medium transition-colors cursor-pointer"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
