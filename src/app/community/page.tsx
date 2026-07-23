"use client";

import { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronDown, Send, Check, AlertCircle, HelpCircle,
  Mail, Clock, ShieldAlert, BookOpen, FileText, CheckCircle
} from "lucide-react";

interface FAQItem { id: number; question: string; answer: string; }

const FAQ_DATA: FAQItem[] = [
  { 
    id: 1,  
    question: "What is PlaySec?", 
    answer: "PlaySec is a structured cybersecurity learning platform that combines expert-reviewed audio briefings, downloadable security resources, and practical documentation for students and security professionals." 
  },
  { 
    id: 2,  
    question: "What is the difference between Audio Playbooks and the Library?", 
    answer: "Audio Playbooks provide narrated cybersecurity briefings for listening, while the Library contains downloadable PDFs, cheat sheets, hardening guides, reference material, and technical documentation." 
  },
  { 
    id: 3,  
    question: "What topics are available in PlaySec?", 
    answer: "PlaySec includes Offensive Security, Defensive Security, Web Security, Network Security, Cloud Security, Active Directory, Digital Forensics, Incident Response, Threat Hunting, Malware Analysis, Secure Coding, OSINT, and AI Security." 
  },
  { 
    id: 4,  
    question: "Are PlaySec resources reviewed before publishing?", 
    answer: "Yes. Every Audio Playbook and Library document is technically reviewed, verified for accuracy, and updated before publication." 
  },
  { 
    id: 5,  
    question: "How often is PlaySec updated?", 
    answer: "New audio briefings and Library resources are added regularly. Existing content is revised whenever security techniques, tools, or best practices change." 
  },
  { 
    id: 6,  
    question: "Can I download every resource?", 
    answer: "Library documents are downloadable where permitted. Audio Playbooks are designed primarily for secure online streaming through the PlaySec platform." 
  },
  { 
    id: 7,  
    question: "Can I suggest new topics or report incorrect information?", 
    answer: "Yes. Submit suggestions, corrections, or content feedback through the Contact page. Every submission is reviewed by the PlaySec editorial team." 
  },
  { 
    id: 8,  
    question: "Do I need a PlaySec account?", 
    answer: "Some resources are publicly accessible. Additional platform features, personalized learning, bookmarks, and future premium content require a PlaySec account." 
  },
  { 
    id: 9,  
    question: "How can I contact the PlaySec team?", 
    answer: "Use the Contact page or the official PlaySec support email. Technical support, security reports, business enquiries, and general feedback are handled through email only." 
  },
  { 
    id: 10, 
    question: "Who is PlaySec designed for?", 
    answer: "PlaySec is built for cybersecurity students, SOC analysts, penetration testers, blue team engineers, red team operators, incident responders, security researchers, and IT professionals seeking structured security education." 
  }
];

export default function CommunityPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [faqSearch, setFaqSearch] = useState("");
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);
  
  // Support & Feedback Form State
  const [formType, setFormType] = useState<"Feedback" | "Support">("Support");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formSubject, setFormSubject] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [statusSuccessMsg, setStatusSuccessMsg] = useState("");
  
  const [toast, setToast] = useState<{ show: boolean; msg: string; type: "success" | "error" }>({
    show: false,
    msg: "",
    type: "success",
  });

  useEffect(() => {
    if (!toast.show) return;
    const t = setTimeout(() => setToast(p => ({ ...p, show: false })), 4000);
    return () => clearTimeout(t);
  }, [toast.show]);

  const filteredFaqs = useMemo(() => {
    const q = faqSearch.trim().toLowerCase();
    if (!q) return FAQ_DATA;
    return FAQ_DATA.filter(
      (item) =>
        item.question.toLowerCase().includes(q) || item.answer.toLowerCase().includes(q)
    );
  }, [faqSearch]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusSuccessMsg("");

    const nameVal = formName.trim();
    const emailVal = formEmail.trim();
    const subjectVal = formSubject.trim();
    const messageVal = formMessage.trim();

    if (!nameVal || !emailVal || !subjectVal || !messageVal) {
      setToast({ show: true, msg: "Please fill in all required fields.", type: "error" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      setToast({ show: true, msg: "Please enter a valid email address.", type: "error" });
      return;
    }
    if (messageVal.length < 15) {
      setToast({ show: true, msg: "Message must be at least 15 characters long.", type: "error" });
      return;
    }
    if (messageVal.length > 3000) {
      setToast({ show: true, msg: "Message must not exceed 3000 characters.", type: "error" });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formType,
          name: formName.trim(),
          email: formEmail.trim(),
          subject: formSubject.trim(),
          message: formMessage.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setToast({ show: true, msg: data.error || "Unable to send your message. Please try again.", type: "error" });
        return;
      }

      const successText = "Your message has been sent successfully.";
      setStatusSuccessMsg(successText);
      setToast({
        show: true,
        msg: successText,
        type: "success",
      });
      setFormName("");
      setFormEmail("");
      setFormSubject("");
      setFormMessage("");
    } catch (err) {
      setToast({ show: true, msg: "Unable to send your message. Please try again.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar isLoggedIn={isLoggedIn} onToggleLogin={() => setIsLoggedIn((p) => !p)} />

      <main className="flex-1 text-[#F3F4F6] relative overflow-hidden select-text bg-[#0B0F14] pb-16 pt-8">
        
        {/* Subtle grid background */}
        <div className="pointer-events-none fixed inset-0 z-0 bg-[#0B0F14]" />
        <div className="pointer-events-none fixed inset-0 z-0"
          style={{
            opacity: 0.012,
            backgroundImage: "linear-gradient(#2A3442 1px, transparent 1px), linear-gradient(90deg, #2A3442 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }} />

        {/* Toast Alert */}
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className={`fixed top-16 right-5 z-[60] flex items-start gap-3 px-4 py-3 rounded border shadow-xl max-w-sm select-none backdrop-blur-md text-xs font-semibold ${
                toast.type === "success"
                  ? "bg-[#141A22] border-[#10B981]/50 text-[#10B981]"
                  : "bg-[#141A22] border-[#EF4444]/50 text-[#EF4444]"
              }`}
            >
              {toast.type === "success" ? <Check className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
              <span className="leading-snug text-[#F3F4F6]">{toast.msg}</span>
              <button onClick={() => setToast((p) => ({ ...p, show: false }))} className="ml-auto text-slate-400 hover:text-white">
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ════════════════════════════════════════════ */}
        {/* TWO-COLUMN ENTERPRISE LAYOUT                 */}
        {/* ════════════════════════════════════════════ */}
        <section className="relative z-10 mx-auto max-w-[1380px] px-6 lg:px-10 mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
            
            {/* ── LEFT COLUMN (span 5): Hero, Support Card, FAQ quick links ── */}
            <div className="lg:col-span-5 space-y-8 text-left">
              
              {/* Left Aligned Community Hero */}
              <div className="space-y-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-3 py-1 rounded">
                  PlaySec Support Center
                </span>
                <h1 className="text-3xl font-extrabold text-white tracking-tight leading-tight uppercase">
                  PLAYSEC COMMUNITY
                </h1>
                <h2 className="text-sm font-semibold text-slate-200 leading-normal">
                  Professional support and documentation assistance for PlaySec users.
                </h2>
                <p className="text-xs sm:text-[13px] text-[#A8B3C5] leading-relaxed">
                  Need help with Playbooks, Library resources, account issues or feedback? Contact our team directly by email.
                </p>
                
                <div className="flex gap-3 pt-2 select-none">
                  <button 
                    onClick={() => document.getElementById("ticket-form")?.scrollIntoView({ behavior: "smooth" })}
                    className="h-8 px-4 rounded bg-[#3B82F6] hover:bg-blue-600 text-xs font-bold text-white transition-all"
                  >
                    Contact Support
                  </button>
                  <button 
                    onClick={() => document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" })}
                    className="h-8 px-4 rounded border border-[#2A3442] bg-[#141A22] hover:border-slate-500 text-xs font-bold text-white transition-all"
                  >
                    View FAQs
                  </button>
                </div>
              </div>

              {/* Support Card (From Contact page) */}
              <div className="rounded border border-[#2A3442] bg-[#141A22] p-5 space-y-4 shadow-sm">
                <div className="flex items-center gap-2 pb-2 border-b border-[#2A3442]">
                  <Mail className="h-4 w-4 text-[#3B82F6]" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">Helpdesk Channels</h3>
                </div>
                
                <div className="space-y-3.5 text-xs">
                  <div>
                    <span className="block text-[9px] font-bold uppercase text-slate-500">Technical Support</span>
                    <a href="mailto:support@playsec.io" className="text-xs font-mono text-[#3B82F6] hover:underline">support@playsec.io</a>
                    <span className="block text-[9px] text-[#A8B3C5] mt-0.5">Response SLA: 24-48 Hours</span>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase text-slate-500">Security Reports</span>
                    <a href="mailto:security@playsec.io" className="text-xs font-mono text-[#3B82F6] hover:underline">security@playsec.io</a>
                  </div>
                  <div>
                    <span className="block text-[9px] font-bold uppercase text-slate-500">Business Enquiries</span>
                    <a href="mailto:business@playsec.io" className="text-xs font-mono text-[#3B82F6] hover:underline">business@playsec.io</a>
                  </div>
                </div>
              </div>

              {/* FAQ Quick Links */}
              <div className="rounded border border-[#2A3442] bg-[#141A22] p-5 shadow-sm space-y-3">
                <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-[#2A3442] pb-1.5">FAQ Shortcuts</span>
                <div className="space-y-2 text-xs">
                  {FAQ_DATA.slice(0, 3).map((faq) => (
                    <button
                      key={faq.id}
                      onClick={() => {
                        setExpandedFaqId(faq.id);
                        document.getElementById("faq-section")?.scrollIntoView({ behavior: "smooth" });
                      }}
                      className="w-full text-left text-[#A8B3C5] hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <span className="text-[#3B82F6]">•</span>
                      <span className="truncate">{faq.question}</span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* ── RIGHT COLUMN (span 7): FAQ Search, 10 FAQ Accordion, Ticket Form ── */}
            <div id="faq-section" className="lg:col-span-7 space-y-8">
              
              {/* FAQ Section */}
              <div className="rounded border border-[#2A3442] bg-[#141A22] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-[#2A3442]">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">Frequently Asked Questions</h3>
                  <HelpCircle className="h-4.5 w-4.5 text-[#3B82F6]" />
                </div>

                {/* FAQ Search */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    placeholder="Search FAQs..."
                    className="w-full h-9 pl-3 pr-8 rounded border border-[#2A3442] bg-[#0B0F14] text-xs text-white placeholder:text-slate-500 focus:border-[#3B82F6] focus:outline-none"
                  />
                  {faqSearch && (
                    <button onClick={() => setFaqSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      <X className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>

                {/* Accordion List (one open at a time) */}
                <div className="space-y-2">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq) => {
                      const isExpanded = expandedFaqId === faq.id;
                      return (
                        <div key={faq.id} className="border border-[#2A3442] rounded overflow-hidden">
                          <button
                            onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                            className="w-full flex items-center justify-between px-4 py-2.5 text-left bg-[#0B0F14] text-xs font-bold text-slate-200 hover:text-white"
                          >
                            <span>{faq.question}</span>
                            <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${isExpanded ? "rotate-180 text-[#3B82F6]" : "text-slate-400"}`} />
                          </button>
                          
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="px-4 py-3 bg-[#141A22]/50 border-t border-[#2A3442]/40 text-xs text-[#A8B3C5] leading-relaxed"
                              >
                                {faq.answer}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-6 text-xs text-[#A8B3C5]">No matching FAQs found.</div>
                  )}
                </div>
              </div>

              {/* Support & Feedback Ticket Form */}
              <div id="ticket-form" className="rounded border border-[#2A3442] bg-[#141A22] shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-[#2A3442] bg-[#141A22] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setFormType("Support")}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        formType === "Support"
                          ? "bg-[#3B82F6] text-white"
                          : "bg-[#0B0F14] text-[#A8B3C5] hover:text-white border border-[#2A3442]"
                      }`}
                    >
                      Contact Support
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormType("Feedback")}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                        formType === "Feedback"
                          ? "bg-[#3B82F6] text-white"
                          : "bg-[#0B0F14] text-[#A8B3C5] hover:text-white border border-[#2A3442]"
                      }`}
                    >
                      Feedback
                    </button>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">STATUS: ACTIVE</span>
                </div>

                <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
                  {statusSuccessMsg && (
                    <div className="p-3 rounded border border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981] text-xs font-semibold flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 shrink-0" />
                      <span>{statusSuccessMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label htmlFor="name-field" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Name</label>
                      <input
                        id="name-field"
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full h-9 px-3 rounded border border-[#2A3442] bg-[#0B0F14] text-xs text-white placeholder:text-slate-650 focus:border-[#3B82F6] focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="email-field" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                      <input
                        id="email-field"
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="jane@organization.com"
                        className="w-full h-9 px-3 rounded border border-[#2A3442] bg-[#0B0F14] text-xs text-white placeholder:text-slate-650 focus:border-[#3B82F6] focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="subject-field" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Subject</label>
                    <input
                      id="subject-field"
                      type="text"
                      required
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      placeholder={formType === "Feedback" ? "Enter your platform feedback subject" : "Enter support issue summary"}
                      className="w-full h-9 px-3 rounded border border-[#2A3442] bg-[#0B0F14] text-xs text-white placeholder:text-slate-650 focus:border-[#3B82F6] focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="desc-field" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Message Description</label>
                    <textarea
                      id="desc-field"
                      required
                      value={formMessage}
                      rows={4}
                      onChange={(e) => setFormMessage(e.target.value)}
                      placeholder={formType === "Feedback" ? "Provide detailed feedback about PlaySec features..." : "Provide full description of your support request..."}
                      className="w-full p-3 rounded border border-[#2A3442] bg-[#0B0F14] text-xs text-white placeholder:text-slate-650 focus:border-[#3B82F6] focus:outline-none resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full h-9 rounded text-xs font-bold text-white transition-all flex items-center justify-center gap-1.5 select-none ${
                      submitting
                        ? "bg-[#3B82F6]/60 cursor-not-allowed"
                        : "bg-[#3B82F6] hover:bg-blue-600 active:scale-[0.99] cursor-pointer"
                    }`}
                  >
                    <Send className={`h-4 w-4 ${submitting ? "animate-pulse" : ""}`} />
                    {submitting ? "Sending message..." : `Submit ${formType}`}
                  </button>
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
