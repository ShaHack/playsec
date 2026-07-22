import { supabase } from "@/lib/supabase";
import { LibraryResource } from "@/types/library";

const isDev = process.env.NODE_ENV === "development";

const isEnvMissing = () => {
  const url = process.env.NEXT_PROJECT_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !key || url.includes("placeholder-project-id") || key.includes("placeholder-signature");
};

export const FALLBACK_RESOURCES: LibraryResource[] = [
  {
    id: "kb-001",
    slug: "owasp-api-security-checklist",
    title: "OWASP API Security Hardening Checklist",
    description: "A practical configuration guide outlining access control assertions, token schema validations, and gateway limits to mitigate modern API threat vectors.",
    category: "Defensive Security",
    thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_type: "pdf",
    author: "PlaySec SecOps Team",
    tags: ["API", "OWASP", "Hardening"]
  },
  {
    id: "kb-002",
    slug: "ad-exploitation-cheatsheet",
    title: "Active Directory Domain Escalation Blueprint",
    description: "Technical cheat sheet documenting kerberoasting vectors, delegation configurations, and privilege inheritance mappings to verify boundary separation.",
    category: "Offensive Security",
    thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=600&auto=format&fit=crop&q=80",
    file_url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    file_type: "pdf",
    author: "Red Team Specialists",
    tags: ["AD", "Kerberos", "Escalation"]
  }
];

export const libraryService = {
  async getAllResources(searchQuery?: string, categoryFilter?: string): Promise<LibraryResource[]> {
    if (isEnvMissing()) {
      if (isDev) return this.getFallbackResources(searchQuery, categoryFilter);
      throw new Error("Supabase configuration missing.");
    }

    try {
      let query = supabase.from("knowledge_resources").select("*");

      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,slug.ilike.%${searchQuery}%`);
      }
      
      if (categoryFilter && categoryFilter !== "All") {
        query = query.eq("category", categoryFilter);
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

      return data.map(mapDbToResource);
    } catch (e: any) {
      if (
        e.message === "Table not found." ||
        e.message === "Supabase permission denied. Check Row Level Security policies." ||
        e.message === "No resources have been published yet." ||
        e.message === "Supabase configuration missing."
      ) {
        throw e;
      }

      console.error("LibraryService Exception", e);
      if (isDev) {
        return this.getFallbackResources(searchQuery, categoryFilter);
      }
      throw new Error("Unable to connect to PlaySec servers.");
    }
  },

  getFallbackResources(searchQuery?: string, categoryFilter?: string): LibraryResource[] {
    let filtered = FALLBACK_RESOURCES;

    if (categoryFilter && categoryFilter !== "All") {
      filtered = filtered.filter(item => item.category === categoryFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(
        item =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.slug.toLowerCase().includes(q)
      );
    }

    return filtered;
  }
};

function mapDbToResource(dbItem: any): LibraryResource {
  return {
    id: dbItem.id?.toString() || "",
    slug: dbItem.slug || "",
    title: dbItem.title || "",
    description: dbItem.description || "",
    thumbnail: dbItem.thumbnail || "",
    file_url: dbItem.file_url || "",
    file_type: dbItem.file_type || "pdf",
    category: dbItem.category || "Defensive Security",
    subcategory: dbItem.subcategory,
    author: dbItem.author || "PlaySec SecOps Team",
    tags: Array.isArray(dbItem.tags) ? dbItem.tags : [],
    created_at: dbItem.created_at,
    updated_at: dbItem.updated_at,
    featured: dbItem.featured
  };
}
