"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, Clock, Send, ShieldCheck, Check, AlertCircle, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export default function ContactPage() {
  const { user, isLoggedIn, loginWithGoogle } = useAuth();
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
    if (!user) return;
    const email = user.email || "";
    const name = user.user_metadata?.full_name || "";
    const timer = setTimeout(() => {
      setFormEmail((prev) => prev || email);
      setFormName((prev) => prev || name);
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

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

      <main className="flex-1 select-text bg-[#F5F8FA] text-[#17232D] min-h-screen">
        
        {/* Toast Notification */}
        <AnimatePresence>
          {toast.show && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.15 }}
              className={`fixed top-16 right-5 z-[60] flex items-start gap-3 px-4 py-3 rounded border shadow-md max-w-sm select-none text-xs font-semibold ${
                toast.type === "success"
                  ? "bg-white border-[#C4E4D9] text-[#3D8B72]"
                  : "bg-white border-[#F5D3D3] text-[#C95757]"
              }`}
            >
              {toast.type === "success" ? <Check className="h-4 w-4 shrink-0 mt-0.5" /> : <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />}
              <span className="leading-snug text-[#17232D]">{toast.msg}</span>
              <button onClick={() => setToast((p) => ({ ...p, show: false }))} className="ml-auto text-[#60717D] hover:text-[#17232D]">
                <XIcon className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hero Section */}
        <section className="relative w-full border-b border-[#D9E4EA] py-16 bg-white">
          <div className="pointer-events-none absolute inset-0 z-0"
            style={{
              opacity: 0.4,
              backgroundImage: "linear-gradient(var(--color-border-color, #D9E4EA) 1px, transparent 1px), linear-gradient(90deg, var(--color-border-color, #D9E4EA) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }} />

          <div className="relative z-10 mx-auto max-w-[960px] px-6 text-center">
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#173B57] bg-[#E9F1F5] border border-[#D9E4EA] px-3 py-1 rounded mb-6">
              Contact PlaySec
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#17232D] leading-tight">
              Contact PlaySec
            </h1>
            <p className="mt-6 text-base sm:text-lg leading-relaxed text-[#60717D] max-w-2xl mx-auto">
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
              <div className="rounded border border-[#D9E4EA] bg-white p-5 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 pb-2 border-b border-[#D9E4EA]">
                  <Mail className="h-4 w-4 text-[#4FAFC1]" />
                  <h2 className="text-xs font-bold text-[#17232D] uppercase tracking-wider">Email Channels</h2>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-[#60717D]">PlaySec Support Team</span>
                    <a href="mailto:playsec.platform@gmail.com" className="text-xs font-mono text-[#173B57] hover:text-[#4FAFC1] transition-colors">playsec.platform@gmail.com</a>
                  </div>
                </div>
              </div>

              {/* Response SLA */}
              <div className="rounded border border-[#D9E4EA] bg-white p-4 flex items-center gap-3 shadow-xs">
                <Clock className="h-5 w-5 text-[#4FAFC1] shrink-0" />
                <div>
                  <span className="block text-[10px] font-bold uppercase text-[#60717D]">Response SLA</span>
                  <span className="text-xs text-[#17232D] font-medium">Typically within 24–48 hours</span>
                </div>
              </div>

            </div>

            {/* Right Column: Ticket / Enquiry Form */}
            <div className="lg:col-span-7">
              <div className="rounded border border-[#D9E4EA] bg-white shadow-xs overflow-hidden">
                <div className="px-5 py-3 border-b border-[#D9E4EA] bg-[#F5F8FA] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#17232D] uppercase tracking-wider">New Support Ticket</span>
                  <span className="text-[10px] font-mono text-[#4FAFC1] font-bold">STATUS: ACTIVE</span>
                </div>
                <form onSubmit={handleFormSubmit} className="p-4 space-y-4">
                  {statusSuccessMsg && (
                    <div className="p-3 rounded border border-[#C4E4D9] bg-[#E8F4F0] text-[#3D8B72] text-xs font-semibold flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 shrink-0" />
                      <span>{statusSuccessMsg}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label htmlFor="name-input" className="block text-[10px] font-bold uppercase tracking-wider text-[#60717D]">Name</label>
                      <input
                        id="name-input"
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="Jane Doe"
                        className="w-full h-8 px-2.5 rounded border border-[#D9E4EA] bg-white text-xs text-[#17232D] placeholder:text-[#8193A0] focus:border-[#4FAFC1] focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="space-y-1">
                      <label htmlFor="email-input" className="block text-[10px] font-bold uppercase tracking-wider text-[#60717D]">Email Address</label>
                      <input
                        id="email-input"
                        type="email"
                        required
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="jane@organization.com"
                        className="w-full h-8 px-2.5 rounded border border-[#D9E4EA] bg-white text-xs text-[#17232D] placeholder:text-[#8193A0] focus:border-[#4FAFC1] focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="subject-input" className="block text-[10px] font-bold uppercase tracking-wider text-[#60717D]">Subject</label>
                    <input
                      id="subject-input"
                      type="text"
                      required
                      value={formSubject}
                      onChange={(e) => setFormSubject(e.target.value)}
                      placeholder="Enter support issue summary"
                      className="w-full h-8 px-2.5 rounded border border-[#D9E4EA] bg-white text-xs text-[#17232D] placeholder:text-[#8193A0] focus:border-[#4FAFC1] focus:outline-none transition-colors"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="message-input" className="block text-[10px] font-bold uppercase tracking-wider text-[#60717D]">Message</label>
                    <textarea
                      id="message-input"
                      required
                      value={formMessage}
                      rows={5}
                      onChange={(e) => setFormMessage(e.target.value)}
                      placeholder="Describe your inquiry in detail..."
                      className="w-full p-2.5 rounded border border-[#D9E4EA] bg-white text-xs text-[#17232D] placeholder:text-[#8193A0] focus:border-[#4FAFC1] focus:outline-none transition-colors resize-none"
                    />
                  </div>

                  {!isLoggedIn && (
                    <div className="p-3 rounded border border-[#D9E4EA] bg-[#F5F8FA] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                      <span className="text-[#60717D]">Please sign in to submit support request.</span>
                      <button
                        type="button"
                        onClick={loginWithGoogle}
                        className="px-3.5 py-1.5 rounded bg-[#173B57] hover:bg-[#245A7A] text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current shrink-0" aria-hidden="true">
                          <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.437-2.883-6.437-6.438a6.445 6.445 0 016.437-6.437c1.558 0 2.978.557 4.095 1.486L21.2 4.135C19.268 2.502 16.742 1.5 12.24 1.5c-5.79 0-10.5 4.71-10.5 10.5s4.71 10.5 10.5 10.5c5.385 0 10.07-3.793 10.07-10.5 0-.66-.06-1.285-.2-1.715H12.24z"/>
                        </svg>
                        <span>Sign in with Google</span>
                      </button>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-[#60717D] font-mono">
                      SECURE CHANNEL ACTIVE
                    </span>
                    <button
                      type="submit"
                      disabled={submitting || !isLoggedIn}
                      className={`h-8 px-4 rounded text-xs font-bold text-white transition-all flex items-center gap-1.5 select-none ${
                        submitting || !isLoggedIn
                          ? "bg-[#D9E4EA] text-[#60717D] cursor-not-allowed border border-[#D9E4EA]"
                          : "bg-[#173B57] hover:bg-[#245A7A] active:scale-[0.99] cursor-pointer shadow-xs"
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
