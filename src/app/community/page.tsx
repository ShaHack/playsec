"use client";

import { useState, useMemo, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronDown, Send, Check, AlertCircle, HelpCircle,
  CheckCircle, Star, LifeBuoy, Sparkles
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";

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
    answer: "Yes. Submit suggestions or feature requests through the Feedback form. Every submission is reviewed by the PlaySec editorial team." 
  },
  { 
    id: 8,  
    question: "Do I need a PlaySec account?", 
    answer: "Some resources are publicly accessible. Additional platform features, personalized learning, bookmarks, and future premium content require a PlaySec account." 
  },
  { 
    id: 9,  
    question: "How can I contact the PlaySec team?", 
    answer: "Use the Contact Support form in this center. Technical support, security reports, business enquiries, and general feedback are handled directly by our team." 
  },
  { 
    id: 10, 
    question: "Who is PlaySec designed for?", 
    answer: "PlaySec is built for cybersecurity students, SOC analysts, penetration testers, blue team engineers, red team operators, incident responders, security researchers, and IT professionals." 
  }
];

export default function CommunityPage() {
  const { user, isLoggedIn, loginWithGoogle } = useAuth();
  const [faqSearch, setFaqSearch] = useState("");
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);
  
  // Tab State: 'feedback' | 'support'
  const [activeTab, setActiveTab] = useState<"feedback" | "support">("support");

  // Feedback Form State
  const [fbName, setFbName] = useState("");
  const [fbEmail, setFbEmail] = useState("");
  const [fbType, setFbType] = useState<"Suggestion" | "Feature Request" | "General Feedback" | "Compliment">("Suggestion");
  const [fbRating, setFbRating] = useState<number>(5);
  const [fbHoverRating, setFbHoverRating] = useState<number>(0);
  const [fbMessage, setFbMessage] = useState("");

  // Support Form State
  const [spName, setSpName] = useState("");
  const [spEmail, setSpEmail] = useState("");
  const [spSubject, setSpSubject] = useState("");
  const [spPriority, setSpPriority] = useState<"Low" | "Medium" | "High">("Medium");
  const [spMessage, setSpMessage] = useState("");

  // Populate user defaults asynchronously if present
  useEffect(() => {
    if (!user) return;
    const email = user.email || "";
    const name = user.user_metadata?.full_name || "";
    const timer = setTimeout(() => {
      setFbEmail((prev) => prev || email);
      setFbName((prev) => prev || name);
      setSpEmail((prev) => prev || email);
      setSpName((prev) => prev || name);
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  // Status & Loading States
  const [submitting, setSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState("");
  
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

  // Submit Feedback Form
  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessBanner("");

    const msgVal = fbMessage.trim();
    if (!msgVal) {
      setToast({ show: true, msg: "Please enter your feedback message.", type: "error" });
      return;
    }
    if (msgVal.length < 15) {
      setToast({ show: true, msg: "Feedback message must be at least 15 characters long.", type: "error" });
      return;
    }
    if (msgVal.length > 3000) {
      setToast({ show: true, msg: "Feedback message cannot exceed 3000 characters.", type: "error" });
      return;
    }
    if (fbEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fbEmail.trim())) {
      setToast({ show: true, msg: "Please enter a valid email address.", type: "error" });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "feedback",
          name: fbName.trim() || "Anonymous",
          email: fbEmail.trim() || "",
          feedbackType: fbType,
          rating: fbRating,
          message: msgVal,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setToast({ show: true, msg: data.error || "Unable to send your feedback. Please try again.", type: "error" });
        return;
      }

      const okMsg = "Thank you! Your feedback helps us improve PlaySec.";
      setSuccessBanner(okMsg);
      setToast({ show: true, msg: okMsg, type: "success" });
      setFbName("");
      setFbEmail("");
      setFbMessage("");
      setFbRating(5);
    } catch {
      setToast({ show: true, msg: "Unable to send your feedback. Please try again.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Contact Support Form
  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessBanner("");

    const nameVal = spName.trim();
    const emailVal = spEmail.trim();
    const subjectVal = spSubject.trim();
    const messageVal = spMessage.trim();

    if (!nameVal || !emailVal || !subjectVal || !messageVal) {
      setToast({ show: true, msg: "Please fill in all required fields.", type: "error" });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) {
      setToast({ show: true, msg: "Please enter a valid email address.", type: "error" });
      return;
    }
    if (messageVal.length < 15) {
      setToast({ show: true, msg: "Issue description must be at least 15 characters long.", type: "error" });
      return;
    }
    if (messageVal.length > 3000) {
      setToast({ show: true, msg: "Issue description cannot exceed 3000 characters.", type: "error" });
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: "support",
          name: nameVal,
          email: emailVal,
          subject: subjectVal,
          priority: spPriority,
          message: messageVal,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setToast({ show: true, msg: data.error || "Unable to send your support request. Please try again.", type: "error" });
        return;
      }

      const okMsg = "Your support request has been received. Our team will contact you soon.";
      setSuccessBanner(okMsg);
      setToast({ show: true, msg: okMsg, type: "success" });
      setSpName("");
      setSpEmail("");
      setSpSubject("");
      setSpMessage("");
    } catch {
      setToast({ show: true, msg: "Unable to send your support request. Please try again.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 text-[#F3F4F6] relative overflow-hidden select-text bg-[#0B0F14] pb-20 pt-8 min-h-screen">
        
        {/* Grid Background */}
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

        {/* ── HEADER ── */}
        <section className="relative z-10 mx-auto max-w-[1200px] px-6 text-center mb-10">
          <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-3 py-1 rounded mb-4">
            Support Center
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Community Support
          </h1>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-[#A8B3C5] max-w-xl mx-auto">
            Share your ideas, suggestions, or contact the PlaySec team.
          </p>
        </section>

        {/* ── MAIN CONTENT CONTAINER ── */}
        <section className="relative z-10 mx-auto max-w-[1200px] px-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* ── LEFT COLUMN: ENTERPRISE SUPPORT TABS & FORMS ── */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Tab Switcher: 💡 Feedback & 📩 Contact Support */}
              <div className="flex border-b border-[#2A3442] bg-[#141A22] p-1 rounded-t border-t border-x select-none">
                <button
                  type="button"
                  onClick={() => { setActiveTab("feedback"); setSuccessBanner(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "feedback"
                      ? "bg-[#3B82F6] text-white shadow-md"
                      : "text-[#A8B3C5] hover:text-white hover:bg-[#0B0F14]/50"
                  }`}
                >
                  <Sparkles className="h-4 w-4" />
                  <span>💡 Feedback</span>
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveTab("support"); setSuccessBanner(""); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded text-xs font-bold transition-all cursor-pointer ${
                    activeTab === "support"
                      ? "bg-[#3B82F6] text-white shadow-md"
                      : "text-[#A8B3C5] hover:text-white hover:bg-[#0B0F14]/50"
                  }`}
                >
                  <LifeBuoy className="h-4 w-4" />
                  <span>📩 Contact Support</span>
                </button>
              </div>

              {/* Success Banner */}
              {successBanner && (
                <motion.div 
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 rounded border border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981] text-xs font-semibold flex items-center gap-2.5 shadow-sm"
                >
                  <CheckCircle className="h-4.5 w-4.5 shrink-0" />
                  <span>{successBanner}</span>
                </motion.div>
              )}

              {/* ── FORM 1: FEEDBACK ── */}
              {activeTab === "feedback" && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-b border border-[#2A3442] bg-[#141A22] p-6 shadow-sm space-y-5"
                >
                  <div className="pb-3 border-b border-[#2A3442]/60 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-extrabold text-white">Platform Feedback</h2>
                      <p className="text-[11px] text-[#A8B3C5]">Help us shape the future of PlaySec learning tools.</p>
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                      Community Driven
                    </span>
                  </div>

                  <form onSubmit={handleFeedbackSubmit} className="space-y-4">
                    
                    {/* Optional Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Name <span className="text-slate-500 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="text"
                          value={fbName}
                          onChange={(e) => setFbName(e.target.value)}
                          placeholder="e.g. Alex Morgan"
                          className="w-full h-9 px-3 rounded border border-[#2A3442] bg-[#0B0F14] text-xs text-white placeholder:text-slate-600 focus:border-[#3B82F6] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Email Address <span className="text-slate-500 font-normal">(Optional)</span>
                        </label>
                        <input
                          type="email"
                          value={fbEmail}
                          onChange={(e) => setFbEmail(e.target.value)}
                          placeholder="alex@organization.com"
                          className="w-full h-9 px-3 rounded border border-[#2A3442] bg-[#0B0F14] text-xs text-white placeholder:text-slate-600 focus:border-[#3B82F6] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Feedback Type & Rating */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Feedback Type
                        </label>
                        <select
                          value={fbType}
                          onChange={(e) => setFbType(e.target.value as "Suggestion" | "Feature Request" | "General Feedback" | "Compliment")}
                          className="w-full h-9 px-3 rounded border border-[#2A3442] bg-[#0B0F14] text-xs text-white focus:border-[#3B82F6] focus:outline-none cursor-pointer"
                        >
                          <option value="Suggestion">Suggestion</option>
                          <option value="Feature Request">Feature Request</option>
                          <option value="General Feedback">General Feedback</option>
                          <option value="Compliment">Compliment</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          ⭐ Rating (1–5 Stars)
                        </label>
                        <div className="flex items-center gap-1.5 h-9 px-3 rounded border border-[#2A3442] bg-[#0B0F14]">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setFbRating(star)}
                              onMouseEnter={() => setFbHoverRating(star)}
                              onMouseLeave={() => setFbHoverRating(0)}
                              className="p-1 text-slate-400 hover:scale-110 transition-transform cursor-pointer focus:outline-none"
                            >
                              <Star
                                className={`h-4 w-4 ${
                                  (fbHoverRating || fbRating) >= star
                                    ? "fill-amber-400 text-amber-400"
                                    : "text-slate-600"
                                }`}
                              />
                            </button>
                          ))}
                          <span className="ml-auto text-[10px] font-mono text-slate-400">
                            {fbRating}/5
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Message textarea */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Message <span className="text-emerald-400">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={fbMessage}
                        onChange={(e) => setFbMessage(e.target.value)}
                        placeholder="Tell us how we can improve PlaySec..."
                        className="w-full p-3 rounded border border-[#2A3442] bg-[#0B0F14] text-xs text-white placeholder:text-slate-600 focus:border-[#3B82F6] focus:outline-none resize-none"
                      />
                    </div>

                    {!isLoggedIn && (
                      <div className="p-3 rounded border border-[#2A3442] bg-[#0B0F14] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        <span className="text-[#A8B3C5]">Please sign in to submit feedback.</span>
                        <button
                          type="button"
                          onClick={loginWithGoogle}
                          className="px-3.5 py-1.5 rounded bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current shrink-0" aria-hidden="true">
                            <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.437-2.883-6.437-6.438a6.445 6.445 0 016.437-6.437c1.558 0 2.978.557 4.095 1.486L21.2 4.135C19.268 2.502 16.742 1.5 12.24 1.5c-5.79 0-10.5 4.71-10.5 10.5s4.71 10.5 10.5 10.5c5.385 0 10.07-3.793 10.07-10.5 0-.66-.06-1.285-.2-1.715H12.24z"/>
                          </svg>
                          <span>Sign in with Google</span>
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting || !isLoggedIn}
                      className={`w-full h-10 rounded text-xs font-bold text-white transition-all flex items-center justify-center gap-2 select-none ${
                        submitting || !isLoggedIn
                          ? "bg-[#3B82F6]/40 text-slate-500 cursor-not-allowed border border-[#2A3442]"
                          : "bg-[#3B82F6] hover:bg-blue-600 active:scale-[0.99] cursor-pointer"
                      }`}
                    >
                      <Sparkles className={`h-4 w-4 ${submitting ? "animate-spin" : ""}`} />
                      <span>{submitting ? "Submitting Feedback..." : "💡 Submit Feedback"}</span>
                    </button>

                  </form>
                </motion.div>
              )}

              {/* ── FORM 2: CONTACT SUPPORT ── */}
              {activeTab === "support" && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-b border border-[#2A3442] bg-[#141A22] p-6 shadow-sm space-y-5"
                >
                  <div className="pb-3 border-b border-[#2A3442]/60 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-extrabold text-white">Technical Support Request</h2>
                      <p className="text-[11px] text-[#A8B3C5]">Direct assistance from the PlaySec engineering desk.</p>
                    </div>
                    <span className="text-[9px] font-mono uppercase tracking-wider text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded border border-blue-400/20">
                      SLA: 24h Response
                    </span>
                  </div>

                  <form onSubmit={handleSupportSubmit} className="space-y-4">
                    
                    {/* Name & Email */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Name <span className="text-emerald-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={spName}
                          onChange={(e) => setSpName(e.target.value)}
                          placeholder="Jane Doe"
                          className="w-full h-9 px-3 rounded border border-[#2A3442] bg-[#0B0F14] text-xs text-white placeholder:text-slate-600 focus:border-[#3B82F6] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Email Address <span className="text-emerald-400">*</span>
                        </label>
                        <input
                          type="email"
                          required
                          value={spEmail}
                          onChange={(e) => setSpEmail(e.target.value)}
                          placeholder="jane@organization.com"
                          className="w-full h-9 px-3 rounded border border-[#2A3442] bg-[#0B0F14] text-xs text-white placeholder:text-slate-600 focus:border-[#3B82F6] focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Subject & Priority Dropdown */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Subject <span className="text-emerald-400">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={spSubject}
                          onChange={(e) => setSpSubject(e.target.value)}
                          placeholder="Brief summary of support inquiry"
                          className="w-full h-9 px-3 rounded border border-[#2A3442] bg-[#0B0F14] text-xs text-white placeholder:text-slate-600 focus:border-[#3B82F6] focus:outline-none"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Priority
                        </label>
                        <select
                          value={spPriority}
                          onChange={(e) => setSpPriority(e.target.value as "Low" | "Medium" | "High")}
                          className="w-full h-9 px-3 rounded border border-[#2A3442] bg-[#0B0F14] text-xs text-white focus:border-[#3B82F6] focus:outline-none cursor-pointer"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                        </select>
                      </div>
                    </div>

                    {/* Message textarea */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Message <span className="text-emerald-400">*</span>
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={spMessage}
                        onChange={(e) => setSpMessage(e.target.value)}
                        placeholder="Describe your issue in detail..."
                        className="w-full p-3 rounded border border-[#2A3442] bg-[#0B0F14] text-xs text-white placeholder:text-slate-600 focus:border-[#3B82F6] focus:outline-none resize-none"
                      />
                    </div>

                    {!isLoggedIn && (
                      <div className="p-3 rounded border border-[#2A3442] bg-[#0B0F14] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                        <span className="text-[#A8B3C5]">Please sign in to submit support request.</span>
                        <button
                          type="button"
                          onClick={loginWithGoogle}
                          className="px-3.5 py-1.5 rounded bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
                        >
                          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current shrink-0" aria-hidden="true">
                            <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.437-2.883-6.437-6.438a6.445 6.445 0 016.437-6.437c1.558 0 2.978.557 4.095 1.486L21.2 4.135C19.268 2.502 16.742 1.5 12.24 1.5c-5.79 0-10.5 4.71-10.5 10.5s4.71 10.5 10.5 10.5c5.385 0 10.07-3.793 10.07-10.5 0-.66-.06-1.285-.2-1.715H12.24z"/>
                          </svg>
                          <span>Sign in with Google</span>
                        </button>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting || !isLoggedIn}
                      className={`w-full h-10 rounded text-xs font-bold text-white transition-all flex items-center justify-center gap-2 select-none ${
                        submitting || !isLoggedIn
                          ? "bg-[#3B82F6]/40 text-slate-500 cursor-not-allowed border border-[#2A3442]"
                          : "bg-[#3B82F6] hover:bg-blue-600 active:scale-[0.99] cursor-pointer"
                      }`}
                    >
                      <Send className={`h-4 w-4 ${submitting ? "animate-pulse" : ""}`} />
                      <span>{submitting ? "Submitting Request..." : "📩 Contact Support"}</span>
                    </button>

                  </form>
                </motion.div>
              )}

            </div>

            {/* ── RIGHT COLUMN: FAQ ACCORDION ── */}
            <div className="lg:col-span-5 space-y-6">
              
              <div className="rounded border border-[#2A3442] bg-[#141A22] p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[#2A3442]/60 pb-3">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-[#3B82F6]" />
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-white">Frequently Asked Questions</h3>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">10 Q&A</span>
                </div>

                {/* FAQ Search */}
                <div className="relative">
                  <input
                    type="text"
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    placeholder="Search support documentation & FAQs..."
                    className="w-full h-9 pl-3 pr-8 rounded border border-[#2A3442] bg-[#0B0F14] text-xs text-white placeholder:text-slate-500 focus:border-[#3B82F6] focus:outline-none"
                  />
                  {faqSearch && (
                    <button onClick={() => setFaqSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      <X className="h-4.5 w-4.5" />
                    </button>
                  )}
                </div>

                {/* Accordion List */}
                <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                  {filteredFaqs.length > 0 ? (
                    filteredFaqs.map((faq) => {
                      const isExpanded = expandedFaqId === faq.id;
                      return (
                        <div key={faq.id} className="border border-[#2A3442] rounded overflow-hidden">
                          <button
                            onClick={() => setExpandedFaqId(isExpanded ? null : faq.id)}
                            className="w-full flex items-center justify-between px-3.5 py-2.5 text-left bg-[#0B0F14] text-xs font-bold text-slate-200 hover:text-white"
                          >
                            <span>{faq.question}</span>
                            <ChevronDown className={`h-4 w-4 shrink-0 transition-transform duration-150 ${isExpanded ? "rotate-180 text-[#3B82F6]" : "text-slate-400"}`} />
                          </button>
                          
                          <AnimatePresence initial={false}>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="px-3.5 py-2.5 bg-[#141A22]/50 border-t border-[#2A3442]/40 text-xs text-[#A8B3C5] leading-relaxed"
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

            </div>

          </div>

        </section>

      </main>

      <Footer />
    </>
  );
}
