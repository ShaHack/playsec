"use client";

import { useState } from "react";
import { X, Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { libraryService } from "@/services/libraryService";

interface UploadResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultDomain?: "offensive" | "defensive";
}

const RESOURCE_TYPES = [
  "PDF Guide",
  "Cheat Sheet",
  "Detection Rule",
  "Incident Response",
  "Hardening Guide",
  "SOC Reference",
  "Malware Analysis",
  "Threat Intelligence",
  "Payload Reference",
  "Web Exploitation",
  "Active Directory",
  "Privilege Escalation",
  "Wireless Security",
  "Cloud Pentesting"
];

export default function UploadResourceModal({
  isOpen,
  onClose,
  onSuccess,
  defaultDomain = "offensive"
}: UploadResourceModalProps) {
  const [title, setTitle] = useState("");
  const [securityDomain, setSecurityDomain] = useState<"offensive" | "defensive">(defaultDomain);
  const [resourceType, setResourceType] = useState("PDF Guide");
  const [author, setAuthor] = useState("PlaySec SecOps Team");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        setErrorMsg("Please select a valid PDF file.");
        setSelectedFile(null);
        return;
      }
      setErrorMsg("");
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setErrorMsg("Resource title is required.");
      return;
    }

    if (!selectedFile) {
      setErrorMsg("Please select a PDF document to upload.");
      return;
    }

    setIsUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      await libraryService.uploadResource({
        title: title.trim(),
        security_domain: securityDomain,
        resource_type: resourceType,
        file: selectedFile,
        author: author.trim() || "PlaySec SecOps Team",
      });

      setSuccessMsg("Resource successfully uploaded to PlaySec Library!");
      setTimeout(() => {
        setIsUploading(false);
        setSuccessMsg("");
        setTitle("");
        setSelectedFile(null);
        if (onSuccess) onSuccess();
        onClose();
      }, 1200);
    } catch (err: unknown) {
      setErrorMsg((err as Error).message || "Failed to upload resource.");
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
      <div className="relative w-full max-w-lg rounded-xl border border-[#2A3442] bg-[#141A22] p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#2A3442]">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20">
              <Upload className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">Upload Library Resource</h2>
              <p className="text-[11px] text-[#A8B3C5]">Add technical PDF documents to the PlaySec repository</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-[#0B0F14] transition-colors"
            aria-label="Close modal"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded bg-[#EF4444]/10 border border-[#EF4444]/20 text-xs font-semibold text-[#EF4444]">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 p-3 rounded bg-[#10B981]/10 border border-[#10B981]/20 text-xs font-semibold text-[#10B981]">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
              Resource Title <span className="text-[#EF4444]">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. WiFi Hacking Fundamentals"
              className="w-full h-9 px-3 rounded border border-[#2A3442] bg-[#0B0F14] text-xs text-white placeholder:text-slate-600 focus:border-[#3B82F6] focus:outline-none transition-colors"
            />
          </div>

          {/* Security Domain Selection */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Security Domain <span className="text-[#EF4444]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSecurityDomain("offensive")}
                className={`py-2 px-3 rounded border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  securityDomain === "offensive"
                    ? "bg-[#EF4444]/15 border-[#EF4444] text-[#EF4444]"
                    : "bg-[#0B0F14] border-[#2A3442] text-[#A8B3C5] hover:text-white"
                }`}
              >
                Offensive Security
              </button>

              <button
                type="button"
                onClick={() => setSecurityDomain("defensive")}
                className={`py-2 px-3 rounded border text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  securityDomain === "defensive"
                    ? "bg-[#3B82F6]/15 border-[#3B82F6] text-[#3B82F6]"
                    : "bg-[#0B0F14] border-[#2A3442] text-[#A8B3C5] hover:text-white"
                }`}
              >
                Defensive Security
              </button>
            </div>
          </div>

          {/* Resource Type Dropdown */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
              Resource Type <span className="text-[#EF4444]">*</span>
            </label>
            <select
              value={resourceType}
              onChange={(e) => setResourceType(e.target.value)}
              className="w-full h-9 px-3 rounded border border-[#2A3442] bg-[#0B0F14] text-xs text-white focus:border-[#3B82F6] focus:outline-none cursor-pointer"
            >
              {RESOURCE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Author Input */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
              Author / Authoring Team
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="PlaySec SecOps Team"
              className="w-full h-9 px-3 rounded border border-[#2A3442] bg-[#0B0F14] text-xs text-white placeholder:text-slate-600 focus:border-[#3B82F6] focus:outline-none transition-colors"
            />
          </div>

          {/* PDF File Input */}
          <div>
            <label className="block text-xs font-bold text-white uppercase tracking-wider mb-1">
              PDF Document <span className="text-[#EF4444]">*</span>
            </label>
            <div className="relative border border-dashed border-[#2A3442] hover:border-slate-500 rounded bg-[#0B0F14] p-4 text-center cursor-pointer transition-colors">
              <input
                type="file"
                accept="application/pdf,.pdf"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <div className="flex flex-col items-center justify-center gap-1 text-slate-400">
                <FileText className="h-6 w-6 text-[#3B82F6]" />
                <span className="text-xs font-semibold text-white">
                  {selectedFile ? selectedFile.name : "Click or drag PDF document to upload"}
                </span>
                <span className="text-[10px] text-slate-500">Maximum file size: 25MB (PDF only)</span>
              </div>
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#2A3442]">
            <button
              type="button"
              onClick={onClose}
              disabled={isUploading}
              className="px-4 py-2 rounded border border-[#2A3442] text-xs font-bold text-[#A8B3C5] hover:text-white hover:border-slate-500 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isUploading || !selectedFile || !title.trim()}
              className="px-5 py-2 rounded bg-[#3B82F6] hover:bg-blue-600 disabled:opacity-50 text-xs font-bold text-white transition-all flex items-center gap-2 cursor-pointer"
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-3.5 w-3.5" />
                  Upload Resource
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
