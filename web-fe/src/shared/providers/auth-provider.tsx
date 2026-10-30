"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "TENAGA_MEDIS" | "HRD" | "SEKRETARIS" | "KEUANGAN";

export interface UserProfile {
  nip: string;
  nama: string;
  jabatan: string;
  unit: string;
  email: string;
  role: UserRole;
  initials: string;
}

export const ROLE_PROFILES: Record<UserRole, UserProfile> = {
  TENAGA_MEDIS: {
    nip: "198904122014022001",
    nama: "Ns. Ayu Lestari, S.Kep., Ns.",
    jabatan: "Perawat Pelaksana",
    unit: "Unit Rawat Inap",
    email: "ayu.lestari@medika.hospital",
    role: "TENAGA_MEDIS",
    initials: "AL",
  },
  HRD: {
    nip: "198205152008011003",
    nama: "Athaya Rahmania, S.Psi.",
    jabatan: "Staff HRD & Personalia",
    unit: "Divisi SDM & Kepegawaian",
    email: "hrd.athaya@medika.hospital",
    role: "HRD",
    initials: "AR",
  },
  SEKRETARIS: {
    nip: "199103202015022002",
    nama: "Rizky Ramadhani, A.Md.",
    jabatan: "Sekretaris Unit Rawat Inap",
    unit: "Unit Rawat Inap",
    email: "sekretaris.inap@medika.hospital",
    role: "SEKRETARIS",
    initials: "RR",
  },
  KEUANGAN: {
    nip: "198511102010011005",
    nama: "Bambang Sudiro, S.E., Ak.",
    jabatan: "Manajer Keuangan & Payroll",
    unit: "Divisi Keuangan",
    email: "payroll.bambang@medika.hospital",
    role: "KEUANGAN",
    initials: "BS",
  },
};

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (role?: UserRole) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("TENAGA_MEDIS");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const savedRole = localStorage.getItem("medika_role") as UserRole;
    if (savedRole && ROLE_PROFILES[savedRole]) {
      setRoleState(savedRole);
    }
    const authStatus = localStorage.getItem("medika_auth");
    if (authStatus === "false") {
      setIsAuthenticated(false);
    }
  }, []);

  const switchRole = (newRole: UserRole) => {
    setRoleState(newRole);
    localStorage.setItem("medika_role", newRole);
    setIsAuthenticated(true);
    localStorage.setItem("medika_auth", "true");
  };

  const login = (newRole: UserRole = "TENAGA_MEDIS") => {
    switchRole(newRole);
    router.push("/dashboard");
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.setItem("medika_auth", "false");
    router.push("/login");
  };

  const user = isAuthenticated ? ROLE_PROFILES[role] : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
