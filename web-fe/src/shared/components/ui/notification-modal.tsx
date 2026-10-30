"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, Info, X } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export type NotificationType = "success" | "danger" | "info";

interface NotificationModalProps {
  isOpen: boolean;
  type?: NotificationType;
  title: string;
  message: string;
  onClose: () => void;
}

export function NotificationModal({
  isOpen,
  type = "success",
  title,
  message,
  onClose,
}: NotificationModalProps) {
  if (!isOpen) return null;

  const config = {
    success: {
      icon: CheckCircle2,
      border: "border-l-4 border-l-[#0E6100]",
      iconBg: "bg-[#D8F0D3] text-[#0E6100]",
      btn: "bg-[#0E6100] hover:bg-[#0B4D00]",
    },
    danger: {
      icon: AlertTriangle,
      border: "border-l-4 border-l-[#9A2500]",
      iconBg: "bg-[#FCDFD8] text-[#9A2500]",
      btn: "bg-[#9A2500] hover:bg-[#801F00]",
    },
    info: {
      icon: Info,
      border: "border-l-4 border-l-[#003E9A]",
      iconBg: "bg-[#D9E8FC] text-[#003E9A]",
      btn: "bg-[#003E9A] hover:bg-[#003078]",
    },
  }[type];

  const Icon = config.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/35 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className={cn(
          "w-full max-w-md bg-white rounded-2xl p-6 shadow-xl border border-gray-100 flex flex-col space-y-4 relative",
          config.border
        )}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3.5">
          <div className={cn("p-2.5 rounded-full shrink-0", config.iconBg)}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="space-y-1 pr-6">
            <h4 className="text-base font-bold text-[#202020]">{title}</h4>
            <p className="text-sm text-[#5F5F5F] leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "px-5 py-2 text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer",
              config.btn
            )}
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}
