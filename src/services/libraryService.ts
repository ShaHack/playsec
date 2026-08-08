import { supabase } from "@/lib/supabase";
import { LibraryResource } from "@/types/library";

const CACHE_TTL_MS = 5 * 60 * 1000;
const libraryCache = new Map<string, { data: LibraryResource[]; timestamp: number }>();

const isEnvMissing = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return !url || !key || url.includes("placeholder-project-id") || key.includes("placeholder-signature");
};

const getSupabaseBaseUrl = () => {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rkpocwynysurzmvjelga.supabase.co";
};

// Standard seed resources to ensure baseline datasets for both domains
const DEFAULT_RESOURCES: LibraryResource[] = [
  {
    id: "wifi-hacking-fundamentals-01",
    slug: "wifi-hacking-fundamentals",
    title: "WiFi Hacking Fundamentals",
    description: "Comprehensive guide to 802.11 WPA2/WPA3 handshake capture, PMKID attacks, rogue AP deployment, and wireless security auditing.",
    author: "PlaySec Security Team",
    security_domain: "offensive",
    category: "Offensive Security",
    resource_type: "PDF Guide",
    subcategory: "Wireless Security",
    storage_path: "offensive/WiFi-Hacking.pdf",
    file_url: `${getSupabaseBaseUrl()}/storage/v1/object/public/library-resources/offensive/WiFi-Hacking.pdf`,
    file_type: "pdf",
    file_size: "4.8 MB",
    file_format: "PDF",
    tags: ["wireless", "wpa3", "pentesting", "aircrack-ng"],
    updated_date: "2026-08-01T00:00:00.000Z",
    featured: true,
    published: true
  },
  {
    id: "prompt-engineering-offensive-view-02",
    slug: "prompt-engineering-offensive-view",
    title: "Prompt Engineering (Offensive View)",
    description: "LLM red-teaming techniques, prompt injection vectors, jailbreak taxonomies, and adversarial system prompt bypass methodology.",
    author: "PlaySec SecOps Team",
    security_domain: "offensive",
    category: "Offensive Security",
    resource_type: "PDF Guide",
    subcategory: "Web Exploitation",
    storage_path: "offensive/Prompt-Engineering-Offensive-View.pdf",
    file_url: `${getSupabaseBaseUrl()}/storage/v1/object/public/library-resources/Defensive/Prompt%20Engineering%20(Offensive%20View).pdf`,
    file_type: "pdf",
    file_size: "2.72 MB",
    file_format: "PDF",
    tags: ["llm", "prompt-injection", "red-team", "ai-security"],
    updated_date: "2026-08-08T05:28:51.354Z",
    featured: true,
    published: true
  },
  {
    id: "active-directory-privilege-escalation-03",
    slug: "active-directory-privilege-escalation",
    title: "Active Directory Delegation & Kerberoasting Vector Reference",
    description: "Technical reference for Kerberos ticket abuse, unconstrained delegation exploitation, and Domain Admin path analysis.",
    author: "PlaySec Red Team",
    security_domain: "offensive",
    category: "Offensive Security",
    resource_type: "Cheat Sheet",
    subcategory: "Active Directory",
    storage_path: "offensive/Active-Directory-Kerberoasting.pdf",
    file_url: `${getSupabaseBaseUrl()}/storage/v1/object/public/library-resources/Defensive/Prompt%20Engineering%20(Offensive%20View).pdf`,
    file_type: "pdf",
    file_size: "3.15 MB",
    file_format: "PDF",
    tags: ["active-directory", "kerberoasting", "bloodhound"],
    updated_date: "2026-07-28T00:00:00.000Z",
    featured: false,
    published: true
  },
  {
    id: "soc-analyst-incident-response-blueprint-04",
    slug: "soc-analyst-incident-response-blueprint",
    title: "SOC Threat Hunting & Detection Playbook",
    description: "Operational SIEM rule deployment, Windows Event Log audit policies (Sysmon), and memory analysis response steps.",
    author: "PlaySec Blue Team",
    security_domain: "defensive",
    category: "Defensive Security",
    resource_type: "Detection Rule",
    subcategory: "Incident Response",
    storage_path: "defensive/SOC-Threat-Hunting.pdf",
    file_url: `${getSupabaseBaseUrl()}/storage/v1/object/public/library-resources/defensive/SOC-Threat-Hunting.pdf`,
    file_type: "pdf",
    file_size: "5.10 MB",
    file_format: "PDF",
    tags: ["soc", "blue-team", "sysmon", "sigma-rules"],
    updated_date: "2026-07-25T00:00:00.000Z",
    featured: true,
    published: true
  },
  {
    id: "cloud-infrastructure-hardening-guide-05",
    slug: "cloud-infrastructure-hardening-guide",
    title: "AWS & Azure CIS Infrastructure Hardening Guide",
    description: "Step-by-step benchmark compliance, IAM least privilege auditing, and Kubernetes pod security standard deployment.",
    author: "PlaySec Cloud Security Team",
    security_domain: "defensive",
    category: "Defensive Security",
    resource_type: "Hardening Guide",
    subcategory: "SOC Reference",
    storage_path: "defensive/Cloud-Hardening-Guide.pdf",
    file_url: `${getSupabaseBaseUrl()}/storage/v1/object/public/library-resources/Defensive/Prompt%20Engineering%20(Offensive%20View).pdf`,
    file_type: "pdf",
    file_size: "3.90 MB",
    file_format: "PDF",
    tags: ["cloud-security", "aws", "cis-benchmark", "hardening"],
    updated_date: "2026-07-20T00:00:00.000Z",
    featured: false,
    published: true
  }
];

export const libraryService = {
  async getAllResources(
    searchQuery?: string,
    domainFilter: "all" | "offensive" | "defensive" = "all",
    typeFilter?: string
  ): Promise<LibraryResource[]> {
    const cacheKey = `${searchQuery?.trim() || ""}:${domainFilter}:${typeFilter || "All"}`;
    const cached = libraryCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return cached.data;
    }

    let fetched: LibraryResource[] = [];

    if (!isEnvMissing()) {
      try {
        let query = supabase.from("knowledge_resources").select("*").eq("published", true);

        if (searchQuery && searchQuery.trim()) {
          const sanitized = searchQuery.replace(/[^a-zA-Z0-9\s-_]/g, "").trim();
          if (sanitized) {
            query = query.or(`title.ilike.%${sanitized}%,description.ilike.%${sanitized}%,slug.ilike.%${sanitized}%`);
          }
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          fetched = data.map(mapDbToResource);
        }
      } catch {
        // Fall back to default resources if DB fails or table absent
      }
    }

    // Merge default baseline resources with database items to ensure complete catalog
    const mergedMap = new Map<string, LibraryResource>();

    DEFAULT_RESOURCES.forEach((res) => {
      mergedMap.set(res.slug, res);
    });

    fetched.forEach((res) => {
      mergedMap.set(res.slug || res.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"), res);
    });

    let result = Array.from(mergedMap.values());

    // Filter strictly by domain if specified
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

    // Filter by search query if needed
    if (searchQuery && searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (item) =>
          item.title.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.author.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    libraryCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapDbToResource(dbItem: any): LibraryResource {
  const title = dbItem.title || "Untitled Document";
  const rawCat = (dbItem.category || "").toLowerCase();

  // Audit title & DB category to accurately assign security domain
  let domain: "offensive" | "defensive" = "defensive";

  if (
    dbItem.security_domain === "offensive" ||
    rawCat.includes("offensive") ||
    title.toLowerCase().includes("offensive") ||
    title.toLowerCase().includes("hacking") ||
    title.toLowerCase().includes("exploit") ||
    title.toLowerCase().includes("pentest") ||
    title.toLowerCase().includes("payload") ||
    title.toLowerCase().includes("red-team")
  ) {
    domain = "offensive";
  } else if (
    dbItem.security_domain === "defensive" ||
    rawCat.includes("defensive")
  ) {
    domain = "defensive";
  }

  const category = domain === "offensive" ? "Offensive Security" : "Defensive Security";
  const resource_type = dbItem.resource_type || dbItem.subcategory || "PDF Guide";
  const storage_path = dbItem.storage_path || (domain === "offensive" ? `offensive/${dbItem.slug}.pdf` : `defensive/${dbItem.slug}.pdf`);

  let file_url = dbItem.file_url || "";
  if (!file_url && storage_path) {
    file_url = `${getSupabaseBaseUrl()}/storage/v1/object/public/library-resources/${storage_path}`;
  }
  if (!file_url) {
    file_url = `${getSupabaseBaseUrl()}/storage/v1/object/public/library-resources/Defensive/Prompt%20Engineering%20(Offensive%20View).pdf`;
  }

  return {
    id: dbItem.id?.toString() || title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    slug: dbItem.slug && dbItem.slug !== "English" ? dbItem.slug : title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    title: title,
    description: dbItem.description || "Security operational briefing document.",
    author: dbItem.author || "PlaySec SecOps Team",
    security_domain: domain,
    category: category,
    resource_type: resource_type,
    subcategory: resource_type,
    storage_path: storage_path,
    thumbnail: dbItem.thumbnail || "",
    file_url: file_url,
    file_type: dbItem.file_type || "pdf",
    file_size: dbItem.file_size || "2.72 MB",
    file_format: (dbItem.file_type || "pdf").toUpperCase(),
    tags: Array.isArray(dbItem.tags) ? dbItem.tags : [],
    updated_date: dbItem.updated_date || dbItem.updated_at,
    featured: dbItem.featured,
    published: dbItem.published
  };
}
