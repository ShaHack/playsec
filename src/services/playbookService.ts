import { supabase } from "@/lib/supabase";
import { AudioPlaybook } from "@/types/playbook";

const isEnvMissing = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !key || url.includes("placeholder-project-id") || key.includes("placeholder-signature");
};

// In-memory cache for ultra-fast page transitions & instant refresh
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const playbookCache = new Map<string, { data: AudioPlaybook; timestamp: number }>();
let allPlaybooksCache: { data: AudioPlaybook[]; timestamp: number } | null = null;

export const playbookService = {
  async getAllPlaybooks(searchQuery?: string): Promise<AudioPlaybook[]> {
    if (isEnvMissing()) {
      throw new Error("Supabase configuration missing.");
    }

    const trimmedQuery = searchQuery?.trim() || "";

    // Return cached list if available and query is empty
    if (!trimmedQuery && allPlaybooksCache && (Date.now() - allPlaybooksCache.timestamp < CACHE_TTL_MS)) {
      return allPlaybooksCache.data;
    }

    try {
      let query = supabase.from("playbooks").select("*").eq("published", true);
      if (trimmedQuery) {
        const sanitized = trimmedQuery.replace(/[^a-zA-Z0-9\s-_]/g, "").trim();
        if (sanitized) {
          query = query.or(`title.ilike.%${sanitized}%,description.ilike.%${sanitized}%,slug.ilike.%${sanitized}%`);
        }
      }

      const { data, error } = await query;

      if (error) {
        if (error.code === "42P01") throw new Error("Table not found.");
        if (error.code === "42501") throw new Error("Supabase permission denied. Check Row Level Security policies.");
        throw new Error("Unable to connect to PlaySec servers.");
      }

      if (!data || data.length === 0) {
        throw new Error("No resources have been published yet.");
      }

      const mapped = data.map(mapDbToPlaybook);

      // Populate individual item cache and allPlaybooksCache
      if (!trimmedQuery) {
        allPlaybooksCache = { data: mapped, timestamp: Date.now() };
        mapped.forEach((item) => {
          if (item.slug) {
            playbookCache.set(item.slug, { data: item, timestamp: Date.now() });
          }
        });
      }

      return mapped;
    } catch (e: unknown) {
      const err = e as Error;
      if (
        err.message === "Table not found." ||
        err.message === "Supabase permission denied. Check Row Level Security policies." ||
        err.message === "No resources have been published yet." ||
        err.message === "Supabase configuration missing."
      ) {
        throw e;
      }
      throw new Error("Unable to connect to PlaySec servers.");
    }
  },

  async getPlaybookBySlug(slug: string): Promise<AudioPlaybook | null> {
    if (isEnvMissing()) {
      throw new Error("Supabase configuration missing.");
    }

    // Instant cache return
    const cached = playbookCache.get(slug);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS) && cached.data.languages && cached.data.languages.length > 0) {
      return cached.data;
    }

    try {
      const { data: playbookData, error: playbookError } = await supabase
        .from("playbooks")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (playbookError) {
        if (playbookError.code === "PGRST116") return null;
        if (playbookError.code === "42P01") throw new Error("Table not found.");
        if (playbookError.code === "42501") throw new Error("Supabase permission denied. Check Row Level Security policies.");
        throw new Error("Unable to connect to PlaySec servers.");
      }

      const playbook = mapDbToPlaybook(playbookData);

      try {
        const { data: langData, error: langError } = await supabase
          .from("playbook_languages")
          .select("*")
          .eq("playbook_id", playbook.id);

        if (!langError && langData && langData.length > 0) {
          playbook.languages = langData.map((l: Record<string, string | undefined>) => ({
            id: l.id,
            playbook_id: l.playbook_id,
            language: normalizeLanguageName(l.language || "English"),
            audio_url: l.audio_url || playbook.audio_url,
            download_url: l.download_url || l.audio_url || playbook.audio_url,
            transcript: l.transcript || "",
            duration: l.duration || playbook.duration
          }));
        } else {
          playbook.languages = [
            {
              language: "English",
              audio_url: playbook.audio_url,
              download_url: playbook.audio_url,
              duration: playbook.duration
            }
          ];
        }
      } catch {
        playbook.languages = [
          {
            language: "English",
            audio_url: playbook.audio_url,
            download_url: playbook.audio_url,
            duration: playbook.duration
          }
        ];
      }

      // Store in memory cache
      playbookCache.set(slug, { data: playbook, timestamp: Date.now() });

      return playbook;
    } catch (e: unknown) {
      const err = e as Error;
      if (
        err.message === "Table not found." ||
        err.message === "Supabase permission denied. Check Row Level Security policies." ||
        err.message === "Supabase configuration missing."
      ) {
        throw e;
      }
      throw new Error("Unable to connect to PlaySec servers.");
    }
  },

  clearCache() {
    playbookCache.clear();
    allPlaybooksCache = null;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbToPlaybook(dbItem: any): AudioPlaybook {
  return {
    id: dbItem.id?.toString() || "",
    slug: dbItem.slug || "",
    title: dbItem.title || "",
    description: dbItem.description || "",
    author: dbItem.author || "PlaySec SecOps Team",
    category: dbItem.category || "Audio Briefings",
    difficulty: dbItem.difficulty || "Intermediate",
    language: dbItem.language || "English",
    duration: dbItem.duration || "08:15",
    cover_image: dbItem.cover_image || "",
    audio_url: dbItem.audio_url || "",
    tags: Array.isArray(dbItem.tags) ? dbItem.tags : [],
    updated_date: dbItem.updated_date || dbItem.updated_at,
    featured: dbItem.featured,
    published: dbItem.published
  };
}

function normalizeLanguageName(lang: string): string {
  const l = lang.toLowerCase().trim();
  if (l === "en" || l === "english") return "English";
  if (l === "ta" || l === "tamil") return "Tamil";
  if (l === "hi" || l === "hindi") return "Hindi";
  return lang.charAt(0).toUpperCase() + lang.slice(1);
}
