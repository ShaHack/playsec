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
    ? "bg-[#FBF0F0] text-[#C95757] border-[#F5D3D3]"
    : "bg-[#E8F4F0] text-[#3D8B72] border-[#C4E4D9]";

  const fileIconColor = isOffensive ? "text-[#C95757]" : "text-[#3D8B72]";
  const titleHoverColor = isOffensive ? "group-hover:text-[#C95757]" : "group-hover:text-[#3D8B72]";

  return (
    <div
      className="group rounded-lg border border-[#D9E4EA] bg-white hover:border-[#4FAFC1] transition-all duration-150 p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs select-none"
      tabIndex={0}
      aria-label={`${item.title} resource row`}
    >
      {/* Left Column: Small Icon + Title + Compact Metadata */}
      <div className="flex items-start gap-3 min-w-0 flex-1">
        {/* PDF File Icon */}
        <div className={`p-2 rounded bg-[#F5F8FA] border border-[#D9E4EA] shrink-0 mt-0.5 ${fileIconColor}`}>
          <FileText className="h-4 w-4" />
        </div>

        {/* Info Column */}
        <div className="min-w-0 flex-1">
          {/* Main Title */}
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className={`text-sm font-bold text-[#17232D] transition-colors truncate ${titleHoverColor}`}>
              {item.title}
            </h3>

            {/* Category / Security Domain Badge */}
            <span className={`px-1.5 py-0.5 rounded border text-[8px] font-extrabold uppercase tracking-wider ${domainBadgeColor}`}>
              {item.category}
            </span>

            {/* Resource Type Subcategory Badge */}
            {item.resource_type && (
              <span className="px-1.5 py-0.5 rounded border border-[#D9E4EA] bg-[#F5F8FA] text-[8px] font-semibold text-[#60717D]">
                {item.resource_type}
              </span>
            )}
          </div>

          {/* Subtitle / Metadata Line */}
          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[#60717D] font-mono">
            <span>{item.author}</span>
            <span>•</span>
            <span className="uppercase text-[#17232D] font-bold">{item.file_format || "PDF"}</span>
            <span>•</span>
            <span>{item.file_size || "2.72 MB"}</span>
          </div>
        </div>
      </div>

      {/* Right Column: Compact Action Buttons */}
      <div className="flex items-center gap-2 shrink-0 justify-end pt-2 md:pt-0 border-t md:border-t-0 border-[#D9E4EA]">
        {/* Open Button (Replaces Preview) */}
        <a
          href={isLoggedIn ? item.file_url : "#"}
          onClick={(e) => onOpen(item, e)}
          target={isLoggedIn ? "_blank" : undefined}
          rel="noopener noreferrer"
          aria-label={`Open ${item.title}`}
          className="h-8 px-3 rounded bg-[#173B57] text-white hover:bg-[#245A7A] font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4FAFC1]"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Open
        </a>

        {/* Download Button */}
        <button
          onClick={(e) => onDownload(item, e)}
          aria-label={`Download ${item.title}`}
          className="h-8 px-3 rounded bg-white border border-[#D9E4EA] text-[#17232D] hover:bg-[#F5F8FA] font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4FAFC1]"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </button>

        {/* Bookmark Button */}
        <button
          onClick={(e) => onBookmark(item, e)}
          aria-label={`Bookmark ${item.title}`}
          className={`h-8 w-8 rounded border flex items-center justify-center transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#4FAFC1] ${
            isBookmarked
              ? isOffensive
                ? "bg-[#FBF0F0] border-[#C95757] text-[#C95757]"
                : "bg-[#E8F4F0] border-[#3D8B72] text-[#3D8B72]"
              : "bg-white border-[#D9E4EA] text-[#60717D] hover:text-[#17232D] hover:bg-[#F5F8FA]"
          }`}
          title={isBookmarked ? "Remove bookmark" : "Save bookmark"}
        >
          <Bookmark className="h-3.5 w-3.5 fill-current" style={{ fillOpacity: isBookmarked ? 1 : 0 }} />
        </button>
      </div>
    </div>
  );
}
