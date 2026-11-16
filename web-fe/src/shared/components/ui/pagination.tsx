"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  onItemsPerPageChange?: (perPage: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
  pageSizeOptions = [5, 10, 20],
  className,
}: PaginationProps) {
  if (totalPages <= 1 && (!totalItems || totalItems <= (itemsPerPage || 5))) {
    // If only 1 page and no need for pagination, still show simple info or minimal toolbar
    if (totalItems !== undefined && totalItems > 0) {
      return (
        <div className={cn("flex items-center justify-between px-4 sm:px-6 py-3 border-t border-gray-100 text-xs text-[#7E7E7E]", className)}>
          <span>Menampilkan seluruh {totalItems} data</span>
        </div>
      );
    }
    return null;
  }

  const safeTotalPages = Math.max(1, totalPages);
  const startItem = totalItems !== undefined && itemsPerPage !== undefined
    ? Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)
    : undefined;
  const endItem = totalItems !== undefined && itemsPerPage !== undefined
    ? Math.min(currentPage * itemsPerPage, totalItems)
    : undefined;

  // Generate page numbers with ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (safeTotalPages <= 5) {
      for (let i = 1; i <= safeTotalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", safeTotalPages);
      } else if (currentPage >= safeTotalPages - 2) {
        pages.push(1, "...", safeTotalPages - 3, safeTotalPages - 2, safeTotalPages - 1, safeTotalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", safeTotalPages);
      }
    }
    return pages;
  };

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-t border-gray-100 bg-white text-xs text-[#5F5F5F]",
        className
      )}
    >
      {/* Left: Info text & Per Page Select */}
      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
        {totalItems !== undefined && startItem !== undefined && endItem !== undefined ? (
          <span>
            Menampilkan <span className="font-semibold text-[#202020]">{startItem}</span>–
            <span className="font-semibold text-[#202020]">{endItem}</span> dari{" "}
            <span className="font-semibold text-[#202020]">{totalItems}</span> data
          </span>
        ) : (
          <span>Halaman {currentPage} dari {safeTotalPages}</span>
        )}

        {onItemsPerPageChange && itemsPerPage && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-[11px] text-[#7E7E7E]">Baris:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="py-1 px-2 rounded-md border border-gray-200 text-xs bg-white text-[#202020] focus:outline-none focus:border-[#4731B6] cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Buttons */}
      <div className="flex items-center gap-1 self-center sm:self-auto">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          aria-label="Halaman sebelumnya"
          className="p-1.5 rounded-lg border border-gray-200 text-[#5F5F5F] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-1">
          {getPageNumbers().map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-400">
                  ...
                </span>
              );
            }
            const isCurrent = p === currentPage;
            return (
              <button
                key={`page-${p}`}
                type="button"
                onClick={() => onPageChange(Number(p))}
                className={cn(
                  "min-w-8 h-8 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center",
                  isCurrent
                    ? "bg-[#4731B6] text-white shadow-xs"
                    : "border border-gray-200 text-[#3F3F3F] hover:bg-gray-50 bg-white"
                )}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= safeTotalPages}
          aria-label="Halaman berikutnya"
          className="p-1.5 rounded-lg border border-gray-200 text-[#5F5F5F] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
