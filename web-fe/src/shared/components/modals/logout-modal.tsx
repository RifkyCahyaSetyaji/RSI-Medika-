"use client";

import React from "react";
import { LogOut } from "lucide-react";

interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ isOpen, onClose, onConfirm }: LogoutModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white rounded-[24px] p-8 shadow-2xl border border-gray-100 flex flex-col items-center text-center space-y-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-16 h-16 rounded-full bg-[#FDEBE7] text-[#9A2500] flex items-center justify-center shadow-inner">
          <LogOut className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-bold text-[#202020]">Konfirmasi Keluar</h3>
          <p className="text-sm text-[#5F5F5F] max-w-xs leading-relaxed">
            Apakah Anda yakin ingin keluar dari akun ini? Sesi kerja Anda akan diakhiri.
          </p>
        </div>

        <div className="flex w-full items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-5 py-3 rounded-xl border border-gray-300 text-sm font-medium text-[#3F3F3F] hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 px-5 py-3 rounded-xl bg-[#9A2500] hover:bg-[#801F00] text-sm font-semibold text-white shadow-md transition-colors cursor-pointer"
          >
            Ya, Keluar
          </button>
        </div>
      </div>
    </div>
  );
}
