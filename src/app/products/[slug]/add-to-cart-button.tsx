"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addToCart } from "@/lib/cart";
import type { ProductVariant } from "@/lib/types";

interface Props {
  variants: ProductVariant[];
  productId: string;
  productName: string;
  price: number;
}

export function AddToCartButton({ variants, productId, productName, price }: Props) {
  const [selected, setSelected] = useState<string>(
    variants.find((v) => v.stock > 0)?.size_label ?? ""
  );
  const [added, setAdded] = useState(false);
  const router = useRouter();

  const variant = variants.find((v) => v.size_label === selected);
  const outOfStock = variant ? variant.stock === 0 : true;

  function handleAdd() {
    if (!variant || outOfStock) return;
    addToCart({
      variantId: variant.id,
      productId,
      name: productName,
      sizeLabel: variant.size_label,
      price,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {variants.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-text">
            Taille
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {variants.map((v) => (
              <button
                key={v.id}
                onClick={() => setSelected(v.size_label)}
                className={`rounded-md border px-4 py-2 text-sm transition-colors ${
                  selected === v.size_label
                    ? "border-accent bg-accent text-white"
                    : "border-border"
                }`}
                aria-label={`Sélectionner taille ${v.size_label}${v.stock === 0 ? " (rupture de stock)" : ""}`}
                aria-pressed={selected === v.size_label}
              >
                {v.size_label}
                {v.stock === 0 && (
                  <span className="ml-1 text-xs opacity-60">(rupture)</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleAdd}
        disabled={outOfStock}
        className="w-full rounded-lg bg-accent px-6 py-3 font-semibold text-white disabled:opacity-50"
      >
        {added ? "Ajouté !" : outOfStock ? "Rupture de stock" : "Ajouter au panier"}
      </button>
    </div>
  );
}
