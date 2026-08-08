"use client";

import { LibraryResource } from "@/types/library";
import { FileText, ExternalLink, Download, Bookmark } from "lucide-react";

interface LibraryResourceRowProps {
  item: LibraryResource;
  isLoggedIn: boolean;
  isBookmarked: boolean;
  onOpen: (item: LibraryResource, e: React.MouseEvent) => void;
  onDownload: (item: LibraryResource, e: React.MouseEvent) => void;
  onBookmark: (item: LibraryResource, e: React.MouseEvent) => void;
}

export default function LibraryResourceRow({
  item,
  isLoggedIn,
  isBookmarked,
  onOpen,
  onDownload,
  onBookmark
}: LibraryResourceRowProps) {
  const isOffensive = item.security_side === "offensive";

  const domainBadgeColor = isOffensive
    ? "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30"
    : "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30";

  const fileIconColor = isOffensive ? "text-[#EF4444]" : "text-[#3B82F6]";
  const titleHoverColor = isOffensive ? "group-hover:text-[#EF4444]" : "group-hover:text-[#3B82F6]";

  return (
    <div
      className="group rounded-lg border border-[#2A3442] bg-[#141A22]/90 hover:border-slate-500 hover:bg-[#18202A] transition-all duration-150 p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-sm select-none"
      tabIndex={0}
      aria-label={`${item.title} resource row`}
    >
      {/* Left Column: Small Icon + Title + Compact Metadata */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* PDF File Icon */}
        <div className={`p-2 rounded bg-[#0B0F14] border border-[#2A3442] shrink-0 mt-0.5 ${fileIconColor}`}>
          <FileText className="h-4 w-4" />
        </div>

        {/* Info Column */}
        <div className="min-w-0 flex-1">
          {/* Main Title */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`text-sm font-bold text-white transition-colors truncate ${titleHoverColor}`}>
              {item.title}
            </h3>

            {/* Category / Security Domain Badge */}
            <span className={`px-1.5 py-0.5 rounded border text-[8px] font-extrabold uppercase tracking-wider ${domainBadgeColor}`}>
              {item.category}
            </span>

            {/* Resource Type Subcategory Badge */}
            {item.resource_type && (
              <span className="px-1.5 py-0.5 rounded border border-[#2A3442] bg-[#0B0F14] text-[8px] font-semibold text-[#A8B3C5]">
                {item.resource_type}
              </span>
            )}
          </div>

          {/* Subtitle / Metadata Line */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[#A8B3C5] font-mono">
            <span>{item.author}</span>
            <span className="text-slate-650">•</span>
            <span className="uppercase text-slate-400 font-bold">{item.file_format || "PDF"}</span>
            <span className="text-slate-650">•</span>
            <span>{item.file_size || "2.72 MB"}</span>
          </div>
        </div>
      </div>

      {/* Right Column: Compact Action Buttons */}
      <div className="flex items-center gap-2 shrink-0 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[#2A3442]/60">
        {/* Open Button (Replaces Preview) */}
        <a
          href={isLoggedIn ? item.file_url : "#"}
          onClick={(e) => onOpen(item, e)}
          target={isLoggedIn ? "_blank" : undefined}
          rel="noopener noreferrer"
          aria-label={`Open ${item.title}`}
          className="h-8 px-3 rounded bg-[#0B0F14] border border-[#2A3442] text-white hover:bg-[#3B82F6] hover:border-[#3B82F6] font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open
        </a>

        {/* Download Button */}
        <button
          onClick={(e) => onDownload(item, e)}
          aria-label={`Download ${item.title}`}
          className="h-8 px-3 rounded bg-[#0B0F14] border border-[#2A3442] text-[#A8B3C5] hover:text-white hover:border-slate-500 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </button>

        {/* Bookmark Button */}
        <button
          onClick={(e) => onBookmark(item, e)}
          aria-label={`Bookmark ${item.title}`}
          className={`h-8 w-8 rounded border flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#3B82F6] ${
            isBookmarked
              ? isOffensive
                ? "bg-[#EF4444]/15 border-[#EF4444] text-[#EF4444]"
                : "bg-[#3B82F6]/15 border-[#3B82F6] text-[#3B82F6]"
              : "bg-[#0B0F14] border-[#2A3442] text-[#A8B3C5] hover:text-white hover:border-slate-500"
          }`}
          title={isBookmarked ? "Remove bookmark" : "Save bookmark"}
        >
          <Bookmark className="h-3.5 w-3.5 fill-current" style={{ fillOpacity: isBookmarked ? 1 : 0 }} />
        </button>
      </div>
    </div>
  );
}
