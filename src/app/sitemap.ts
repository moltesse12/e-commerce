import type { MetadataRoute } from "next";
import { getSupabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  let productEntries: MetadataRoute.Sitemap = [];
  try {
    const supabase = getSupabase();
    const { data: products } = await supabase
      .from("products")
      .select("slug, updated_at")
      .eq("is_active", true);

    productEntries = (products ?? []).map((p) => ({
      url: `${baseUrl}/products/${p.slug}`,
      lastModified: p.updated_at ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
  } catch {
    // DB not available at build time — return static pages only
  }

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...productEntries,
    { url: `${baseUrl}/account`, changeFrequency: "monthly", priority: 0.3 },
  ];
}
