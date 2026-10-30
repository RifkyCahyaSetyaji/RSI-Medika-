"use client";

import React, { createContext, useContext, useState } from "react";
import { usePathname } from "next/navigation";

interface SidebarContextType {
  isOpen: boolean;
  openSidebar: () => void;
  closeSidebar: () => void;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const [prevPathname, setPrevPathname] = useState(pathname);

  // Close mobile sidebar during route transition
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setIsOpen(false);
  }

  const openSidebar = () => setIsOpen(true);
  const closeSidebar = () => setIsOpen(false);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <SidebarContext.Provider
      value={{
        isOpen,
        openSidebar,
        closeSidebar,
        toggleSidebar,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
}
