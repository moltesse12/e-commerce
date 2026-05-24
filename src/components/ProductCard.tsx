import Link from "next/link";
import type { Product } from "@/lib/types";

function ProductImage({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="flex aspect-square items-center justify-center rounded-md bg-gradient-to-br from-primary to-[#2a2a4e] text-2xl font-bold text-white/80">
      {initials}
    </div>
  );
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group rounded-lg border border-border bg-white p-4 transition-shadow hover:shadow-md"
    >
      <ProductImage name={product.name} />
      <div className="mt-3">
        <p className="text-xs text-text-muted">{product.category?.name}</p>
        <h3 className="font-medium text-primary">{product.name}</h3>
        <p className="mt-1 font-semibold font-mono text-accent">
          {product.base_price.toLocaleString()} FCFA
        </p>
      </div>
    </Link>
  );
}
