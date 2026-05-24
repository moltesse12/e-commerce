"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCart, cartTotal } from "@/lib/cart";
import type { CartItem } from "@/lib/cart";

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const cart = getCart();
    if (cart.length === 0) {
      router.push("/cart");
      return;
    }
    setItems(cart);
  }, [router]);

  const total = cartTotal(items);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout/init", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, city, address, items, total }),
      });

      const data = await res.json();
      if (data.url) {
        localStorage.setItem(
          "morpho-pending-order",
          JSON.stringify({ name, phone, city, address, items, total, txRef: data.tx_ref })
        );
        window.location.href = data.url;
      } else {
        setError(data.error ?? "Erreur lors du paiement");
      }
    } catch {
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  }

  if (items.length === 0) return null;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-primary">Finaliser la commande</h1>

      <div className="rounded-lg border border-border bg-white p-4">
        <p className="text-lg font-semibold text-accent">
          Total : {total.toLocaleString()} FCFA
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-white p-6">
        <h2 className="font-semibold text-primary">Livraison</h2>

        <div>
          <label className="block text-sm font-medium text-gray-700">Nom complet</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Téléphone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
            placeholder="+221 77 123 45 67"
            className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Ville</label>
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-sm"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Adresse</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
            rows={2}
            className="mt-1 w-full rounded-lg border border-border px-4 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-accent px-6 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Redirection..." : `Payer ${total.toLocaleString()} FCFA`}
        </button>
      </form>
    </div>
  );
}
