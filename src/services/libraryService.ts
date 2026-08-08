import { supabase } from "@/lib/supabase";
import { LibraryResource } from "@/types/library";

const isEnvMissing = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !key || url.includes("placeholder-project-id") || key.includes("placeholder-signature");
};

export const libraryService = {
  async getAllResources(
    searchQuery?: string,
    sideFilter: "all" | "offensive" | "defensive" = "all",
    typeFilter?: string
  ): Promise<LibraryResource[]> {
    if (isEnvMissing()) {
      return [];
    }

    let query = supabase
      .from("knowledge_resources")
      .select("*")
      .eq("published", true);

    // Filter strictly using security_side column
    if (sideFilter === "offensive" || sideFilter === "defensive") {
      query = query.eq("security_side", sideFilter);
    }

    // Search query filtering if user enters text
    if (searchQuery && searchQuery.trim()) {
      const sanitized = searchQuery.replace(/[^a-zA-Z0-9\s-_]/g, "").trim();
      if (sanitized) {
        query = query.or(
          `title.ilike.%${sanitized}%,description.ilike.%${sanitized}%,slug.ilike.%${sanitized}%`
        );
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error("Supabase query error in libraryService:", error);
      throw new Error(error.message || "Failed to fetch library resources from database");
    }

    if (!data || data.length === 0) {
      return [];
    }

    let result = data.map(mapDbToResource);

    // Resource Type filter (e.g. PDF Guide, Cheat Sheet, Web Exploitation, etc.)
    if (typeFilter && typeFilter !== "All") {
      result = result.filter(
        (item) =>
          (item.resource_type && item.resource_type.toLowerCase() === typeFilter.toLowerCase()) ||
          (item.subcategory && item.subcategory.toLowerCase() === typeFilter.toLowerCase())
      );
    }

    return result;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbToResource(dbItem: any): LibraryResource {
  const title = dbItem.title || "Untitled Document";
  const security_side: "offensive" | "defensive" =
    dbItem.security_side === "offensive" ? "offensive" : "defensive";

  const sideLabel = security_side === "offensive" ? "Offensive Security" : "Defensive Security";
  const resource_type = dbItem.resource_type || dbItem.subcategory || "PDF Guide";

  return {
    id: dbItem.id?.toString() || dbItem.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    slug: dbItem.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title: title,
    description: dbItem.description || "Security operational briefing document.",
    author: dbItem.author || "PlaySec SecOps Team",
    security_side: security_side,
    category: sideLabel,
    resource_type: resource_type,
    subcategory: dbItem.subcategory || resource_type,
    storage_path: dbItem.storage_path || "",
    thumbnail_url: dbItem.thumbnail_url || dbItem.thumbnail || "",
    thumbnail: dbItem.thumbnail || dbItem.thumbnail_url || "",
    file_url: dbItem.file_url || "",
    file_type: dbItem.file_type || "pdf",
    file_size: dbItem.file_size || "2.72 MB",
    file_format: (dbItem.file_type || "pdf").toUpperCase(),
    tags: Array.isArray(dbItem.tags) ? dbItem.tags : [],
    updated_date: dbItem.updated_date || dbItem.updated_at,
    created_at: dbItem.created_at,
    updated_at: dbItem.updated_at,
    featured: dbItem.featured,
    published: dbItem.published
  };
}
