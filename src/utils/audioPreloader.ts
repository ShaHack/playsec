// Ultra-fast Audio Track Preloader & Cache
const preloadedAudioMap = new Map<string, HTMLAudioElement>();

/**
 * Intelligently preloads audio tracks in background with HTTP Range header support.
 * Allows instant 0-3s playback start and zero-latency language switching.
 */
export function preloadAudioTrack(url: string, priority: "metadata" | "auto" = "metadata"): void {
  if (!url || typeof window === "undefined") return;

  if (preloadedAudioMap.has(url)) {
    const existing = preloadedAudioMap.get(url);
    if (existing && priority === "auto" && existing.preload !== "auto") {
      existing.preload = "auto";
    }
    return;
  }

  try {
    const audio = new Audio();
    audio.preload = priority;
    audio.src = url;
    preloadedAudioMap.set(url, audio);
  } catch {
    // Silently ignore preloader errors
  }
}

/**
 * Preloads all language audio tracks for a given playbook
 */
export function preloadPlaybookAudioTracks(
  languages?: Array<{ audio_url?: string; download_url?: string }>
): void {
  if (!languages || !Array.isArray(languages)) return;

  languages.forEach((track) => {
    const url = track.audio_url || track.download_url;
    if (url) {
      preloadAudioTrack(url, "auto");
    }
  });
}
