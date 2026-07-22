import { supabase } from "@/lib/supabase";
import { AudioPlaybook } from "@/types/playbook";

const isDev = process.env.NODE_ENV === "development";

const isEnvMissing = () => {
  const url = process.env.NEXT_PROJECT_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !key || url.includes("placeholder-project-id") || key.includes("placeholder-signature");
};

export const FALLBACK_PLAYBOOKS: AudioPlaybook[] = [
  {
    id: "playbook-001",
    slug: "api-bola-prevention",
    title: "Securing APIs Against Broken Object Level Authorization (BOLA)",
    description: "Learn how to detect, exploit, and implement zero-trust access controls to prevent authorization bypasses on object resources using our expert-led audio walkthrough.",
    cover_image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1200&auto=format&fit=crop&q=80",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    category: "Incident Walkthroughs",
    difficulty: "Intermediate",
    author: "PlaySec SecOps Team",
    languages: "EN, TA, HI",
    duration: "08:15",
    tags: ["OWASP Top 10", "BOLA", "Access Control"]
  },
  {
    id: "playbook-002",
    slug: "cyber-forensics-incident-response",
    title: "Digital Forensics & Incident Response",
    description: "An operational audio briefing detailing network logs captures analysis, memory dumping guidelines, and chain of custody practices during post-compromise mitigation.",
    cover_image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80",
    audio_url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    category: "Incident Walkthroughs",
    difficulty: "Advanced",
    author: "DFIR Specialists Group",
    languages: "EN, TA, HI",
    duration: "08:15",
    tags: ["DFIR", "Forensics", "NIST IR"]
  }
];

export const playbookService = {
  async getAllPlaybooks(searchQuery?: string): Promise<AudioPlaybook[]> {
    if (isEnvMissing()) {
      if (isDev) return this.getFallbackPlaybooks(searchQuery);
      throw new Error("Supabase configuration missing.");
    }

    try {
      let query = supabase.from("playbooks").select("*");
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
    } catch (e: any) {
      if (
        e.message === "Table not found." ||
        e.message === "Supabase permission denied. Check Row Level Security policies." ||
        e.message === "No resources have been published yet." ||
        e.message === "Supabase configuration missing."
      ) {
        throw e;
      }
      
      console.error("PlaybookService Exception", e);
      if (isDev) {
        return this.getFallbackPlaybooks(searchQuery);
      }
      throw new Error("Unable to connect to PlaySec servers.");
    }
  },

  async getPlaybookBySlug(slug: string): Promise<AudioPlaybook | null> {
    if (isEnvMissing()) {
      if (isDev) {
        const item = FALLBACK_PLAYBOOKS.find((p) => p.slug === slug);
        return item || null;
      }
      throw new Error("Supabase configuration missing.");
    }

    try {
      const { data, error } = await supabase
        .from("playbooks")
        .select("*")
        .eq("slug", slug)
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
    } catch (e: any) {
      if (
        e.message === "Table not found." ||
        e.message === "Supabase permission denied. Check Row Level Security policies." ||
        e.message === "Supabase configuration missing."
      ) {
        throw e;
      }
      console.error("PlaybookService Slug Exception", e);
      if (isDev) {
        const item = FALLBACK_PLAYBOOKS.find((p) => p.slug === slug);
        return item || null;
      }
      throw new Error("Unable to connect to PlaySec servers.");
    }
  },

  getFallbackPlaybooks(searchQuery?: string): AudioPlaybook[] {
    if (!searchQuery) return FALLBACK_PLAYBOOKS;
    const q = searchQuery.toLowerCase().trim();
    return FALLBACK_PLAYBOOKS.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }
};

function mapDbToPlaybook(dbItem: any): AudioPlaybook {
  return {
    id: dbItem.id?.toString() || "",
    slug: dbItem.slug || "",
    title: dbItem.title || "",
    description: dbItem.description || "",
    cover_image: dbItem.cover_image || "",
    audio_url: dbItem.audio_url || "",
    duration: dbItem.duration || "08:15",
    difficulty: dbItem.difficulty || "Intermediate",
    category: dbItem.category || "Audio Briefings",
    author: dbItem.author || "PlaySec SecOps Team",
    languages: dbItem.languages || "EN, TA, HI",
    tags: Array.isArray(dbItem.tags) ? dbItem.tags : [],
    created_at: dbItem.created_at,
    updated_at: dbItem.updated_at,
    featured: dbItem.featured
  };
}
