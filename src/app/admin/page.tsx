"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Upload, FileText, Music, Image as ImageIcon, Shield, 
  CheckCircle, AlertCircle, Loader, Plus, ArrowLeft 
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Helper: Verify admin authorization directly against database
export const verifyAdminUser = async (userEmail?: string | null): Promise<boolean> => {
  if (!userEmail) return false;
  try {
    const { data, error } = await supabase
      .from("admins")
      .select("id")
      .ilike("email", userEmail.trim());

    if (error || !data || data.length === 0) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
};

export default function AdminDashboard() {
  const { isLoggedIn, user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;

    async function checkAdminStatus() {
      if (authLoading) return;

      if (!isLoggedIn || !user?.email) {
        if (mounted) setIsAdmin(false);
        router.replace("/");
        return;
      }

      const authorized = await verifyAdminUser(user.email);

      if (!mounted) return;

      if (authorized) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
        router.replace("/?error=unauthorized");
      }
    }
    
    checkAdminStatus();

    return () => {
      mounted = false;
    };
  }, [isLoggedIn, user, authLoading, router]);

  // Tab State: 'playbook' | 'library'
  const [activeTab, setActiveTab] = useState<"playbook" | "library">("playbook");
  
  // Global Upload/Publish States
  const [publishing, setPublishing] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Playbook Form State
  const [pbTitle, setPbTitle] = useState("");
  const [pbDesc, setPbDesc] = useState("");
  const [pbAuthor, setPbAuthor] = useState("PlaySec SecOps Team");
  const [pbCategory, setPbCategory] = useState("Audio Briefings");
  const [pbDifficulty, setPbDifficulty] = useState<"Beginner" | "Intermediate" | "Advanced">("Intermediate");
  const [pbLanguages, setPbLanguages] = useState("English");
  const [pbDuration, setPbDuration] = useState("08:15");
  const [pbCoverFile, setPbCoverFile] = useState<File | null>(null);
  const [pbAudioFile, setPbAudioFile] = useState<File | null>(null);
  const [pbFeatured, setPbFeatured] = useState(false);
  const [pbPublished, setPbPublished] = useState(true);

  // Library Form State
  const [libTitle, setLibTitle] = useState("");
  const [libDesc, setLibDesc] = useState("");
  const [libAuthor, setLibAuthor] = useState("PlaySec SecOps Team");
  const [libCategory, setLibCategory] = useState("Defensive Security");
  const [libSubcategory, setLibSubcategory] = useState("");
  const [libThumbnailFile, setLibThumbnailFile] = useState<File | null>(null);
  const [libDocFile, setLibDocFile] = useState<File | null>(null);
  const [libFileType, setLibFileType] = useState("pdf");
  const [libFeatured, setLibFeatured] = useState(false);
  const [libPublished, setLibPublished] = useState(true);

  // Helper: Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  // Helper: Upload file to a Supabase bucket and return public URL
  const uploadFileToBucket = async (bucket: string, folder: string, file: File): Promise<string> => {
    // Live security verification before file storage upload
    const isAuthorized = await verifyAdminUser(user?.email);
    if (!isAuthorized) {
      throw new Error("Unauthorized: Storage upload operation denied for non-administrators.");
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false
      });

    if (uploadError) {
      console.error("[PlaySec CMS] Upload error object:", uploadError);
      
      // Cast to any to safely extract specific storage error properties
      const errDetails = uploadError as any;
      const errorMsg = `Storage Upload Failed: ${uploadError.message || "Unknown error"}. Status Code: ${errDetails.statusCode || "N/A"}. Details: ${errDetails.details || "None"}. Hint: ${errDetails.hint || "None"}`;
      
      console.error("[PlaySec CMS] Formatted Error Details:", errorMsg);
      throw new Error(errorMsg);
    }

    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
  };

  // Handler: Publish Audio Playbook
  const handlePublishPlaybook = async (e: React.FormEvent) => {
    e.preventDefault();
    const isAuthorized = await verifyAdminUser(user?.email);
    if (!isAuthorized) {
      setStatusMsg({ type: "error", text: "Operation forbidden: You are not an authorized administrator." });
      return;
    }
    if (!pbTitle.trim() || !pbDesc.trim() || !pbAudioFile) {
      setStatusMsg({ type: "error", text: "Please fill in Title, Description, and select an Audio file." });
      return;
    }

    setPublishing(true);
    setStatusMsg(null);

    try {
      let audioUrl = "";
      let coverImageUrl = "";

      // 1. Upload Audio File
      audioUrl = await uploadFileToBucket("playbook-audio", "audio", pbAudioFile);

      // 2. Upload Cover Image if selected
      if (pbCoverFile) {
        coverImageUrl = await uploadFileToBucket("cover-images", "covers", pbCoverFile);
      }

      // 3. Create Row in playbooks
      const slug = generateSlug(pbTitle);
      const { error: dbError } = await supabase.from("playbooks").insert([
        {
          slug,
          title: pbTitle,
          description: pbDesc,
          author: pbAuthor,
          category: pbCategory,
          difficulty: pbDifficulty,
          language: pbLanguages,
          duration: pbDuration,
          cover_image: coverImageUrl,
          audio_url: audioUrl,
          tags: [pbCategory, pbDifficulty],
          featured: pbFeatured,
          published: pbPublished,
          updated_date: new Date().toISOString()
        }
      ]);

      if (dbError) throw dbError;

      setStatusMsg({ type: "success", text: `Playbook "${pbTitle}" published successfully!` });
      // Reset Form
      setPbTitle("");
      setPbDesc("");
      setPbAudioFile(null);
      setPbCoverFile(null);
    } catch (err: unknown) {
      setStatusMsg({ type: "error", text: (err as Error).message || "An unexpected error occurred." });
    } finally {
      setPublishing(false);
    }
  };

  // Handler: Publish Library Resource
  const handlePublishLibrary = async (e: React.FormEvent) => {
    e.preventDefault();
    const isAuthorized = await verifyAdminUser(user?.email);
    if (!isAuthorized) {
      setStatusMsg({ type: "error", text: "Operation forbidden: You are not an authorized administrator." });
      return;
    }
    if (!libTitle.trim() || !libDesc.trim() || !libDocFile) {
      setStatusMsg({ type: "error", text: "Please fill in Title, Description, and select a document file." });
      return;
    }

    setPublishing(true);
    setStatusMsg(null);

    try {
      let fileUrl = "";
      let thumbnailUrl = "";

      // 1. Upload Doc File
      fileUrl = await uploadFileToBucket("library-resources", "resources", libDocFile);

      // 2. Upload Thumbnail if selected
      if (libThumbnailFile) {
        thumbnailUrl = await uploadFileToBucket("cover-images", "thumbnails", libThumbnailFile);
      }

      // 3. Create Row in knowledge_resources
      const slug = generateSlug(libTitle);
      const { error: dbError } = await supabase.from("knowledge_resources").insert([
        {
          slug,
          title: libTitle,
          description: libDesc,
          author: libAuthor,
          category: libCategory,
          subcategory: libSubcategory || null,
          thumbnail: thumbnailUrl,
          file_url: fileUrl,
          file_type: libFileType,
          tags: [libCategory, libFileType],
          featured: libFeatured,
          published: libPublished,
          updated_date: new Date().toISOString()
        }
      ]);

      if (dbError) throw dbError;

      setStatusMsg({ type: "success", text: `Resource "${libTitle}" published successfully!` });
      // Reset Form
      setLibTitle("");
      setLibDesc("");
      setLibDocFile(null);
      setLibThumbnailFile(null);
      setLibSubcategory("");
    } catch (err: unknown) {
      setStatusMsg({ type: "error", text: (err as Error).message || "An unexpected error occurred." });
    } finally {
      setPublishing(false);
    }
  };

  // Strict Route Protection: Only render Admin Dashboard UI when isAdmin is strictly true
  if (authLoading || isAdmin !== true) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-[#0B0F14] flex items-center justify-center text-slate-350">
          <div className="text-center">
            <Loader className="animate-spin h-8 w-8 text-[#3B82F6] mx-auto mb-4" />
            <p className="text-xs">Verifying authorization access...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[#0B0F14] text-[#F3F4F6] py-12 relative overflow-hidden select-text">
        {/* Grid Background */}
        <div className="pointer-events-none absolute inset-0 z-0"
          style={{
            opacity: 0.015,
            backgroundImage: "linear-gradient(#2A3442 1px, transparent 1px), linear-gradient(90deg, #2A3442 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }} />

        <div className="relative z-10 max-w-[960px] mx-auto px-6">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-[#2A3442] pb-6 mb-8">
            <div>
              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-[#3B82F6] block mb-1">
                Content Management System
              </span>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">
                Publishing Console
              </h1>
            </div>
            <Link 
              href="/"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#A8B3C5] hover:text-white rounded border border-[#2A3442] bg-[#141A22] hover:border-slate-500 transition-all"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              View Site
            </Link>
          </div>

          {/* Alert Status Banner */}
          {statusMsg && (
            <div className={`flex items-start gap-3 p-4 rounded border mb-6 select-none ${
              statusMsg.type === "success" 
                ? "bg-[#10B981]/10 border-[#10B981]/20 text-[#10B981]" 
                : "bg-[#EF4444]/10 border-[#EF4444]/20 text-[#EF4444]"
            }`}>
              {statusMsg.type === "success" ? <CheckCircle className="h-5 w-5 shrink-0 mt-0.5" /> : <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />}
              <span className="text-xs font-bold leading-relaxed">{statusMsg.text}</span>
            </div>
          )}

          {/* Form Tabs */}
          <div className="flex border-b border-[#2A3442] mb-8 select-none">
            <button
              onClick={() => { setActiveTab("playbook"); setStatusMsg(null); }}
              className={`flex items-center gap-2 px-6 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "playbook" 
                  ? "border-[#3B82F6] text-white bg-[#3B82F6]/5" 
                  : "border-transparent text-[#A8B3C5] hover:text-white"
              }`}
            >
              <Music className="h-4 w-4" />
              Audio Playbook
            </button>
            <button
              onClick={() => { setActiveTab("library"); setStatusMsg(null); }}
              className={`flex items-center gap-2 px-6 py-3 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === "library" 
                  ? "border-[#3B82F6] text-white bg-[#3B82F6]/5" 
                  : "border-transparent text-[#A8B3C5] hover:text-white"
              }`}
            >
              <FileText className="h-4 w-4" />
              Library Resource
            </button>
          </div>

          {/* Form 1: Playbook upload */}
          {activeTab === "playbook" && (
            <form onSubmit={handlePublishPlaybook} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A8B3C5] mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={pbTitle}
                    onChange={(e) => setPbTitle(e.target.value)}
                    placeholder="e.g. SMB Relay Attacks Mitigation"
                    className="w-full h-10 px-3 text-xs rounded border border-[#2A3442] bg-[#141A22] text-white placeholder:text-[#A8B3C5] focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A8B3C5] mb-2">Author</label>
                  <input
                    type="text"
                    required
                    value={pbAuthor}
                    onChange={(e) => setPbAuthor(e.target.value)}
                    className="w-full h-10 px-3 text-xs rounded border border-[#2A3442] bg-[#141A22] text-white placeholder:text-[#A8B3C5] focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A8B3C5] mb-2">Description</label>
                <textarea
                  required
                  rows={3}
                  value={pbDesc}
                  onChange={(e) => setPbDesc(e.target.value)}
                  placeholder="Detailed walk-through description..."
                  className="w-full p-3 text-xs rounded border border-[#2A3442] bg-[#141A22] text-white placeholder:text-[#A8B3C5] focus:border-[#3B82F6] focus:outline-none resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A8B3C5] mb-2">Category</label>
                  <select
                    value={pbCategory}
                    onChange={(e) => setPbCategory(e.target.value)}
                    className="w-full h-10 px-2 text-xs rounded border border-[#2A3442] bg-[#141A22] text-white focus:border-[#3B82F6] focus:outline-none cursor-pointer"
                  >
                    <option value="Audio Briefings">Audio Briefings</option>
                    <option value="Case Studies">Case Studies</option>
                    <option value="Incident Walkthroughs">Incident Walkthroughs</option>
                    <option value="Security Talks">Security Talks</option>
                  </select>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A8B3C5] mb-2">Difficulty</label>
                  <select
                    value={pbDifficulty}
                    onChange={(e) => setPbDifficulty(e.target.value as any)}
                    className="w-full h-10 px-2 text-xs rounded border border-[#2A3442] bg-[#141A22] text-white focus:border-[#3B82F6] focus:outline-none cursor-pointer"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                {/* Languages */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A8B3C5] mb-2">Languages</label>
                  <input
                    type="text"
                    required
                    value={pbLanguages}
                    onChange={(e) => setPbLanguages(e.target.value)}
                    placeholder="e.g. English, Hindi, Tamil"
                    className="w-full h-10 px-3 text-xs rounded border border-[#2A3442] bg-[#141A22] text-white placeholder:text-[#A8B3C5] focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A8B3C5] mb-2">Duration</label>
                  <input
                    type="text"
                    required
                    value={pbDuration}
                    onChange={(e) => setPbDuration(e.target.value)}
                    placeholder="e.g. 08:15"
                    className="w-full h-10 px-3 text-xs rounded border border-[#2A3442] bg-[#141A22] text-white placeholder:text-[#A8B3C5] focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>
              </div>

              {/* Files Upload Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Audio File Input */}
                <div className="rounded border border-[#2A3442] bg-[#141A22]/40 p-4">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#A8B3C5] mb-3">
                    Audio Playbook Track
                  </span>
                  <div className="relative border-2 border-dashed border-[#2A3442] hover:border-slate-500 rounded p-6 text-center transition-colors">
                    <input 
                      type="file" 
                      required
                      accept="audio/*"
                      onChange={(e) => setPbAudioFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Music className="h-6 w-6 text-[#3B82F6] mx-auto mb-2" />
                    <span className="block text-xs font-bold text-slate-200">
                      {pbAudioFile ? pbAudioFile.name : "Select Playbook Audio File"}
                    </span>
                    <span className="block text-[9px] text-[#A8B3C5] mt-1">MP3, WAV, M4A up to 50MB</span>
                  </div>
                </div>

                {/* Cover File Input */}
                <div className="rounded border border-[#2A3442] bg-[#141A22]/40 p-4">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#A8B3C5] mb-3">
                    Cover Image
                  </span>
                  <div className="relative border-2 border-dashed border-[#2A3442] hover:border-slate-500 rounded p-6 text-center transition-colors">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setPbCoverFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <ImageIcon className="h-6 w-6 text-[#3B82F6] mx-auto mb-2" />
                    <span className="block text-xs font-bold text-slate-200">
                      {pbCoverFile ? pbCoverFile.name : "Select Cover Photo (Optional)"}
                    </span>
                    <span className="block text-[9px] text-[#A8B3C5] mt-1">PNG, JPG, WEBP up to 5MB</span>
                  </div>
                </div>
              </div>

              {/* Switches */}
              <div className="flex flex-wrap items-center gap-6 select-none bg-[#141A22] border border-[#2A3442] rounded p-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-200">
                  <input
                    type="checkbox"
                    checked={pbFeatured}
                    onChange={(e) => setPbFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-[#2A3442] bg-[#0B0F14] text-[#3B82F6]"
                  />
                  Featured Playbook
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-200">
                  <input
                    type="checkbox"
                    checked={pbPublished}
                    onChange={(e) => setPbPublished(e.target.checked)}
                    className="h-4 w-4 rounded border-[#2A3442] bg-[#0B0F14] text-[#3B82F6]"
                  />
                  Publish Instantly
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={publishing}
                className="w-full flex h-11 items-center justify-center gap-2 px-6 rounded bg-[#3B82F6] hover:bg-blue-600 disabled:bg-[#141A22] text-white font-extrabold text-sm transition-colors cursor-pointer disabled:cursor-not-allowed border disabled:border-[#2A3442]"
              >
                {publishing ? (
                  <>
                    <Loader className="animate-spin h-4 w-4" />
                    <span>Publishing Playbook...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Publish Playbook</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Form 2: Library resource upload */}
          {activeTab === "library" && (
            <form onSubmit={handlePublishLibrary} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A8B3C5] mb-2">Title</label>
                  <input
                    type="text"
                    required
                    value={libTitle}
                    onChange={(e) => setLibTitle(e.target.value)}
                    placeholder="e.g. CIS Benchmarks Windows Server 2022"
                    className="w-full h-10 px-3 text-xs rounded border border-[#2A3442] bg-[#141A22] text-white placeholder:text-[#A8B3C5] focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>

                {/* Author */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A8B3C5] mb-2">Author</label>
                  <input
                    type="text"
                    required
                    value={libAuthor}
                    onChange={(e) => setLibAuthor(e.target.value)}
                    className="w-full h-10 px-3 text-xs rounded border border-[#2A3442] bg-[#141A22] text-white placeholder:text-[#A8B3C5] focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A8B3C5] mb-2">Description</label>
                <textarea
                  required
                  rows={3}
                  value={libDesc}
                  onChange={(e) => setLibDesc(e.target.value)}
                  placeholder="Summary details of this downloadable document..."
                  className="w-full p-3 text-xs rounded border border-[#2A3442] bg-[#141A22] text-white placeholder:text-[#A8B3C5] focus:border-[#3B82F6] focus:outline-none resize-y"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A8B3C5] mb-2">Category</label>
                  <select
                    value={libCategory}
                    onChange={(e) => setLibCategory(e.target.value)}
                    className="w-full h-10 px-2 text-xs rounded border border-[#2A3442] bg-[#141A22] text-white focus:border-[#3B82F6] focus:outline-none cursor-pointer"
                  >
                    <option value="Defensive Security">Defensive Security</option>
                    <option value="Offensive Security">Offensive Security</option>
                    <option value="Cloud Security">Cloud Security</option>
                    <option value="Web Security">Web Security</option>
                    <option value="Digital Forensics">Digital Forensics</option>
                    <option value="Threat Hunting">Threat Hunting</option>
                    <option value="Malware Analysis">Malware Analysis</option>
                    <option value="Secure Coding">Secure Coding</option>
                    <option value="Incident Response">Incident Response</option>
                  </select>
                </div>

                {/* Subcategory */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A8B3C5] mb-2">Subcategory (Optional)</label>
                  <input
                    type="text"
                    value={libSubcategory}
                    onChange={(e) => setLibSubcategory(e.target.value)}
                    placeholder="e.g. Cheat Sheet"
                    className="w-full h-10 px-3 text-xs rounded border border-[#2A3442] bg-[#141A22] text-white placeholder:text-[#A8B3C5] focus:border-[#3B82F6] focus:outline-none"
                  />
                </div>

                {/* File Type */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#A8B3C5] mb-2">File Type</label>
                  <select
                    value={libFileType}
                    onChange={(e) => setLibFileType(e.target.value)}
                    className="w-full h-10 px-2 text-xs rounded border border-[#2A3442] bg-[#141A22] text-white focus:border-[#3B82F6] focus:outline-none cursor-pointer"
                  >
                    <option value="pdf">PDF Guide</option>
                    <option value="cheat_sheet">Cheat Sheet</option>
                    <option value="checklist">Checklist</option>
                    <option value="template">Template</option>
                    <option value="reference_guide">Reference Guide</option>
                  </select>
                </div>
              </div>

              {/* Files Upload Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* Document File Input */}
                <div className="rounded border border-[#2A3442] bg-[#141A22]/40 p-4">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#A8B3C5] mb-3">
                    Downloadable Document File
                  </span>
                  <div className="relative border-2 border-dashed border-[#2A3442] hover:border-slate-500 rounded p-6 text-center transition-colors">
                    <input 
                      type="file" 
                      required
                      onChange={(e) => setLibDocFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload className="h-6 w-6 text-[#3B82F6] mx-auto mb-2" />
                    <span className="block text-xs font-bold text-slate-200">
                      {libDocFile ? libDocFile.name : "Select Resource File"}
                    </span>
                    <span className="block text-[9px] text-[#A8B3C5] mt-1">PDF, Cheat Sheet, Checklist up to 40MB</span>
                  </div>
                </div>

                {/* Thumbnail File Input */}
                <div className="rounded border border-[#2A3442] bg-[#141A22]/40 p-4">
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-[#A8B3C5] mb-3">
                    Thumbnail Image
                  </span>
                  <div className="relative border-2 border-dashed border-[#2A3442] hover:border-slate-500 rounded p-6 text-center transition-colors">
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={(e) => setLibThumbnailFile(e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <ImageIcon className="h-6 w-6 text-[#3B82F6] mx-auto mb-2" />
                    <span className="block text-xs font-bold text-slate-200">
                      {libThumbnailFile ? libThumbnailFile.name : "Select Image File (Optional)"}
                    </span>
                    <span className="block text-[9px] text-[#A8B3C5] mt-1">PNG, JPG, WEBP up to 5MB</span>
                  </div>
                </div>
              </div>

              {/* Switches */}
              <div className="flex flex-wrap items-center gap-6 select-none bg-[#141A22] border border-[#2A3442] rounded p-4">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-200">
                  <input
                    type="checkbox"
                    checked={libFeatured}
                    onChange={(e) => setLibFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-[#2A3442] bg-[#0B0F14] text-[#3B82F6]"
                  />
                  Featured Resource
                </label>
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-200">
                  <input
                    type="checkbox"
                    checked={libPublished}
                    onChange={(e) => setLibPublished(e.target.checked)}
                    className="h-4 w-4 rounded border-[#2A3442] bg-[#0B0F14] text-[#3B82F6]"
                  />
                  Publish Instantly
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={publishing}
                className="w-full flex h-11 items-center justify-center gap-2 px-6 rounded bg-[#3B82F6] hover:bg-blue-600 disabled:bg-[#141A22] text-white font-extrabold text-sm transition-colors cursor-pointer disabled:cursor-not-allowed border disabled:border-[#2A3442]"
              >
                {publishing ? (
                  <>
                    <Loader className="animate-spin h-4 w-4" />
                    <span>Publishing Resource...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Publish Resource</span>
                  </>
                )}
              </button>
            </form>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
