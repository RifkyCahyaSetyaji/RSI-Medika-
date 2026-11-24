"use client";

import React, { useState, useEffect } from "react";
import {
  Camera,
  CreditCard,
  KeyRound,
  ChevronRight,
  X,
  CheckCircle2,
  Lock,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/shared/providers/auth-provider";
import { authService } from "@/shared/services/api/auth.service";
import { penggajianService } from "@/shared/services/api/penggajian.service";

export function ProfileView() {
  const { user } = useAuth();
  const [showBankModal, setShowBankModal] = useState<boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState<boolean>(false);
  const [showSuccessToast, setShowSuccessToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Bank state
  const [bankName, setBankName] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [accountHolder, setAccountHolder] = useState<string>("");

  // Password state
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  useEffect(() => {
    async function loadRekening() {
      try {
        const reks = await penggajianService.rekeningSaya();
        if (reks && reks.length > 0) {
          setBankName(reks[0].namaBank);
          setAccountNumber(reks[0].nomorRekening);
          setAccountHolder(reks[0].atasNama);
        }
      } catch {
        // No bank account found
      }
    }
    loadRekening();
  }, []);

  const handleSaveBank = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await penggajianService.tambahRekening({
        namaBank: bankName,
        nomorRekening: accountNumber,
        atasNama: accountHolder,
      });
      setShowBankModal(false);
      setToastMessage("Rekening bank penggajian berhasil diperbarui dan tersimpan di server!");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || "Gagal memperbarui nomor rekening.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMessage("Kata sandi baru dan konfirmasi tidak cocok!");
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await authService.gantiPassword(oldPassword, newPassword);
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setToastMessage("Kata sandi akun Anda berhasil diperbarui di server!");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 4000);
    } catch (err: any) {
      setErrorMessage(err?.message || "Gagal mengubah kata sandi.");
    } finally {
      setIsLoading(false);
    }
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
            {user?.initials || "RM"}
          </div>
          <div className="absolute bottom-0 right-0 p-2 rounded-full bg-[#4731B6] text-white shadow-md hover:scale-110 transition-transform">
            <Camera className="w-4 h-4" />
          </div>
        </div>

        <div className="space-y-0.5">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#202020]">
            {user?.nama || "Pegawai Medika"}
          </h2>
          <p className="text-sm text-[#7E7E7E]">
            {user?.jabatan || user?.role || "Staf RSI Medika"}
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
              <span className="font-medium text-[#202020] text-right">{user?.nama || "-"}</span>
            </div>
            <div className="flex justify-between py-2 text-[#3F3F3F]">
              <span className="text-[#7E7E7E]">NIP</span>
              <span className="font-medium text-[#202020] text-right">{user?.nip || "-"}</span>
            </div>
            <div className="flex justify-between py-2 text-[#3F3F3F]">
              <span className="text-[#7E7E7E]">Jabatan</span>
              <span className="font-medium text-[#202020] text-right">{user?.jabatan || user?.role || "-"}</span>
            </div>
            <div className="flex justify-between py-2 text-[#3F3F3F]">
              <span className="text-[#7E7E7E]">Unit kerja</span>
              <span className="font-medium text-[#202020] text-right">{user?.unit || "RSI Medika"}</span>
            </div>
            <div className="flex justify-between py-2 text-[#3F3F3F]">
              <span className="text-[#7E7E7E]">Status kepegawaian</span>
              <span className="font-medium text-[#0E6100] text-right">{user?.statusPegawai || "Pegawai Tetap"}</span>
            </div>
            <div className="flex justify-between py-2 text-[#3F3F3F]">
              <span className="text-[#7E7E7E]">Email RSI</span>
              <span className="font-medium text-[#202020] text-right truncate max-w-[200px]">
                {user?.email || "-"}
              </span>
            </div>
            <div className="flex justify-between py-2 text-[#3F3F3F]">
              <span className="text-[#7E7E7E]">Tanggal bergabung</span>
              <span className="font-medium text-[#202020] text-right">{user?.tanggalMasuk || "-"}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Keamanan & Rekening */}
        <div className="space-y-6">
          {/* Card 2: Akun & Keamanan */}
          <div className="bg-white rounded-[28px] p-6 sm:p-7 shadow-xs border border-black/5 space-y-4">
            <h3 className="font-bold text-sm text-[#202020]">Akun & Keamanan</h3>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setShowPasswordModal(true);
                }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gray-50 hover:bg-[#F2F1F9] transition-colors text-left group cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white text-[#4731B6] shadow-2xs">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-[#202020]">
                      Ubah kata sandi
                    </h4>
                    <p className="text-[11px] text-[#7E7E7E]">
                      Perbarui kata sandi akun secara berkala
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-[#7E7E7E] group-hover:text-[#4731B6] transition-colors" />
              </button>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white text-[#0E6100] shadow-2xs">
                    <Lock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-semibold text-[#202020]">
                      Autentikasi 2 langkah
                    </h4>
                    <p className="text-[11px] text-[#7E7E7E]">
                      Perlindungan akun aktif via email RSI
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-[#0E6100] bg-[#D8F0D3] px-2.5 py-1 rounded-full">
                  Aktif
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Pembayaran & Rekening Gaji */}
          <div className="bg-white rounded-[28px] p-6 sm:p-7 shadow-xs border border-black/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-[#202020]">Pembayaran & Rekening Gaji</h3>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  setShowBankModal(true);
                }}
                className="text-xs font-semibold text-[#4731B6] hover:underline cursor-pointer"
              >
                Ubah rekening
              </button>
            </div>

            {accountNumber ? (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4731B6] to-[#30217D] text-white space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wide text-white/80">
                    Rekening Utama (Payroll)
                  </span>
                  <CreditCard className="w-5 h-5 text-white/80" />
                </div>
                <div className="pt-2">
                  <p className="text-[11px] text-white/70">Nomor Rekening</p>
                  <p className="text-base sm:text-lg font-mono font-bold tracking-wider">
                    {accountNumber}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs pt-1 border-t border-white/10">
                  <span>{accountHolder || "-"}</span>
                  <span className="font-bold">{bankName || "-"}</span>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200 text-center space-y-2">
                <CreditCard className="w-6 h-6 text-gray-400 mx-auto" />
                <p className="text-xs font-medium text-[#7E7E7E]">Belum ada rekening payroll terdaftar di database.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal Ubah Rekening */}
      {showBankModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 shadow-xl border border-black/5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-[#202020]">
                Ubah Rekening Bank
              </h3>
              <button
                onClick={() => setShowBankModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-[#7E7E7E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSaveBank} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#5F5F5F] block mb-1">
                  Nama Bank
                </label>
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-[#F2F1F9] p-3 rounded-xl border border-[#C4BAF5] font-medium outline-none"
                >
                  <option value="Bank Mandiri">Bank Mandiri</option>
                  <option value="BCA">BCA (Bank Central Asia)</option>
                  <option value="BNI">BNI (Bank Negara Indonesia)</option>
                  <option value="BRI">BRI (Bank Rakyat Indonesia)</option>
                  <option value="BSI">BSI (Bank Syariah Indonesia)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#5F5F5F] block mb-1">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  required
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white p-3 rounded-xl border border-gray-200 font-mono outline-none focus:border-[#4731B6]"
                  placeholder="Contoh: 1400018482103"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#5F5F5F] block mb-1">
                  Atas Nama Pemilik Rekening
                </label>
                <input
                  type="text"
                  required
                  value={accountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white p-3 rounded-xl border border-gray-200 outline-none focus:border-[#4731B6]"
                  placeholder="Nama sesuai buku tabungan"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 font-semibold text-xs text-[#5F5F5F] hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] font-semibold text-xs text-white shadow-xs flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Simpan</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ubah Password */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-[28px] max-w-md w-full p-6 shadow-xl border border-black/5 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-bold text-[#202020]">
                Ubah Kata Sandi Akun
              </h3>
              <button
                onClick={() => setShowPasswordModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 text-[#7E7E7E]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleSavePassword} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#5F5F5F] block mb-1">
                  Kata Sandi Lama
                </label>
                <input
                  type="password"
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white p-3 rounded-xl border border-gray-200 outline-none focus:border-[#4731B6]"
                  placeholder="Masukkan kata sandi lama"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#5F5F5F] block mb-1">
                  Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white p-3 rounded-xl border border-gray-200 outline-none focus:border-[#4731B6]"
                  placeholder="Minimal 8 karakter"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#5F5F5F] block mb-1">
                  Konfirmasi Kata Sandi Baru
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-white p-3 rounded-xl border border-gray-200 outline-none focus:border-[#4731B6]"
                  placeholder="Ulangi kata sandi baru"
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 font-semibold text-xs text-[#5F5F5F] hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl bg-[#4731B6] hover:bg-[#3B289E] font-semibold text-xs text-white shadow-xs flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Perbarui Sandi</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
