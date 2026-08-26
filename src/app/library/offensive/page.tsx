"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { libraryService } from "@/services/libraryService";
import { LibraryResource } from "@/types/library";
import { Search, X, BookOpen } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import AuthModal from "@/components/AuthModal";
import { downloadFile } from "@/utils/download";
import LibraryResourceRow from "@/components/LibraryResourceRow";

const OFFENSIVE_TYPES = [
  "All",
  "PDF Guide",
  "Cheat Sheet",
  "Payload Reference",
  "Web Exploitation",
  "Active Directory",
  "Privilege Escalation",
  "Wireless Security",
  "Cloud Pentesting"
];

export default function OffensiveLibrary() {
  const { isLoggedIn } = useAuth();
  const [resources, setResources] = useState<LibraryResource[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);
  const [authModal, setAuthModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    pendingAction: any;
  }>({
    isOpen: false,
    title: "",
    message: "",
    pendingAction: null,
  });

  // Auto-resume pending download after login
  useEffect(() => {
    if (!isLoggedIn) return;
    try {
      const saved = localStorage.getItem("playsec_pending_action");
      if (saved) {
        const action = JSON.parse(saved);
        if (action.type === "download" && action.url) {
          localStorage.removeItem("playsec_pending_action");
          downloadFile(action.url, action.title);
        }
      }
    } catch {
      // Silently ignore storage parse errors
    }
  }, [isLoggedIn]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setErrorMsg("");
      try {
        const data = await libraryService.getAllResources(searchQuery, "offensive", selectedType);
        setResources(data);
      } catch (err: unknown) {
        setErrorMsg((err as Error).message || "Unable to connect to PlaySec servers.");
        setResources([]);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [searchQuery, selectedType]);

  const handleBookmarkToggle = (id: string) => {
    if (!isLoggedIn) {
      setAuthModal({
        isOpen: true,
        title: "Sign in required to bookmark",
        message: "Please sign in with Google to save resources to your bookmarks.",
        pendingAction: null,
      });
      return;
    }
    setBookmarkedIds((prev) => 
      prev.includes(id) ? prev.filter(bId => bId !== id) : [...prev, id]
    );
  };

  const handleOpen = (item: LibraryResource, e: React.MouseEvent) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setAuthModal({
        isOpen: true,
        title: "Sign in required to open resource",
        message: "Please sign in with Google to access security resources and documentation.",
        pendingAction: { type: "download", url: item.file_url, title: item.title },
      });
    }
  };

  const handleDownload = (item: LibraryResource, e: React.MouseEvent) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setAuthModal({
        isOpen: true,
        title: "Sign in required to download file",
        message: "Please sign in with Google to download security resources and guides.",
        pendingAction: { type: "download", url: item.file_url, title: item.title },
      });
      return;
    }
    downloadFile(item.file_url, item.title);
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#F5F8FA] text-[#17232D] py-8 relative overflow-hidden select-text">
        {/* Subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            opacity: 0.4,
            backgroundImage: "linear-gradient(var(--color-border-color, #D9E4EA) 1px, transparent 1px), linear-gradient(90deg, var(--color-border-color, #D9E4EA) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        <div className="relative z-10 mx-auto max-w-[1380px] px-6 lg:px-10">
          
          {/* Header Panel */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div className="max-w-2xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#C95757] block mb-1">
                Offensive Security Hub
              </span>
              <h1 className="text-2xl font-extrabold text-[#17232D] tracking-tight leading-tight">
                Offensive Security Library
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-[#60717D] leading-relaxed">
                Red team reference sheets, vulnerability exploitation frameworks, Active Directory delegation vectors, and cloud penetration blueprints.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80 shrink-0">
              <span className="absolute inset-y-0 left-3 flex items-center text-[#60717D]">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search offensive resources..."
                className="w-full h-9 pl-9.5 pr-8 rounded border border-[#D9E4EA] bg-white text-xs text-[#17232D] placeholder:text-[#60717D] focus:border-[#C95757] focus:outline-none transition-colors"
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

          {/* Resource Type Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6 select-none">
            {OFFENSIVE_TYPES.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                  selectedType === type
                    ? "bg-[#C95757] text-white"
                    : "bg-white border border-[#D9E4EA] text-[#60717D] hover:text-[#17232D] hover:bg-[#F5F8FA]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {errorMsg && (
            <div className="mb-6 text-xs font-semibold text-[#C95757] bg-[#FBF0F0] border border-[#F5D3D3] p-4 rounded">
              {errorMsg}
            </div>
          )}

          {/* Resource File-Explorer List Display */}
          {loading ? (
            <div className="text-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C95757] mx-auto mb-4" />
              <p className="text-xs text-[#60717D]">Querying offensive repository...</p>
            </div>
          ) : resources.length > 0 ? (
            <div className="space-y-2.5">
              {resources.map((item) => (
                <LibraryResourceRow
                  key={item.id}
                  item={item}
                  isLoggedIn={isLoggedIn}
                  isBookmarked={bookmarkedIds.includes(item.id)}
                  onOpen={handleOpen}
                  onDownload={handleDownload}
                  onBookmark={(item, e) => {
                    e.preventDefault();
                    handleBookmarkToggle(item.id);
                  }}
                />
              ))}
            </div>
          ) : (
            !errorMsg && (
              <div className="text-center py-16 border border-dashed border-[#D9E4EA] rounded bg-white select-none">
                <BookOpen className="h-8 w-8 text-[#8193A0] mx-auto mb-3" />
                <h3 className="text-sm font-bold text-[#17232D] mb-0.5">No resources available yet.</h3>
              </div>
            )
          )}

        </div>
      </main>

      <AuthModal
        isOpen={authModal.isOpen}
        onClose={() => setAuthModal((p) => ({ ...p, isOpen: false }))}
        title={authModal.title}
        message={authModal.message}
        pendingAction={authModal.pendingAction}
      />

      <Footer />
    </>
  );
}
