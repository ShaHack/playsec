import { supabase } from "@/lib/supabase";
import { AudioPlaybook } from "@/types/playbook";

const isEnvMissing = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !key || url.includes("placeholder-project-id") || key.includes("placeholder-signature");
};

export const playbookService = {
  async getAllPlaybooks(searchQuery?: string): Promise<AudioPlaybook[]> {
    if (isEnvMissing()) {
      throw new Error("Supabase configuration missing.");
    }

    try {
      let query = supabase.from("playbooks").select("*").eq("published", true);
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,slug.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Supabase Query Failed", error);
        if (error.code === "42P01") throw new Error("Table not found.");
        if (error.code === "42501") throw new Error("Supabase permission denied. Check Row Level Security policies.");
        throw new Error("Unable to connect to PlaySec servers.");
      }

      if (!data || data.length === 0) {
        throw new Error("No resources have been published yet.");
      }

      return data.map(mapDbToPlaybook);
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
      
      console.error("PlaybookService Exception", e);
      throw new Error("Unable to connect to PlaySec servers.");
    }
  },

  async getPlaybookBySlug(slug: string): Promise<AudioPlaybook | null> {
    if (isEnvMissing()) {
      throw new Error("Supabase configuration missing.");
    }

    try {
      const { data: playbookData, error: playbookError } = await supabase
        .from("playbooks")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (playbookError) {
        console.error("Supabase Query Failed", playbookError);
        if (playbookError.code === "PGRST116") return null;
        if (playbookError.code === "42P01") throw new Error("Table not found.");
        if (playbookError.code === "42501") throw new Error("Supabase permission denied. Check Row Level Security policies.");
        throw new Error("Unable to connect to PlaySec servers.");
      }

      const playbook = mapDbToPlaybook(playbookData);

      // Fetch language tracks from playbook_languages table
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
          // Fallback: create default English track from main playbook row
          playbook.languages = [
            {
              language: "English",
              audio_url: playbook.audio_url,
              download_url: playbook.audio_url,
              duration: playbook.duration
            }
          ];
        }
      } catch (err) {
        console.warn("Could not query playbook_languages table, using fallback:", err);
        playbook.languages = [
          {
            language: "English",
            audio_url: playbook.audio_url,
            download_url: playbook.audio_url,
            duration: playbook.duration
          }
        ];
      }

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
      console.error("PlaybookService Slug Exception", e);
      throw new Error("Unable to connect to PlaySec servers.");
    }
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
