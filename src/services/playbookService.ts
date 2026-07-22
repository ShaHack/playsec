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
        console.error("Supabase Query Failed");
        console.error(error);
        
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
      const { data, error } = await supabase
        .from("playbooks")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (error) {
        console.error("Supabase Query Failed");
        console.error(error);
        if (error.code === "PGRST116") return null; // No rows returned
        if (error.code === "42P01") throw new Error("Table not found.");
        if (error.code === "42501") throw new Error("Supabase permission denied. Check Row Level Security policies.");
        throw new Error("Unable to connect to PlaySec servers.");
      }

      return mapDbToPlaybook(data);
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
