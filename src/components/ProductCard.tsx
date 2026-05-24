import Link from "next/link";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group rounded-lg border border-border bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className="aspect-square rounded-md bg-gray-100" />
      <div className="mt-3">
        <p className="text-xs text-gray-500">{product.category?.name}</p>
        <h3 className="font-medium text-primary">{product.name}</h3>
        <p className="mt-1 font-semibold text-accent">
          {product.base_price.toLocaleString()} FCFA
        </p>
      </div>
    </Link>
  );
}
