"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCart, updateQuantity, removeFromCart, cartTotal } from "@/lib/cart";
import type { CartItem } from "@/lib/cart";
import Link from "next/link";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    setItems(getCart());
  }, []);

  function refresh() {
    setItems([...getCart()]);
  }

  if (items.length === 0) {
    return (
      <div className="py-12 text-center">
        <h1 className="text-2xl font-bold text-primary">Votre panier est vide</h1>
        <Link
          href="/products"
          className="mt-4 inline-block text-accent underline"
        >
          Voir le catalogue
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-primary">Panier</h1>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.variantId}
            className="flex items-center justify-between rounded-lg border border-border bg-white p-4"
          >
            <div>
              <p className="font-medium text-primary">{item.name}</p>
              <p className="text-sm text-text-muted">Taille : {item.sizeLabel}</p>
              <p className="text-sm font-semibold text-accent">
                {item.price.toLocaleString()} FCFA
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  updateQuantity(item.variantId, -1);
                  refresh();
                }}
                className="rounded border border-border px-2 py-1 text-sm"
                aria-label={`Diminuer quantité de ${item.name}`}
              >
                -
              </button>
              <span className="w-6 text-center text-sm" aria-live="polite">{item.quantity}</span>
              <button
                onClick={() => {
                  updateQuantity(item.variantId, 1);
                  refresh();
                }}
                className="rounded border border-border px-2 py-1 text-sm"
                aria-label={`Augmenter quantité de ${item.name}`}
              >
                +
              </button>
              <button
                onClick={() => {
                  removeFromCart(item.variantId);
                  refresh();
                }}
                className="ml-2 text-sm text-red-500"
                aria-label={`Supprimer ${item.name} du panier`}
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-border bg-white p-4">
        <div className="flex items-center justify-between text-lg font-semibold">
          <span>Total</span>
          <span className="text-accent">
            {cartTotal(items).toLocaleString()} FCFA
          </span>
        </div>
      </div>

      <button
        onClick={() => router.push("/checkout")}
        className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-white"
      >
        Commander
      </button>
    </div>
  );
}
