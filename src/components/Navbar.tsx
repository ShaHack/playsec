"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { 
  Search, Shield, User, X, ChevronRight, FileText, 
  BookOpen, Terminal, Zap, Lock, Eye, Activity, Cpu, Key, Menu
} from "lucide-react";
import { playbookService } from "@/services/playbookService";
import { AudioPlaybook } from "@/types/playbook";
import { motion, AnimatePresence } from "framer-motion";

interface NavbarProps {
  isLoggedIn: boolean;
  onToggleLogin: () => void;
}

export default function Navbar({ isLoggedIn, onToggleLogin }: NavbarProps) {
  const pathname = usePathname();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  
  // Mega Menu State
  const [isMegaMenuOpen, setIsMegaMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<AudioPlaybook[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileLibraryOpen, setIsMobileLibraryOpen] = useState(false);

  useEffect(() => {
    function handleOutsideClick(e: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    const query = searchQuery.trim();
    if (!query) {
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const results = await playbookService.getAllPlaybooks(query);
        setSearchResults(results);
      } catch (e) {
        console.error("Search failed:", e);
      }
    }, 150);

    return () => clearTimeout(handler);
  }, [searchQuery]);

  const isHomeActive = pathname === "/";
  const isPlaybooksActive = pathname.startsWith("/playbooks");
  const isLibraryActive = pathname.startsWith("/library");
  const isCommunityActive = pathname.startsWith("/community");

  const defensiveItems = [
    { icon: <FileText className="h-4 w-4 text-[#3B82F6]" />, title: "PDF Guides", desc: "Technical guides in PDF format" },
    { icon: <BookOpen className="h-4 w-4 text-[#3B82F6]" />, title: "Cheat Sheets", desc: "Operational brief sheets" },
    { icon: <Terminal className="h-4 w-4 text-[#3B82F6]" />, title: "Detection Rules", desc: "Sigma and YARA blueprints" },
    { icon: <Activity className="h-4 w-4 text-[#3B82F6]" />, title: "Incident Response", desc: "Incident containment guides" },
    { icon: <Lock className="h-4 w-4 text-[#3B82F6]" />, title: "Hardening Guides", desc: "Secure configuration baselines" },
    { icon: <Shield className="h-4 w-4 text-[#3B82F6]" />, title: "SOC References", desc: "Security operations playbooks" },
    { icon: <Eye className="h-4 w-4 text-[#3B82F6]" />, title: "Malware Analysis", desc: "Static and dynamic analysis steps" },
    { icon: <Zap className="h-4 w-4 text-[#3B82F6]" />, title: "Threat Intelligence", desc: "Threat hunting indices" },
  ];

  const offensiveItems = [
    { icon: <FileText className="h-4 w-4 text-[#EF4444]" />, title: "PDF Guides", desc: "Offensive strategies in PDF format" },
    { icon: <BookOpen className="h-4 w-4 text-[#EF4444]" />, title: "Cheat Sheets", desc: "Exploitation reference sheets" },
    { icon: <Terminal className="h-4 w-4 text-[#EF4444]" />, title: "Payload References", desc: "Dynamic payload blueprints" },
    { icon: <Cpu className="h-4 w-4 text-[#EF4444]" />, title: "Web Exploitation", desc: "OWASP Top 10 exploitation techniques" },
    { icon: <Key className="h-4 w-4 text-[#EF4444]" />, title: "Active Directory", desc: "Domain escalation walkthroughs" },
    { icon: <Lock className="h-4 w-4 text-[#EF4444]" />, title: "Privilege Escalation", desc: "System kernel bypass blueprints" },
    { icon: <Activity className="h-4 w-4 text-[#EF4444]" />, title: "Wireless Security", desc: "WPA and enterprise network tests" },
    { icon: <Zap className="h-4 w-4 text-[#EF4444]" />, title: "Cloud Pentesting", desc: "AWS and Azure auditing templates" },
  ];

  return (
    <header className="sticky top-0 z-50 h-[62px] w-full border-b border-[#2A3442] bg-[#141A22] select-none">
      <div className="mx-auto flex h-full max-w-[1380px] items-center justify-between px-6 lg:px-10">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-[#3B82F6] text-white transition-transform group-hover:scale-105">
            <Shield className="h-4.5 w-4.5 stroke-[2.5]" />
          </div>
          <span className="text-[17px] font-black tracking-tight text-white">
            PLAY<span className="text-[#3B82F6]">SEC</span>
          </span>
        </Link>

        {/* Nav links (Desktop) */}
        <nav className="hidden md:flex items-center gap-8 h-full">
          {/* Home */}
          <div className="relative group py-5 h-full flex items-center">
            <Link
              href="/"
              className={`text-sm font-bold transition-colors ${
                isHomeActive ? "text-[#3B82F6]" : "text-[#A8B3C5] hover:text-white"
              }`}
            >
              Home
            </Link>
            <span className={`absolute bottom-0 left-0 h-[2px] bg-[#3B82F6] transition-all ${
              isHomeActive ? "w-full" : "w-0 group-hover:w-full"
            }`} />
          </div>

          {/* Audio Playbooks */}
          <div className="relative group py-5 h-full flex items-center">
            <Link
              href="/playbooks"
              className={`text-sm font-bold transition-colors ${
                isPlaybooksActive ? "text-[#3B82F6]" : "text-[#A8B3C5] hover:text-white"
              }`}
            >
              Audio Playbooks
            </Link>
            <span className={`absolute bottom-0 left-0 h-[2px] bg-[#3B82F6] transition-all ${
              isPlaybooksActive ? "w-full" : "w-0 group-hover:w-full"
            }`} />
          </div>

          {/* Library (Mega Menu Trigger - Desktop Hover) */}
          <div 
            className="relative h-full flex items-center"
            onMouseEnter={() => setIsMegaMenuOpen(true)}
            onMouseLeave={() => setIsMegaMenuOpen(false)}
          >
            <span
              className={`text-sm font-bold cursor-pointer transition-colors ${
                isLibraryActive ? "text-[#3B82F6]" : "text-[#A8B3C5] hover:text-white"
              }`}
            >
              Library
            </span>
            <span className={`absolute bottom-0 left-0 h-[2px] bg-[#3B82F6] transition-all ${
              isLibraryActive ? "w-full" : "w-0"
            } ${isMegaMenuOpen ? "w-full" : ""}`} />

            {/* Premium Mega Menu Popup (Desktop) */}
            <AnimatePresence>
              {isMegaMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-[10px] w-[900px] max-w-[90vw] border border-[#2A3442] bg-[#141A22] rounded shadow-2xl p-6 grid grid-cols-2 gap-6 z-50 text-left"
                  style={{ transform: "translateX(-50%)" }}
                >
                  {/* Arrow Indicator */}
                  <div className="absolute top-[-6px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-[#2A3442]" />
                  <div className="absolute top-[-5px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-[#141A22]" />

                  {/* Left Column: Defensive Security */}
                  <div className="border-r border-[#2A3442]/60 pr-6">
                    <Link 
                      href="/library/defensive"
                      className="group/col flex items-center justify-between mb-3 text-sm font-bold text-white hover:text-[#3B82F6] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Shield className="h-4.5 w-4.5 text-[#3B82F6]" />
                        Defensive Security
                      </span>
                      <ChevronRight className="h-4 w-4 transition-transform group-hover/col:translate-x-1" />
                    </Link>
                    <p className="text-[11px] text-[#A8B3C5] leading-relaxed mb-4">
                      Guides, blue team references, incident response documentation and defensive knowledge.
                    </p>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {defensiveItems.map((item, idx) => (
                        <Link
                          key={idx}
                          href="/library/defensive"
                          className="flex items-start gap-2 p-1.5 rounded hover:bg-[#0B0F14] group/item transition-colors"
                        >
                          <div className="mt-0.5 shrink-0">{item.icon}</div>
                          <div className="min-w-0">
                            <span className="block text-[11px] font-bold text-slate-200 group-hover/item:text-[#3B82F6] transition-colors truncate">
                              {item.title}
                            </span>
                            <span className="block text-[9px] text-[#A8B3C5] truncate leading-tight mt-0.5">
                              {item.desc}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Right Column: Offensive Security */}
                  <div className="pl-2">
                    <Link 
                      href="/library/offensive"
                      className="group/col flex items-center justify-between mb-3 text-sm font-bold text-white hover:text-[#EF4444] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Zap className="h-4.5 w-4.5 text-[#EF4444]" />
                        Offensive Security
                      </span>
                      <ChevronRight className="h-4 w-4 transition-transform group-hover/col:translate-x-1" />
                    </Link>
                    <p className="text-[11px] text-[#A8B3C5] leading-relaxed mb-4">
                      Red team references, exploitation documentation and penetration testing resources.
                    </p>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                      {offensiveItems.map((item, idx) => (
                        <Link
                          key={idx}
                          href="/library/offensive"
                          className="flex items-start gap-2 p-1.5 rounded hover:bg-[#0B0F14] group/item transition-colors"
                        >
                          <div className="mt-0.5 shrink-0">{item.icon}</div>
                          <div className="min-w-0">
                            <span className="block text-[11px] font-bold text-slate-200 group-hover/item:text-[#EF4444] transition-colors truncate">
                              {item.title}
                            </span>
                            <span className="block text-[9px] text-[#A8B3C5] truncate leading-tight mt-0.5">
                              {item.desc}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Community */}
          <div className="relative group py-5 h-full flex items-center">
            <Link
              href="/community"
              className={`text-sm font-bold transition-colors ${
                isCommunityActive ? "text-[#3B82F6]" : "text-[#A8B3C5] hover:text-white"
              }`}
            >
              Community
            </Link>
            <span className={`absolute bottom-0 left-0 h-[2px] bg-[#3B82F6] transition-all ${
              isCommunityActive ? "w-full" : "w-0 group-hover:w-full"
            }`} />
          </div>
        </nav>

        {/* Right: search + login + Mobile menu button */}
        <div className="flex items-center gap-3.5">
          {/* Desktop search */}
          <div ref={searchContainerRef} className="relative hidden sm:block">
            <span className="absolute inset-y-0 left-3 flex items-center text-[#A8B3C5]">
              <Search className="h-4 w-4 stroke-[1.8]" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                const val = e.target.value;
                setSearchQuery(val);
                if (!val.trim()) {
                  setSearchResults([]);
                }
              }}
              onFocus={() => setIsFocused(true)}
              placeholder="Search briefings & docs…"
              className="h-9 w-56 rounded border border-[#2A3442] bg-[#0B0F14] pl-9 pr-8 text-xs text-white transition-all placeholder:text-[#A8B3C5] focus:w-68 focus:border-[#3B82F6] focus:outline-none"
              style={{ paddingLeft: "2.25rem" }}
              aria-label="Search briefings and documentation"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                className="absolute inset-y-0 right-2.5 flex items-center text-[#A8B3C5] hover:text-white"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {isFocused && searchQuery.trim() && (
              <div className="absolute right-0 mt-1.5 w-80 rounded border border-[#2A3442] bg-[#141A22] p-2 shadow-lg max-h-72 overflow-y-auto z-50">
                {searchResults.length > 0 ? (
                  <div className="space-y-0.5">
                    {searchResults.map((p) => (
                      <Link
                        key={p.id}
                        href={`/playbooks/${p.slug}`}
                        onClick={() => { setIsFocused(false); setSearchQuery(""); }}
                        className="block px-3 py-2 rounded hover:bg-[#2A3442] transition-colors"
                      >
                        <h4 className="text-xs font-bold text-white truncate">{p.title}</h4>
                        <p className="text-[10px] text-[#A8B3C5] truncate mt-0.5">{p.description}</p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-center text-xs text-[#A8B3C5]">No matching briefs found.</div>
                )}
              </div>
            )}
          </div>

          {/* User action */}
          <button
            onClick={onToggleLogin}
            className="flex h-9 w-9 items-center justify-center rounded border border-[#2A3442] bg-[#0B0F14] text-slate-350 hover:bg-[#141A22] hover:text-white transition-colors"
            title={isLoggedIn ? "Log Out Profile" : "Authenticate Profile"}
          >
            <User className={`h-4.5 w-4.5 ${isLoggedIn ? "text-[#3B82F6]" : ""}`} />
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="flex md:hidden h-9 w-9 items-center justify-center rounded border border-[#2A3442] bg-[#0B0F14] text-slate-350 hover:bg-[#141A22] hover:text-white transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="h-4.5 w-4.5" />
          </button>
        </div>

      </div>

      {/* Mobile Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-b border-[#2A3442] bg-[#141A22] px-6 py-4 space-y-3 flex flex-col z-40 relative"
          >
            <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-bold text-[#A8B3C5] hover:text-white py-1">Home</Link>
            <Link href="/playbooks" onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-bold text-[#A8B3C5] hover:text-white py-1">Audio Playbooks</Link>
            
            {/* Library mobile accordion */}
            <div>
              <button 
                onClick={() => setIsMobileLibraryOpen((prev) => !prev)}
                className="w-full flex items-center justify-between text-xs font-bold text-[#A8B3C5] hover:text-white py-1 text-left"
              >
                <span>Library</span>
                <ChevronRight className={`h-3 w-3 transition-transform ${isMobileLibraryOpen ? "rotate-90" : ""}`} />
              </button>

              {isMobileLibraryOpen && (
                <div className="mt-2 pl-4 border-l border-[#2A3442] space-y-2 flex flex-col">
                  <Link href="/library/defensive" onClick={() => setIsMobileMenuOpen(false)} className="text-[11px] text-[#3B82F6] font-bold py-1">
                    🛡 Defensive Security
                  </Link>
                  <Link href="/library/offensive" onClick={() => setIsMobileMenuOpen(false)} className="text-[11px] text-[#EF4444] font-bold py-1">
                    ⚔ Offensive Security
                  </Link>
                </div>
              )}
            </div>

            <Link href="/community" onClick={() => setIsMobileMenuOpen(false)} className="text-xs font-bold text-[#A8B3C5] hover:text-white py-1">Community</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
