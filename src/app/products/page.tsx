import type { Metadata } from "next";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/ProductCard";
import type { Product } from "@/lib/types";

export const metadata: Metadata = {
  title: "Catalogue — MORPHO",
  description: "Vêtements et chaussures adaptés à votre morphologie",
};

async function getProducts(): Promise<Product[]> {
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  return (data as Product[]) ?? [];
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-primary">Catalogue</h1>
        <p className="text-sm text-gray-500">
          {products.length} produit{products.length !== 1 ? "s" : ""}
        </p>
      </div>
      {products.length === 0 ? (
        <p className="text-gray-500">Aucun produit pour le moment. Revenez bientôt.</p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
