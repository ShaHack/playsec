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
    domainFilter: "all" | "offensive" | "defensive" = "all",
    typeFilter?: string
  ): Promise<LibraryResource[]> {
    if (isEnvMissing()) {
      return [];
    }

    try {
      let query = supabase
        .from("knowledge_resources")
        .select("*")
        .eq("published", true);

      // Domain filtering directly at Supabase query level
      if (domainFilter === "offensive") {
        query = query.or("security_domain.eq.offensive,category.ilike.%offensive%");
      } else if (domainFilter === "defensive") {
        query = query.or("security_domain.eq.defensive,category.ilike.%defensive%");
      }

      // Search query filtering
      if (searchQuery && searchQuery.trim()) {
        const sanitized = searchQuery.replace(/[^a-zA-Z0-9\s-_]/g, "").trim();
        if (sanitized) {
          query = query.or(
            `title.ilike.%${sanitized}%,description.ilike.%${sanitized}%,slug.ilike.%${sanitized}%`
          );
        }
      }

      const { data, error } = await query;
      if (error || !data) {
        return [];
      }

      let result = data.map(mapDbToResource);

      // Strict client-side verification to guarantee zero cross-contamination
      if (domainFilter === "offensive") {
        result = result.filter((item) => item.security_domain === "offensive");
      } else if (domainFilter === "defensive") {
        result = result.filter((item) => item.security_domain === "defensive");
      }

      // Filter by resource_type / subcategory if specified
      if (typeFilter && typeFilter !== "All") {
        result = result.filter(
          (item) =>
            item.resource_type.toLowerCase() === typeFilter.toLowerCase() ||
            item.subcategory?.toLowerCase() === typeFilter.toLowerCase()
        );
      }

      return result;
    } catch {
      return [];
    }
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbToResource(dbItem: any): LibraryResource {
  const title = dbItem.title || "Untitled Document";
  const rawCat = (dbItem.category || "").toLowerCase();
  const rawDomain = (dbItem.security_domain || "").toLowerCase();

  let domain: "offensive" | "defensive" = "defensive";

  if (
    rawDomain === "offensive" ||
    rawCat.includes("offensive") ||
    title.toLowerCase().includes("offensive") ||
    title.toLowerCase().includes("hacking") ||
    title.toLowerCase().includes("exploit") ||
    title.toLowerCase().includes("pentest") ||
    title.toLowerCase().includes("red-team")
  ) {
    domain = "offensive";
  } else if (
    rawDomain === "defensive" ||
    rawCat.includes("defensive")
  ) {
    domain = "defensive";
  }

  const category = domain === "offensive" ? "Offensive Security" : "Defensive Security";
  const resource_type = dbItem.resource_type || dbItem.subcategory || "PDF Guide";

  return {
    id: dbItem.id?.toString() || dbItem.slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    slug: dbItem.slug && dbItem.slug !== "English" ? dbItem.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title: title,
    description: dbItem.description || "Security operational briefing document.",
    author: dbItem.author || "PlaySec SecOps Team",
    security_domain: domain,
    category: category,
    resource_type: resource_type,
    subcategory: resource_type,
    storage_path: dbItem.storage_path || "",
    thumbnail: dbItem.thumbnail || "",
    file_url: dbItem.file_url || "",
    file_type: dbItem.file_type || "pdf",
    file_size: dbItem.file_size || "2.72 MB",
    file_format: (dbItem.file_type || "pdf").toUpperCase(),
    tags: Array.isArray(dbItem.tags) ? dbItem.tags : [],
    updated_date: dbItem.updated_date || dbItem.updated_at,
    featured: dbItem.featured,
    published: dbItem.published
  };
}
