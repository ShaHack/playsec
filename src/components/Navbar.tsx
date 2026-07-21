"use client";

import Link from "next/link";
import { useState, useMemo, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Search, Shield, User, X } from "lucide-react";
import { playbooks } from "@/playbooks/products";

interface NavbarProps {
  isLoggedIn: boolean;
  onToggleLogin: () => void;
}

export default function Navbar({ isLoggedIn, onToggleLogin }: NavbarProps) {
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];
    return playbooks.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.slug.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleMobileSearchToggle = () => {
    setIsMobileSearchOpen((prev) => {
      const next = !prev;
      if (next) setTimeout(() => mobileSearchRef.current?.focus(), 80);
      return next;
    });
  };

  const isHomeActive      = pathname === "/";
  const isPlaybooksActive = pathname.startsWith("/playbooks");
  const isCommunityActive = pathname.startsWith("/community");

  return (
    <header className="sticky top-0 z-50 h-[62px] w-full border-b border-[#27272A] bg-[#18181B] select-none">
      <div className="mx-auto flex h-full max-w-[1380px] items-center justify-between px-6 lg:px-10">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded bg-[#2563EB] text-white transition-transform group-hover:scale-105">
            <Shield className="h-4.5 w-4.5 stroke-[2.5]" />
          </div>
          <span className="text-[17px] font-black tracking-tight text-white">
            PLAY<span className="text-[#2563EB]">SEC</span>
          </span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-8">
          {[
            { href: "/",           label: "Home",      active: isHomeActive },
            { href: "/playbooks",  label: "Playbooks", active: isPlaybooksActive },
            { href: "/community",  label: "Community", active: isCommunityActive },
          ].map(({ href, label, active }) => (
            <div key={href} className="relative group py-1">
              <Link
                href={href}
                className={`text-sm font-bold transition-colors ${
                  active ? "text-[#2563EB]" : "text-[#A1A1AA] hover:text-white"
                }`}
              >
                {label}
              </Link>
              <span className={`absolute bottom-0 left-0 h-[2px] bg-[#2563EB] transition-all ${
                active ? "w-full" : "w-0 group-hover:w-full"
              }`} />
            </div>
          ))}
        </nav>

        {/* Right: search + login */}
        <div className="flex items-center gap-3.5">
          {/* Desktop search */}
          <div ref={searchContainerRef} className="relative hidden sm:block">
            <span className="absolute inset-y-0 left-3 flex items-center text-[#A1A1AA]">
              <Search className="h-4 w-4 stroke-[1.8]" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              placeholder="Search playbooks & docs…"
              className="h-9 w-56 rounded border border-[#27272A] bg-[#09090B] pl-9 pr-8 text-xs text-white transition-all placeholder:text-[#A1A1AA] focus:w-68 focus:border-[#2563EB] focus:outline-none"
              style={{ paddingLeft: "2.25rem" }}
              aria-label="Search playbooks and documentation"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-2.5 flex items-center text-[#A1A1AA] hover:text-white"
                aria-label="Clear search"
              >
                <X className="h-4 w-4" />
              </button>
            )}

            {isFocused && searchQuery.trim() && (
              <div className="absolute right-0 mt-1.5 w-80 rounded border border-[#27272A] bg-[#18181B] p-2 shadow-lg max-h-72 overflow-y-auto z-50">
                {searchResults.length > 0 ? (
                  <div className="space-y-0.5">
                    {searchResults.map((p) => (
                      <Link
                        key={p.id}
                        href={`/playbooks/${p.slug}`}
                        onClick={() => { setIsFocused(false); setSearchQuery(""); }}
                        className="block px-3 py-2 rounded hover:bg-[#27272A] transition-colors"
                      >
                        <span className="text-xs font-bold text-[#FAFAFA] block truncate">{p.title}</span>
                        <span className="text-[10px] text-[#A1A1AA] block truncate">{p.description}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="py-4 text-center text-xs text-[#A1A1AA] font-mono">No results found.</p>
                )}
              </div>
            )}
          </div>

          {/* Mobile search icon */}
          <button
            onClick={handleMobileSearchToggle}
            className="sm:hidden p-2 rounded hover:bg-[#27272A] text-[#A1A1AA]"
            aria-label="Toggle search"
          >
            <Search className="h-4 w-4 stroke-[1.8]" />
          </button>

          {/* Login */}
          <button
            onClick={onToggleLogin}
            className="flex items-center gap-2 rounded px-4 py-2 text-xs font-bold border border-[#27272A] bg-[#18181B] hover:border-[#2563EB]/50 transition-all focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
            aria-label={isLoggedIn ? "Log out" : "Log in"}
          >
            <User className={`h-4 w-4 stroke-[1.8] ${isLoggedIn ? "text-[#10B981]" : "text-[#2563EB]"}`} />
            <span className="text-white">{isLoggedIn ? "SecOps User" : "Login"}</span>
          </button>
        </div>
      </div>

      {/* Mobile search overlay */}
      {isMobileSearchOpen && (
        <div className="sm:hidden absolute top-[62px] left-0 right-0 border-b border-[#27272A] bg-[#18181B] p-3 z-40">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center text-[#A1A1AA]">
              <Search className="h-4 w-4 stroke-[1.8]" />
            </span>
            <input
              ref={mobileSearchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search playbooks & docs…"
              className="h-9 w-full rounded border border-[#27272A] bg-[#09090B] pl-9 pr-8 text-xs text-white focus:border-[#2563EB] focus:outline-none"
              style={{ paddingLeft: "2.25rem" }}
            />
            <button
              onClick={() => { if (searchQuery) setSearchQuery(""); else setIsMobileSearchOpen(false); }}
              className="absolute inset-y-0 right-2.5 flex items-center text-[#A1A1AA] hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {searchQuery.trim() && (
            <div className="mt-2 rounded border border-[#27272A] bg-[#18181B] p-2 max-h-56 overflow-y-auto">
              {searchResults.length > 0 ? searchResults.map((p) => (
                <Link
                  key={p.id}
                  href={`/playbooks/${p.slug}`}
                  onClick={() => { setIsMobileSearchOpen(false); setSearchQuery(""); }}
                  className="block px-3 py-2 rounded hover:bg-[#27272A] transition-colors"
                >
                  <span className="text-xs font-bold text-[#FAFAFA] block truncate">{p.title}</span>
                  <span className="text-[10px] text-[#A1A1AA] block truncate">{p.description}</span>
                </Link>
              )) : (
                <p className="py-4 text-center text-xs text-[#A1A1AA] font-mono">No results found.</p>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
