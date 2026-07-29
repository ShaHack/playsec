/**
 * Professional download utility for PlaySec platform.
 * Downloads files immediately via Blob object URL without opening new tabs,
 * preserving original filenames and supporting PDF, ZIP, DOCX, MP3, etc.
 */
export async function downloadFile(url: string, suggestedFilename?: string): Promise<void> {
  if (!url) return;

  // Derive clean filename if not provided
  let filename = suggestedFilename ? sanitizeFilename(suggestedFilename) : "";
  
  if (!filename) {
    const rawPath = url.split("?")[0].split("#")[0];
    const extractedName = rawPath.split("/").pop();
    filename = extractedName ? sanitizeFilename(extractedName) : "playsec_resource";
  }

  // Ensure file extension matches URL if missing from filename
  const extensionMatch = url.match(/\.(pdf|zip|docx|doc|mp3|mp4|png|jpg|jpeg|txt|csv|json)($|\?|#)/i);
  if (extensionMatch && !hasFileExtension(filename)) {
    filename += `.${extensionMatch[1].toLowerCase()}`;
  }

  try {
    // 1. Fetch file data as blob over CORS
    const response = await fetch(url, { mode: "cors" });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    // 2. Create invisible anchor and trigger browser download
    const link = document.createElement("a");
    link.href = blobUrl;
    link.download = filename;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    // 3. Clean up blob URL after delay
    setTimeout(() => {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(blobUrl);
    }, 1000);
  } catch {
    // Graceful fallback for cross-origin CORS restriction or offline fetch:
    // Create direct hidden link element with download attribute (same tab)
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.target = "_self";
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      setTimeout(() => {
        if (document.body.contains(link)) {
          document.body.removeChild(link);
        }
      }, 1000);
    } catch {
      // Final fallback: redirect in current tab (never new tab)
      window.location.href = url;
    }
  }
}

function sanitizeFilename(name: string): string {
  return name
    .trim()
    .replace(/[/\\?%*:|"<>]/g, "_")
    .replace(/\s+/g, "_");
}

function hasFileExtension(filename: string): boolean {
  const parts = filename.split(".");
  return parts.length > 1 && (parts[parts.length - 1].length >= 2 && parts[parts.length - 1].length <= 5);
}
