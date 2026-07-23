"use client";

import { useState, useEffect, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { libraryService } from "@/services/libraryService";
import { LibraryResource } from "@/types/library";
import { Search, X, BookOpen, ExternalLink, Download, FileText } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function KnowledgeLibrary() {
  const { isLoggedIn, loginWithGoogle } = useAuth();
  const [rawResources, setRawResources] = useState<LibraryResource[]>([]);
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMsg("");
      try {
        const data = await libraryService.getAllResources(searchQuery);
        setRawResources(data);
        if (selectedCategory !== "All") {
          setResources(data.filter(item => item.category === selectedCategory));
        } else {
          setResources(data);
        }
      } catch (err: unknown) {
        setErrorMsg((err as Error).message || "Failed to retrieve operational resources.");
        setResources([]);
        setRawResources([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [searchQuery, selectedCategory]);

  const categoriesList = useMemo(() => {
    const unique = new Set(rawResources.map(r => r.category).filter(Boolean));
    return ["All", ...Array.from(unique)];
  }, [rawResources]);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#0B0F14] text-slate-350 py-10 relative overflow-hidden select-text">
        {/* Subtle grid background */}
        <div className="pointer-events-none absolute inset-0 z-0"
          style={{
            opacity: 0.012,
            backgroundImage: "linear-gradient(#2A3442 1px, transparent 1px), linear-gradient(90deg, #2A3442 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }} />

        <div className="relative z-10 mx-auto max-w-[1380px] px-6 lg:px-10">
          
          {/* Header Panel */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#3B82F6] block mb-1">
                Reference Documentation
              </span>
              <h1 className="text-2xl font-extrabold text-white tracking-tight leading-tight">
                Knowledge Library
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#A8B3C5] leading-relaxed">
                Access configuration templates, vulnerability checklists, and incident response guidelines in PDF format.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80 shrink-0">
              <span className="absolute inset-y-0 left-3 flex items-center text-[#A8B3C5]">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search PDF briefs..."
                className="w-full h-9 pl-9.5 pr-8 rounded border border-[#2A3442] bg-[#141A22] text-xs text-white placeholder:text-[#A8B3C5] focus:border-[#3B82F6] focus:outline-none transition-colors"
                style={{ paddingLeft: "2.3rem" }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-3 flex items-center text-slate-500 hover:text-white"
                  aria-label="Clear filter"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-8 select-none">
            {categoriesList.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded text-xs font-bold transition-all ${
                  selectedCategory === cat
                    ? "bg-[#3B82F6] text-white"
                    : "bg-[#141A22] border border-[#2A3442] text-[#A8B3C5] hover:text-white hover:border-slate-500"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="mb-4 text-xs font-semibold text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 p-3 rounded">
              {errorMsg}
            </div>
          )}

          {/* Grid display */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6] mx-auto mb-4" />
              <p className="text-xs text-[#A8B3C5]">Retrieving operational assets...</p>
            </div>
          ) : resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {resources.map((item) => (
                <div
                  key={item.id}
                  className="group rounded border border-[#2A3442] bg-[#141A22] p-5 flex gap-5 hover:border-slate-500 transition-all duration-200"
                >
                  {/* Thumbnail representing resource */}
                  <div className="relative h-28 w-24 shrink-0 rounded border border-[#2A3442] bg-[#0B0F14] overflow-hidden select-none">
                    {item.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-[#A8B3C5]">
                        <FileText className="h-8 w-8" />
                      </div>
                    )}
                    <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">
                      {item.file_type.toUpperCase()}
                    </span>
                  </div>

                  {/* Metadata and Description */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-1.5 text-[10px] text-[#A8B3C5] select-none font-bold uppercase">
                        <span>{item.category}</span>
                      </div>
                      <h3 className="text-sm font-bold text-white mb-1.5 group-hover:text-[#3B82F6] transition-colors truncate">
                        {item.title}
                      </h3>
                      <p className="text-xs text-[#A8B3C5] leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-[#2A3442]/60 text-[10px] font-bold select-none">
                      <a
                        href={isLoggedIn ? item.file_url : "#"}
                        onClick={(e) => {
                          if (!isLoggedIn) {
                            e.preventDefault();
                            loginWithGoogle();
                          }
                        }}
                        target={isLoggedIn ? "_blank" : undefined}
                        rel="noopener noreferrer"
                        className="text-[#3B82F6] hover:text-blue-400 flex items-center gap-1"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Open PDF
                      </a>
                      <span className="text-slate-650">•</span>
                      <a
                        href={isLoggedIn ? item.file_url : "#"}
                        download={isLoggedIn}
                        onClick={(e) => {
                          if (!isLoggedIn) {
                            e.preventDefault();
                            loginWithGoogle();
                            return;
                          }
                          if (item.file_url.startsWith("http")) return;
                          e.preventDefault();
                          alert(`Downloading document: ${item.title}...`);
                        }}
                        className="text-[#A8B3C5] hover:text-white flex items-center gap-1"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            !errorMsg && (
              <div className="text-center py-20 border border-dashed border-[#2A3442] rounded bg-[#141A22]/40 select-none">
                <BookOpen className="h-8 w-8 text-slate-600 mx-auto mb-3" />
                <h3 className="text-sm font-bold text-white mb-0.5">No resources found</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No guides or documentation match your current filters.
                </p>
              </div>
            )
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
