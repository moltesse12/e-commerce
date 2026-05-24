import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { createClient } from "@/lib/supabase/server";
import { findBestSize } from "@/lib/matching";
import type { Product, ProductVariant } from "@/lib/types";
import { AddToCartButton } from "./add-to-cart-button";
import { ReviewSection } from "@/components/ReviewSection";

async function getProduct(slug: string) {
  const { data: product } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("slug", slug)
    .single();
  return product as (Product & { category: { slug: string } | null }) | null;
}

async function getVariants(productId: string) {
  const { data } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("size_label");
  return (data as ProductVariant[]) ?? [];
}

async function getUserMeasurements() {
  const supabaseServer = await createClient();
  const { data: { user } } = await supabaseServer.auth.getUser();
  if (!user) return null;

  const { data } = await supabaseServer
    .from("user_measurements")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_active", true)
    .maybeSingle();

  return data;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [variants, measurements] = await Promise.all([
    getVariants(product.id),
    getUserMeasurements(),
  ]);

  const match = measurements
    ? findBestSize(measurements, variants, product.category?.slug ?? "")
    : null;

  const inStock = variants.filter((v) => v.stock > 0);

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

        {match && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <p className="text-sm font-semibold text-green-800">
              Taille recommandée : {match.sizeLabel}
            </p>
            <p className="mt-1 text-xs text-green-600">
              Confiance : {match.confidence === "high" ? "élevée" : match.confidence === "medium" ? "moyenne" : "faible"}
            </p>
          </div>
        )}

        <AddToCartButton
          variants={variants}
          productId={product.id}
          productName={product.name}
          price={product.base_price}
        />

        <div className="rounded-lg border border-border bg-white p-4">
          <h3 className="text-sm font-semibold text-primary">Guide des tailles</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs text-gray-600">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 pr-4 font-medium">Taille</th>
                  <th className="pb-2 pr-4 font-medium">Poitrine</th>
                  <th className="pb-2 pr-4 font-medium">Taille</th>
                  <th className="pb-2 font-medium">Stock</th>
                </tr>
              </thead>
              <tbody>
                {variants.map((v) => (
                  <tr key={v.id} className="border-b border-border last:border-0">
                    <td className="py-2 pr-4">{v.size_label}</td>
                    <td className="py-2 pr-4">{v.chest_cm ?? "—"} cm</td>
                    <td className="py-2 pr-4">{v.waist_cm ?? "—"} cm</td>
                    <td className="py-2">
                      {v.stock > 0 ? (
                        v.stock
                      ) : (
                        <span className="text-red-500">Rupture</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="md:col-span-2">
        <ReviewSection productId={product.id} />
      </div>
    </div>
  );
}
