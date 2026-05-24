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
        <p className="text-text-muted">Vérification du paiement...</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-red-500">Erreur</h1>
        <p className="mt-2 text-text">
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
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-2xl" role="status">
        <span className="text-green-700">✓</span>
      </div>
      <h1 className="text-2xl font-bold text-primary">Commande confirmée !</h1>
        <p className="mt-2 text-text">
          Merci pour votre commande. Vous recevrez une confirmation par email sous quelques minutes.
        </p>
        <div className="mx-auto mt-6 max-w-sm rounded-lg border border-info/20 bg-info/10 p-4 text-left text-sm text-text">
        <p className="font-medium text-info">Notre promesse ajustement</p>
        <p className="mt-1">
          Nous vérifierons que la taille recommandée correspond à votre morphologie.
          Si l&apos;écart est trop grand, nous vous contacterons avant expédition.
        </p>
      </div>
      <p className="mt-4 text-sm text-text-muted">Réf. {txRef}</p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link
          href="/account"
          className="rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white"
        >
          Voir mes commandes
        </Link>
        <Link
          href="/account"
          className="text-sm font-medium text-accent underline"
        >
          Vérifier ma recommandation taille
        </Link>
      </div>
    </div>
  );
}
