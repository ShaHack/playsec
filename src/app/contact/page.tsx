"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Clock, Send, ShieldCheck, Check, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ContactPage() {
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
          formType: "Support",
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
    } catch {
      setToast({ show: true, msg: "Unable to send your message. Please try again.", type: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <main className="flex-1 select-text bg-[#0B0F14] text-[#F3F4F6] min-h-screen">
        
        {/* Toast Notification */}
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.15 }}
              className={`fixed top-16 right-5 z-[60] flex items-start gap-3 px-4 py-3 rounded border shadow-xl max-w-sm select-none backdrop-blur-md text-xs font-semibold ${
                toast.type === "success"
                  ? "bg-[#141A22] border-[#10B981]/50 text-[#10B981]"
                  : "bg-[#141A22] border-[#EF4444]/50 text-[#EF4444]"
              }`}
            >
              {toast.type === "success" ? <Check className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
              <span className="leading-snug text-[#F3F4F6]">{toast.msg}</span>
              <button onClick={() => setToast((p) => ({ ...p, show: false }))} className="ml-auto text-slate-400 hover:text-white">
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <section className="relative w-full border-b border-[#2A3442] py-16 bg-[#121214]">
          <div className="pointer-events-none absolute inset-0 z-0"
            style={{
              opacity: 0.012,
              backgroundImage: "linear-gradient(#2A3442 1px, transparent 1px), linear-gradient(90deg, #2A3442 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }} />

          <div className="relative z-10 mx-auto max-w-[960px] px-6 text-center">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#3B82F6] bg-[#3B82F6]/10 border border-[#3B82F6]/20 px-3 py-1 rounded mb-6">
              Contact PlaySec
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Contact PlaySec
            </h1>
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#A8B3C5] max-w-2xl mx-auto">
              Need help, found a bug, or want to collaborate? Get in touch.
            </p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-12 mx-auto max-w-[1380px] px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Contact Cards */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Emails */}
              <div className="rounded border border-[#2A3442] bg-[#141A22] p-5 space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-[#2A3442]">
                  <Mail className="h-4 w-4 text-[#3B82F6]" />
                  <h2 className="text-xs font-bold text-white uppercase tracking-wider">Email Channels</h2>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-500">Support Desk</span>
                    <a href="mailto:support@playsec.io" className="text-xs font-mono text-[#F3F4F6] hover:text-[#3B82F6] transition-colors">support@playsec.io</a>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-500">Business &amp; Partnerships</span>
                    <a href="mailto:business@playsec.io" className="text-xs font-mono text-[#F3F4F6] hover:text-[#3B82F6] transition-colors">business@playsec.io</a>
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-slate-500">Security Reports</span>
                    <a href="mailto:security@playsec.io" className="text-xs font-mono text-[#F3F4F6] hover:text-[#3B82F6] transition-colors">security@playsec.io</a>
                  </div>
                </div>
              </div>

              {/* Response SLA */}
              <div className="rounded border border-[#2A3442] bg-[#141A22] p-4 flex items-center gap-3">
                <Clock className="h-5 w-5 text-[#3B82F6] shrink-0" />
                <div>
                  <span className="block text-[10px] font-bold uppercase text-slate-500">Response SLA</span>
                  <span className="text-xs text-[#F3F4F6] font-medium">Typically within 24–48 hours</span>
                </div>
              </div>

            </div>

            {/* Right Column: Ticket / Enquiry Form */}
            <div className="lg:col-span-7">
              <div className="rounded border border-[#2A3442] bg-[#141A22] shadow-sm overflow-hidden">
                <div className="px-5 py-3 border-b border-[#2A3442] bg-[#141A22] flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">New Support Ticket</span>
                  <span className="text-[10px] font-mono text-slate-400">STATUS: ACTIVE</span>
                </div>                <form onSubmit={handleFormSubmit} className="p-4 space-y-4">
                  {statusSuccessMsg && (
                    <div className="p-3 rounded border border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981] text-xs font-semibold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                      <span>{statusSuccessMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="name-input" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Name</label>
                      <input
                        id="name-input"
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full h-8 px-2.5 rounded border border-[#2A3442] bg-[#0B0F14] text-xs text-white placeholder:text-slate-650 focus:border-[#3B82F6] focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="email-input" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Email Address</label>
                      <input
                        id="email-input"
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="jane@organization.com"
                        className="w-full h-8 px-2.5 rounded border border-[#2A3442] bg-[#0B0F14] text-xs text-white placeholder:text-slate-650 focus:border-[#3B82F6] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="subject-input" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Subject</label>
                    <input
                      id="subject-input"
                      type="text"
                      required
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      placeholder="Enter support issue summary"
                      className="w-full h-8 px-2.5 rounded border border-[#2A3442] bg-[#0B0F14] text-xs text-white placeholder:text-slate-650 focus:border-[#3B82F6] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="message-input" className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Message</label>
                    <textarea
                      id="message-input"
                      required
                      value={formMessage}
                      rows={5}
                      onChange={(e) => setFormMessage(e.target.value)}
                      placeholder="Describe your inquiry in detail..."
                      className="w-full p-2.5 rounded border border-[#2A3442] bg-[#0B0F14] text-xs text-white placeholder:text-slate-650 focus:border-[#3B82F6] focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500 font-mono">
                      SECURE CHANNEL ACTIVE
                    </span>
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`h-8 px-4 rounded text-xs font-bold text-white transition-all flex items-center gap-1.5 select-none ${
                        submitting
                          ? "bg-[#3B82F6]/60 cursor-not-allowed"
                          : "bg-[#3B82F6] hover:bg-blue-600 active:scale-[0.99] cursor-pointer"
                      }`}
                    >
                      <Send className={`h-3.5 w-3.5 ${submitting ? "animate-pulse" : ""}`} />
                      {submitting ? "Sending..." : "Submit Ticket"}
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

const XIcon = X;
