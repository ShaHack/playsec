"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { playbookService } from "@/services/playbookService";
import { AudioPlaybook } from "@/types/playbook";
import { preloadAudioTrack } from "@/utils/audioPreloader";
import { 
  Search, X, Volume2, Calendar, Users, Bookmark, Play
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const DIFFICULTY_STYLES = {
  "Beginner": "bg-[#E8F4F0] text-[#3D8B72] border border-[#C4E4D9]",
  "Intermediate": "bg-[#FDF6E7] text-[#C28A32] border border-[#F7E8C8]",
  "Advanced": "bg-[#FBF0F0] text-[#C95757] border border-[#F5D3D3]"
};

export default function PlaybooksLibrary() {
  const { isLoggedIn, loginWithGoogle } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [playbooksList, setPlaybooksList] = useState<AudioPlaybook[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMsg("");
      try {
        const data = await playbookService.getAllPlaybooks(searchQuery);
        setPlaybooksList(data);
      } catch (err: unknown) {
        setErrorMsg((err as Error).message || "Unable to connect to PlaySec servers.");
        setPlaybooksList([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [searchQuery]);

  const handleBookmarkToggle = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoggedIn) {
      loginWithGoogle();
      return;
    }
    setBookmarkedIds((prev) => 
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F5F8FA] text-[#17232D] py-12 relative overflow-hidden select-text">
        {/* Subtle grid background */}
        <div className="pointer-events-none absolute inset-0 z-0"
          style={{
            opacity: 0.4,
            backgroundImage: "linear-gradient(var(--color-border-color, #D9E4EA) 1px, transparent 1px), linear-gradient(90deg, var(--color-border-color, #D9E4EA) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }} />

        <div className="relative z-10 mx-auto max-w-[1380px] px-6 lg:px-10">
          
          {/* Header Panel */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div className="max-w-2xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#173B57] block mb-1">
                SecOps Audio Playbooks
              </span>
              <h1 className="text-2xl font-extrabold text-[#17232D] tracking-tight leading-tight">
                Professional Security Audio Briefings
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#60717D] leading-relaxed">
                Expert-reviewed cybersecurity audio briefings for learning anywhere.
              </p>
            </div>

            {/* Search bar */}
            <div className="relative w-full md:w-80 shrink-0">
              <span className="absolute inset-y-0 left-3 flex items-center text-[#60717D]">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search briefings..."
                className="w-full h-9 pl-9.5 pr-8 rounded border border-[#D9E4EA] bg-white text-xs text-[#17232D] placeholder:text-[#60717D] focus:border-[#4FAFC1] focus:outline-none transition-colors"
                style={{ paddingLeft: "2.3rem" }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-3 flex items-center text-[#60717D] hover:text-[#17232D]"
                  aria-label="Clear filter"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {errorMsg && (
            <div className="mb-6 text-xs font-semibold text-[#C95757] bg-[#FBF0F0] border border-[#F5D3D3] p-4 rounded">
              {errorMsg}
            </div>
          )}

          {/* Grid display: Max 3 cards per row on desktop. Tighter spacing. */}
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4FAFC1] mx-auto mb-4" />
              <p className="text-xs text-[#60717D]">Querying briefings registry...</p>
            </div>
          ) : playbooksList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {playbooksList.map((p) => {
                const difficultyStyle = DIFFICULTY_STYLES[p.difficulty] || "bg-[#F5F8FA] text-[#60717D] border border-[#D9E4EA]";
                const displayDate = p.updated_date
                  ? new Date(p.updated_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : "Recently Updated";
                const isBookmarked = bookmarkedIds.includes(p.id);

                return (
                  <div
                    key={p.id}
                    className="group flex flex-col rounded-xl border border-[#D9E4EA] bg-white hover:border-[#4FAFC1] transition-all duration-200 overflow-hidden shadow-xs"
                  >
                    {/* Fixed 16:9 Aspect Ratio Header Image Container */}
                    <div className="relative aspect-video w-full bg-[#F5F8FA] overflow-hidden border-b border-[#D9E4EA] select-none rounded-t-xl flex items-center justify-center">
                      {p.cover_image ? (
                        <Image
                          src={p.cover_image}
                          alt={p.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          className="object-cover object-center transition-transform duration-300 ease-out group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[#60717D]">
                          <Volume2 className="h-7 w-7 opacity-70" />
                        </div>
                      )}
                      
                      {/* Difficulty Badge */}
                      <span className={`absolute top-2.5 left-2.5 z-20 px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-wider ${difficultyStyle}`}>
                        {p.difficulty}
                      </span>

                      {/* Duration Chip */}
                      <span className="absolute top-2.5 right-2.5 z-20 bg-white/90 text-[#173B57] backdrop-blur-md px-2 py-0.5 rounded-full text-[9px] font-mono font-medium border border-[#D9E4EA] flex items-center gap-1">
                        <Volume2 className="h-2.5 w-2.5 text-[#4FAFC1]" />
                        {p.duration}
                      </span>
                    </div>

                    {/* Card Body */}
                    <div className="p-3.5 flex-1 flex flex-col justify-between">
                      <div>
                        {/* Title */}
                        <h3 className="text-xs sm:text-sm font-bold text-[#17232D] tracking-tight leading-snug mb-1 group-hover:text-[#4FAFC1] transition-colors line-clamp-1">
                          {p.title}
                        </h3>

                        {/* Author & Date Metadata */}
                        <div className="flex items-center gap-2 mb-2 text-[9px] text-[#60717D] select-none">
                          <span className="flex items-center gap-1 truncate max-w-[120px]">
                            <Users className="h-2.5 w-2.5 text-[#8193A0] shrink-0" />
                            {p.author}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="h-2.5 w-2.5 text-[#8193A0] shrink-0" />
                            {displayDate}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-[11px] text-[#60717D] leading-relaxed mb-3 line-clamp-2">
                          {p.description}
                        </p>
                      </div>

                      {/* Action Footer */}
                      <div className="flex items-center gap-2 pt-2.5 border-t border-[#D9E4EA]">
                        <Link
                          href={`/playbooks/${p.slug}`}
                          onMouseEnter={() => {
                            playbookService.getPlaybookBySlug(p.slug);
                            if (p.audio_url) preloadAudioTrack(p.audio_url, "metadata");
                          }}
                          className="flex-1 h-7.5 rounded-lg bg-[#173B57] hover:bg-[#245A7A] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all select-none shadow-xs"
                        >
                          <Play className="h-3 w-3 fill-white" />
                          Listen
                        </Link>
                        
                        <button
                          onClick={(e) => handleBookmarkToggle(p.id, e)}
                          className={`h-7.5 w-7.5 rounded-lg border flex items-center justify-center transition-all select-none ${
                            isBookmarked 
                              ? "bg-[#E6F4F7] border-[#4FAFC1] text-[#2F6F95]"
                              : "bg-white border-[#D9E4EA] text-[#60717D] hover:text-[#17232D]"
                          }`}
                          title="Bookmark briefing"
                        >
                          <Bookmark className="h-3.5 w-3.5 fill-current" style={{ fillOpacity: isBookmarked ? 1 : 0 }} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            !errorMsg && (
              <div className="text-center py-16 border border-dashed border-[#D9E4EA] rounded bg-white select-none">
                <Volume2 className="h-8 w-8 text-[#8193A0] mx-auto mb-3" />
                <h3 className="text-sm font-bold text-[#17232D] mb-0.5">No resources have been published yet.</h3>
                <p className="text-xs text-[#60717D] max-w-sm mx-auto">
                  Audio playbooks list is currently empty.
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
