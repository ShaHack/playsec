import { supabase } from "@/lib/supabase";
import { LibraryResource } from "@/types/library";

const isEnvMissing = () => {
  const url = process.env.NEXT_PROJECT_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !key || url.includes("placeholder-project-id") || key.includes("placeholder-signature");
};

export const libraryService = {
  async getAllResources(searchQuery?: string, categoryFilter?: string): Promise<LibraryResource[]> {
    if (isEnvMissing()) {
      throw new Error("Supabase configuration missing.");
    }

    try {
      let query = supabase.from("knowledge_resources").select("*").eq("published", true);

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

      console.error("LibraryService Exception", e);
      throw new Error("Unable to connect to PlaySec servers.");
    }
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
    updated_date: dbItem.updated_date || dbItem.updated_at,
    featured: dbItem.featured,
    published: dbItem.published
  };
}
