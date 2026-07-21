"use client";

import { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronDown, Send, Check, AlertCircle,
  ShieldCheck, Clock, Lock, Shield,
  BadgeCheck, FileText, BookOpen, Layers, MessageSquare,
} from "lucide-react";

// ─────────────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────────────
interface FAQItem { id: number; question: string; answer: string; }

const FAQ_DATA: FAQItem[] = [
  { id: 1,  question: "What is PlaySec?",                        answer: "PlaySec is a cybersecurity learning platform focused on structured playbooks, practical security knowledge, and guided learning for students and professionals." },
  { id: 2,  question: "Who is PlaySec designed for?",            answer: "PlaySec is designed for beginners, students, SOC analysts, penetration testers, developers, DevSecOps engineers, cloud engineers, and security professionals who want structured cybersecurity learning." },
  { id: 3,  question: "What is a Playbook?",                     answer: "A Playbook is a structured learning guide that explains one cybersecurity topic step-by-step using practical examples, best practices, and real-world scenarios." },
  { id: 4,  question: "Are Playbooks beginner friendly?",        answer: "Yes. Every playbook clearly indicates its difficulty level so learners can choose content appropriate to their experience." },
  { id: 5,  question: "How often is content updated?",           answer: "Content is reviewed and updated whenever important cybersecurity changes, vulnerabilities, or improvements occur to keep information accurate and relevant." },
  { id: 6,  question: "How can I report incorrect information?",  answer: "Use the Contact/Enquiry form on this page. Every report is reviewed before updates are published." },
  { id: 7,  question: "Can I suggest a new Playbook?",           answer: "Yes. Suggestions can be submitted through the Contact/Enquiry form. Every suggestion is reviewed before being considered." },
  { id: 8,  question: "Does PlaySec provide certificates?",      answer: "No. PlaySec focuses on practical cybersecurity knowledge rather than certificates." },
  { id: 9,  question: "Is PlaySec free to use?",                 answer: "Available content can be accessed without unnecessary restrictions. Future access policies will be published transparently if they change." },
  { id: 10, question: "How can I contact PlaySec?",              answer: "Use the enquiry form available on this page. We aim to respond as quickly as possible." },
];

// ─────────────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────────────
export default function Community() {
  const [isLoggedIn,    setIsLoggedIn]    = useState(false);
  const [searchQuery,   setSearchQuery]   = useState("");
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);
  const [formName,      setFormName]      = useState("");
  const [formEmail,     setFormEmail]     = useState("");
  const [formSubject,   setFormSubject]   = useState("");
  const [formMessage,   setFormMessage]   = useState("");
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: "success" | "error" }>({ show: false, msg: "", type: "success" });

  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(() => setToast(p => ({ ...p, show: false })), 4000);
    return () => clearTimeout(t);
  }, [toast.show]);

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return FAQ_DATA;
    return FAQ_DATA.filter(item =>
      item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formSubject.trim() || !formMessage.trim()) {
      setToast({ show: true, msg: "Please fill in all fields before sending.", type: "error" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail)) {
      setToast({ show: true, msg: "Please provide a valid email address.", type: "error" });
      return;
    }
    setToast({ show: true, msg: "Enquiry sent successfully. Our security operations team will respond shortly.", type: "success" });
    setFormName(""); setFormEmail(""); setFormSubject(""); setFormMessage("");
  };

  const handleFaqKeyDown = (e: React.KeyboardEvent, id: number) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setExpandedFaqId(expandedFaqId === id ? null : id); }
    else if (e.key === "Escape") { e.preventDefault(); setExpandedFaqId(null); }
  };

  const scrollToContact = () => {
    document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} onToggleLogin={() => setIsLoggedIn(p => !p)} />

      <main className="flex-1 text-[#FAFAFA] relative overflow-hidden select-text bg-[#09090B]">

        {/* ── BACKGROUND ── */}
        <div className="pointer-events-none fixed inset-0 z-0 bg-[#09090B]" />
        <div className="pointer-events-none fixed inset-0 z-0" style={{ opacity: 0.015, backgroundImage: "linear-gradient(#27272A 1px, transparent 1px), linear-gradient(90deg, #27272A 1px, transparent 1px)", backgroundSize: "56px 56px" }} />

        {/* ── TOAST ───────────────────────────────────── */}
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.15 }}
              className={`fixed top-16 right-5 z-[60] flex items-start gap-3 px-4 py-3 rounded border shadow-xl max-w-sm select-none backdrop-blur-md text-xs font-semibold ${
                toast.type === "success"
                  ? "bg-[#18181B] border-[#10B981]/50 text-[#10B981]"
                  : "bg-[#18181B] border-[#EF4444]/50 text-[#EF4444]"
              }`}
            >
              {toast.type === "success" ? <Check className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
              <span className="leading-snug text-[#FAFAFA]">{toast.msg}</span>
              <button onClick={() => setToast(p => ({ ...p, show: false }))} className="ml-auto text-slate-400 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════════ */}
        {/* 1. HERO — Compact & Clean                    */}
        {/* ════════════════════════════════════════════ */}
        <section className="relative z-10 border-b border-[#27272A] bg-[#18181B]/40">
          <div className="mx-auto max-w-[1380px] px-6 lg:px-10 py-5 sm:py-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Shield className="h-3.5 w-3.5 text-[#A1A1AA] shrink-0" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#A1A1AA]">
                    PlaySec Support Hub
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/20 px-2 py-0.5 rounded">
                    ✓ Verified Content
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white">
                  Knowledge Base &amp; Support
                </h1>
                <p className="mt-0.5 text-xs sm:text-[13px] text-[#A1A1AA] max-w-xl leading-relaxed">
                  Browse official documentation, platform guidance, and verified security articles.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <button
                  onClick={scrollToContact}
                  className="h-8 px-3 rounded border border-[#27272A] bg-[#18181B] text-xs font-semibold text-[#FAFAFA] hover:border-[#2563EB] hover:text-white transition-all select-none"
                >
                  Contact Support
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════ */}
        {/* 2. KNOWLEDGE BASE + FAQ — Clean Grid         */}
        {/* ════════════════════════════════════════════ */}
        <section className="relative z-10 border-b border-[#27272A]">
          <div className="mx-auto max-w-[1380px] px-6 lg:px-10 py-5 sm:py-6">
            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 lg:gap-8 items-start">

              {/* ── LEFT PANEL: Knowledge Base Info Card ── */}
              <aside className="space-y-4 lg:sticky lg:top-20">
                <div className="rounded border border-[#27272A] bg-[#18181B] p-4 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="h-4 w-4 text-[#A1A1AA]" />
                    <h2 className="text-xs font-bold text-white uppercase tracking-wider">Knowledge Base</h2>
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed mb-3">
                    Search documentation articles using the search input at the top-right of the navigation bar.
                  </p>

                  <div className="border-t border-[#27272A] pt-3 mb-3 space-y-2">
                    {[
                      { icon: <FileText className="h-3.5 w-3.5 text-[#A1A1AA]" />, label: "Documentation" },
                      { icon: <Layers className="h-3.5 w-3.5 text-[#A1A1AA]" />, label: "Platform Guides" },
                      { icon: <Shield className="h-3.5 w-3.5 text-[#A1A1AA]" />, label: "Playbooks" },
                      { icon: <MessageSquare className="h-3.5 w-3.5 text-[#A1A1AA]" />, label: "Community Articles" },
                      { icon: <BadgeCheck className="h-3.5 w-3.5 text-[#10B981]" />, label: "Verified Security Resources" },
                    ].map(({ icon, label }) => (
                      <div key={label} className="flex items-center gap-2.5 text-xs text-[#FAFAFA]">
                        {icon}
                        <span>{label}</span>
                      </div>
                    ))}
                  </div>

                  {/* Summary badges */}
                  <div className="border-t border-[#27272A] pt-3 flex flex-wrap gap-1.5 text-[9px] font-bold text-[#A1A1AA]">
                    <span className="px-2 py-0.5 rounded border border-[#27272A] bg-[#09090B]">10 Articles</span>
                    <span className="px-2 py-0.5 rounded border border-[#27272A] bg-[#09090B]">Updated Weekly</span>
                  </div>
                </div>
              </aside>

              {/* ── RIGHT PANEL: FAQ Accordion (Tighter rows, less padding) ── */}
              <div>
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#27272A]">
                  <h3 className="text-sm font-bold text-[#FAFAFA] uppercase tracking-wider">Frequently Asked Questions</h3>
                  <span className="text-[10px] font-mono text-[#A1A1AA] bg-[#18181B] border border-[#27272A] px-2 py-0.5 rounded">
                    {filteredFaqs.length} Articles
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  {filteredFaqs.length > 0 ? (
                    <div className="space-y-1.5">
                      {filteredFaqs.map((item) => {
                        const isExpanded = expandedFaqId === item.id;
                        return (
                          <div
                            key={item.id}
                            className={`rounded border transition-all duration-150 overflow-hidden ${
                              isExpanded
                                ? "border-[#27272A] bg-[#09090B]"
                                : "border-[#27272A] bg-[#18181B] hover:border-slate-500"
                            }`}
                          >
                            <button
                              onClick={() => setExpandedFaqId(isExpanded ? null : item.id)}
                              onKeyDown={(e) => handleFaqKeyDown(e, item.id)}
                              aria-expanded={isExpanded}
                              className="w-full flex items-center justify-between px-4 py-2.5 text-left focus:outline-none select-none group"
                            >
                              <span className={`text-[13px] font-semibold transition-colors ${isExpanded ? "text-white" : "text-slate-200 group-hover:text-white"}`}>
                                {item.question}
                              </span>
                              <ChevronDown
                                className={`h-3.5 w-3.5 transition-transform duration-200 shrink-0 ml-4 ${isExpanded ? "rotate-180 text-[#2563EB]" : "text-[#A1A1AA]"}`}
                              />
                            </button>

                            <AnimatePresence initial={false}>
                              {isExpanded && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  transition={{ duration: 0.15, ease: "easeInOut" }}
                                >
                                  <div className="px-4 pb-3 pt-0.5 text-xs sm:text-[13px] text-[#A1A1AA] leading-relaxed border-t border-[#27272A]/40">
                                    <p>{item.answer}</p>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="py-8 text-center text-xs text-[#A1A1AA] border border-dashed border-[#27272A] rounded bg-[#18181B]">
                      No matching FAQ entries found.
                    </div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          </div>
        </section>

        {/* ════════════════════════════════════════════ */}
        {/* 3. CONTACT — Clean support ticket layout     */}
        {/* ════════════════════════════════════════════ */}
        <section id="contact-section" className="relative z-10">
          <div className="mx-auto max-w-[1380px] px-6 lg:px-10 py-5 sm:py-6">

            <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6 lg:gap-8 items-start">

              {/* Left Column: Trust labels */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Support Ticketing</h3>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed mt-1">
                    Submit issues, request platform corrections, or send specific queries. Requests are queued immediately.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {[
                    { icon: <Lock className="h-4 w-4 text-[#10B981]" />, title: "Encrypted Submission" },
                    { icon: <Clock className="h-4 w-4 text-[#2563EB]" />, title: "Response within 24 Hours" },
                    { icon: <ShieldCheck className="h-4 w-4 text-[#2563EB]" />, title: "Security Team Reviewed" },
                    { icon: <BadgeCheck className="h-4 w-4 text-[#10B981]" />, title: "Confidential" },
                  ].map(({ icon, title }) => (
                    <div key={title} className="flex items-center gap-2 text-xs text-slate-300">
                      <span className="shrink-0">{icon}</span>
                      <span>{title}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: Ticket Form (Flat layout, radius 8px, #27272A borders) */}
              <div className="rounded border border-[#27272A] bg-[#18181B] shadow-sm overflow-hidden">
                <div className="px-4 py-2.5 border-b border-[#27272A] bg-[#18181B] flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">New Support Ticket</span>
                  <span className="text-[10px] font-mono text-slate-400">STATUS: ACTIVE</span>
                </div>

                <form onSubmit={handleFormSubmit} className="p-4 sm:p-5 space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="name-input" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Name</label>
                      <input
                        id="name-input" type="text" value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full h-8 px-2.5 rounded border border-[#27272A] bg-[#09090B] text-xs text-white placeholder:text-slate-600 focus:border-[#2563EB] focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="email-input" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                      <input
                        id="email-input" type="text" value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="jane@organization.com"
                        className="w-full h-8 px-2.5 rounded border border-[#27272A] bg-[#09090B] text-xs text-white placeholder:text-slate-600 focus:border-[#2563EB] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="subject-input" className="block text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">Subject</label>
                    <input
                      id="subject-input" type="text" value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      placeholder="Enter support issue summary"
                      className="w-full h-8 px-2.5 rounded border border-[#27272A] bg-[#09090B] text-xs text-white placeholder:text-slate-600 focus:border-[#2563EB] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="message-input" className="block text-[10px] font-bold uppercase tracking-wider text-[#A1A1AA]">Message Description</label>
                    <textarea
                      id="message-input" value={formMessage} rows={4}
                      onChange={(e) => setFormMessage(e.target.value)}
                      placeholder="Provide full description of your support request..."
                      className="w-full p-2.5 rounded border border-[#27272A] bg-[#09090B] text-xs text-white placeholder:text-slate-600 focus:border-[#2563EB] focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500 font-mono">
                      SECURE TICKET LINK ENABLED
                    </span>
                    <button
                      type="submit"
                      className="h-8 px-4 rounded bg-[#2563EB] text-xs font-bold text-white hover:bg-blue-600 active:scale-[0.99] transition-all flex items-center gap-1.5 select-none"
                    >
                      <Send className="h-3.5 w-3.5" />
                      Submit Ticket
                    </button>
                  </div>
                </form>
              </div>

            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}
