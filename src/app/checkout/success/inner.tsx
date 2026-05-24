"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

export function CheckoutSuccessInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const txRef = searchParams.get("tx_ref");
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");

  useEffect(() => {
    if (!txRef) {
      router.push("/");
      return;
    }

    async function verify() {
      try {
        const pending = localStorage.getItem("morpho-pending-order");
        const res = await fetch("/api/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            tx_ref: txRef,
            order: pending ? JSON.parse(pending) : null,
          }),
        });

        const data = await res.json();
        if (data.ok) {
          localStorage.removeItem("morpho-cart");
          localStorage.removeItem("morpho-pending-order");
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    }

    verify();
  }, [txRef, router]);

  if (status === "verifying") {
    return (
      <div className="py-20 text-center">
        <p className="text-gray-500">Vérification du paiement...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-red-500">Erreur</h1>
        <p className="mt-2 text-gray-600">
          Une erreur est survenue. Contactez-nous avec la réf. {txRef}.
        </p>
        <Link href="/" className="mt-4 inline-block text-accent underline">
          Retour à l&apos;accueil
        </Link>
      </div>
    );
  }

  return (
    <div className="py-20 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl">
        ✓
      </div>
      <h1 className="text-2xl font-bold text-primary">Paiement confirmé !</h1>
      <p className="mt-2 text-gray-600">
        Merci pour votre commande. Vous recevrez une confirmation par email.
      </p>
      <p className="mt-1 text-sm text-gray-500">Réf. {txRef}</p>
      <Link
        href="/account"
        className="mt-6 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white"
      >
        Voir mes commandes
      </Link>
    </div>
  );
}
