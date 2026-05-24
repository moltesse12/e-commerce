"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function ProductsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="text-2xl font-bold text-primary">Catalogue indisponible</h1>
      <p className="max-w-sm text-text-muted">
        Impossible de charger le catalogue. Merci de réessayer.
      </p>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="rounded-lg border border-border px-6 py-3 text-sm font-semibold text-primary"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
