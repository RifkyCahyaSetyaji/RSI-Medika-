"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/shared/services/api/auth.service";
import { getAuthToken, setAuthToken } from "@/shared/services/api/api-client";
import { UserMe } from "@/shared/types/api";

export type UserRole = "TENAGA_MEDIS" | "HRD" | "SEKRETARIS" | "KEUANGAN";

export const ROLE_PATHS: Record<UserRole, string> = {
  TENAGA_MEDIS: "tenaga-medis",
  HRD: "hrd",
  SEKRETARIS: "sekretaris",
  KEUANGAN: "keuangan",
};

export const PATH_TO_ROLE: Record<string, UserRole> = {
  "tenaga-medis": "TENAGA_MEDIS",
  "hrd": "HRD",
  "sekretaris": "SEKRETARIS",
  "keuangan": "KEUANGAN",
};

export const ROLE_BACKEND_MAP: Record<string, UserRole> = {
  "Tenaga Medis": "TENAGA_MEDIS",
  "HRD": "HRD",
  "Sekretaris Unit": "SEKRETARIS",
  "Manajemen Keuangan": "KEUANGAN",
  "Super Admin": "HRD",
};

export const DEFAULT_CREDENTIALS: Record<UserRole, { identifier: string; password: string }> = {
  TENAGA_MEDIS: { identifier: "ayulestari", password: "password123" },
  HRD: { identifier: "athaya", password: "password123" },
  SEKRETARIS: { identifier: "rizky", password: "password123" },
  KEUANGAN: { identifier: "bambang", password: "password123" },
};

export interface UserProfile {
  idPegawai?: string;
  idAkun?: string;
  nip: string;
  nama: string;
  jabatan: string;
  unit: string;
  email: string;
  role: UserRole;
  initials: string;
  sisaJatahCuti?: number;
}

export const ROLE_PROFILES: Record<UserRole, UserProfile> = {
  TENAGA_MEDIS: {
    idPegawai: "PGW0000001",
    idAkun: "AKN0000001",
    nip: "198904122014022001",
    nama: "Ns. Ayu Lestari, S.Kep., Ns.",
    jabatan: "Perawat Pelaksana",
    unit: "Unit Rawat Inap",
    email: "ayu.lestari@medika.hospital",
    role: "TENAGA_MEDIS",
    initials: "AL",
    sisaJatahCuti: 12,
  },
  HRD: {
    idPegawai: "PGW0000003",
    idAkun: "AKN0000002",
    nip: "198205152008011003",
    nama: "Athaya Rahmania, S.Psi.",
    jabatan: "Staff HRD & Personalia",
    unit: "Divisi SDM & Kepegawaian",
    email: "hrd.athaya@medika.hospital",
    role: "HRD",
    initials: "AR",
    sisaJatahCuti: 12,
  },
  SEKRETARIS: {
    idPegawai: "PGW0000004",
    idAkun: "AKN0000003",
    nip: "199103202015022002",
    nama: "Rizky Ramadhani, A.Md.",
    jabatan: "Sekretaris Unit Rawat Inap",
    unit: "Unit Rawat Inap",
    email: "sekretaris.inap@medika.hospital",
    role: "SEKRETARIS",
    initials: "RR",
    sisaJatahCuti: 10,
  },
  KEUANGAN: {
    idPegawai: "PGW0000005",
    idAkun: "AKN0000004",
    nip: "198511102010011005",
    nama: "Bambang Sudiro, S.E., Ak.",
    jabatan: "Manajer Keuangan & Payroll",
    unit: "Divisi Keuangan",
    email: "payroll.bambang@medika.hospital",
    role: "KEUANGAN",
    initials: "BS",
    sisaJatahCuti: 12,
  },
};

function getInitials(name: string): string {
  if (!name) return "RM";
  const clean = name.replace(/^(dr\.|drg\.|Ns\.|H\.|Hj\.)\s*/i, "");
  const parts = clean.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function mapUserMeToProfile(userMe: UserMe): UserProfile {
  const role = ROLE_BACKEND_MAP[userMe.role] || "TENAGA_MEDIS";
  return {
    idPegawai: userMe.pegawai?.idPegawai,
    idAkun: userMe.idAkun,
    nip: userMe.pegawai?.nip || "",
    nama: userMe.pegawai?.nama || userMe.username,
    jabatan: userMe.pegawai?.jabatan || "Staf",
    unit: userMe.pegawai?.unitKerja || "RSI Medika",
    email: userMe.pegawai?.email || "",
    role,
    initials: getInitials(userMe.pegawai?.nama || userMe.username),
    sisaJatahCuti: userMe.pegawai?.sisaJatahCuti,
  };
}

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (role?: UserRole) => Promise<void>;
  loginWithCredentials: (identifier: string, password: string) => Promise<UserProfile>;
  logout: () => void;
  switchRole: (role: UserRole, navigate?: boolean) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<UserRole>("TENAGA_MEDIS");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Memuat profil dari backend bila token tersedia
  const refreshProfile = useCallback(async () => {
    const token = getAuthToken();
    if (!token) {
      setIsAuthenticated(false);
      setUserProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const meData = await authService.me();
      const profile = mapUserMeToProfile(meData);
      setUserProfile(profile);
      setRoleState(profile.role);
      setIsAuthenticated(true);
      localStorage.setItem("medika_role", profile.role);
      localStorage.setItem("medika_auth", "true");
    } catch (err: any) {
      // Jika token expired / invalid (401 atau 403), hapus sesi
      if (err?.status === 401 || err?.status === 403) {
        setAuthToken(null);
        setIsAuthenticated(false);
        setUserProfile(null);
        localStorage.removeItem("medika_role");
        localStorage.setItem("medika_auth", "false");
      } else {
        // Fallback hanya jika jaringan offline sementara (status === 0)
        const savedRole = (localStorage.getItem("medika_role") as UserRole) || "TENAGA_MEDIS";
        setRoleState(savedRole);
        setUserProfile(ROLE_PROFILES[savedRole]);
        setIsAuthenticated(true);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const loginWithCredentials = async (identifier: string, password: string): Promise<UserProfile> => {
    setError(null);
    setIsLoading(true);
    try {
      await authService.login(identifier, password);
      const meData = await authService.me();
      const profile = mapUserMeToProfile(meData);

      setUserProfile(profile);
      setRoleState(profile.role);
      setIsAuthenticated(true);
      localStorage.setItem("medika_role", profile.role);
      localStorage.setItem("medika_auth", "true");

      router.push(`/${ROLE_PATHS[profile.role]}/dashboard`);
      return profile;
    } catch (err: any) {
      setError(err?.message || "Login gagal");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const switchRole = async (newRole: UserRole, navigate = true) => {
    setIsLoading(true);
    const creds = DEFAULT_CREDENTIALS[newRole];
    if (creds) {
      try {
        await authService.login(creds.identifier, creds.password);
        const meData = await authService.me();
        const profile = mapUserMeToProfile(meData);
        setUserProfile(profile);
        setRoleState(profile.role);
        setIsAuthenticated(true);
        localStorage.setItem("medika_role", profile.role);
        localStorage.setItem("medika_auth", "true");
        if (navigate) {
          router.push(`/${ROLE_PATHS[profile.role]}/dashboard`);
        }
      } catch {
        setRoleState(newRole);
        setUserProfile(ROLE_PROFILES[newRole]);
        setIsAuthenticated(true);
        if (navigate) {
          router.push(`/${ROLE_PATHS[newRole]}/dashboard`);
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      setRoleState(newRole);
      setUserProfile(ROLE_PROFILES[newRole]);
      setIsAuthenticated(true);
      setIsLoading(false);
      if (navigate) {
        router.push(`/${ROLE_PATHS[newRole]}/dashboard`);
      }
    }
  };

  const login = async (newRole: UserRole = "TENAGA_MEDIS") => {
    await switchRole(newRole, false);
    router.push(`/${ROLE_PATHS[newRole]}/dashboard`);
  };

  const logout = () => {
    authService.logout();
    setAuthToken(null);
    setIsAuthenticated(false);
    setUserProfile(null);
    localStorage.removeItem("medika_role");
    localStorage.setItem("medika_auth", "false");
    router.push("/login");
  };

  const user = isAuthenticated ? (userProfile || ROLE_PROFILES[role]) : null;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        isLoading,
        error,
        login,
        loginWithCredentials,
        logout,
        switchRole,
        refreshProfile,
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
