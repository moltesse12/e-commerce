import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Product, ProductVariant, Review } from "@/lib/types";

async function getProduct(slug: string) {
  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .single();
  return product as Product | null;
}

async function getVariants(productId: string) {
  const { data } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("size_label");
  return (data as ProductVariant[]) ?? [];
}

async function getReviews(productId: string) {
  const { data } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false });
  return (data as Review[]) ?? [];
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [variants] = await Promise.all([
    getVariants(product.id),
  ]);

  return (
    <div className="grid gap-12 md:grid-cols-2">
      <div className="aspect-square rounded-lg bg-gray-100" />

      <div className="space-y-6">
        <div>
          <p className="text-sm text-gray-500">{product.category?.name}</p>
          <h1 className="text-2xl font-bold text-primary">{product.name}</h1>
          <p className="mt-2 text-2xl font-semibold text-accent">
            {product.base_price.toLocaleString()} FCFA
          </p>
        </div>

        {product.description && (
          <p className="text-gray-600">{product.description}</p>
        )}

        {variants.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700">Tailles disponibles</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {variants.map((v) => (
                <span
                  key={v.id}
                  className="rounded-md border border-border px-4 py-2 text-sm"
                >
                  {v.size_label}
                  {v.stock === 0 && (
                    <span className="ml-2 text-xs text-red-500">Rupture</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}

        <button className="w-full rounded-lg bg-accent px-6 py-3 font-semibold text-white">
          Ajouter au panier
        </button>
      </div>
    </div>
  );
}
