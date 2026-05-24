import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Product } from "@/lib/types";
import { ProductCard } from "@/components/ProductCard";

async function getBestSellers(): Promise<Product[]> {
  const { data } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_active", true)
    .limit(4);
  return (data as Product[]) ?? [];
}

export default async function Home() {
  const bestSellers = await getBestSellers();

  return (
    <div className="space-y-24">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary to-[#2a2a4e] px-8 py-16 text-white md:py-24 animate-fade-in-up">
        <div className="relative z-10 mx-auto max-w-2xl text-center">
          <span className="inline-block rounded-full bg-accent/30 px-4 py-1 text-xs font-medium text-white">
            Nouveau : Matching morphologique
          </span>
          <h1 className="mt-6 text-4xl font-bold leading-tight md:text-5xl">
            Entrez vos mesures, on trouve votre taille
          </h1>
          <p className="mt-4 text-lg text-text-muted">
            Plus de commandes à l&apos;aveugle. Notre algorithme compare votre
            morphologie aux vêtements pour une taille parfaite à tous les coups.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/account"
              className="w-full rounded-lg bg-accent px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
            >
              Prendre mes mesures
            </Link>
            <Link
              href="/products"
              className="w-full rounded-lg border border-white/30 px-8 py-3 text-sm font-semibold text-white transition-colors hover:border-white/60 sm:w-auto"
            >
              Voir le catalogue
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-2xl space-y-8 animate-fade-in-up delay-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary">Comment ça marche</h2>
          <p className="mt-2 text-text-muted">3 étapes pour ne plus jamais vous tromper de taille</p>
        </div>
        <div className="relative space-y-8 before:absolute before:left-4 before:top-3 before:h-[calc(100%-2rem)] before:w-0.5 before:bg-border max-md:before:hidden">
          {[
            {
              step: "1",
              title: "Prenez vos mesures",
              desc: "Taille, poids, tours de poitrine, taille, hanches et entrejambe. Un guide visuel vous aide à mesurer correctement.",
            },
            {
              step: "2",
              title: "Notre algorithme analyse",
              desc: "On compare vos mesures à nos vêtements et aux avis de profils similaires pour recommander la taille idéale.",
            },
            {
              step: "3",
              title: "Commandez en confiance",
              desc: "Paiement sécurisé par Orange Money, Wave ou carte. Livraison rapide partout au Sénégal.",
            },
          ].map((item) => (
            <div key={item.step} className="relative flex items-start gap-6">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-xs font-bold text-white max-md:static md:absolute md:-left-12">
                {item.step}
              </span>
              <div className="rounded-lg border border-border bg-white p-5">
                <h3 className="font-semibold text-primary">{item.title}</h3>
                <p className="mt-2 text-sm text-text-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {bestSellers.length > 0 && (
        <section className="space-y-8 animate-fade-in-up delay-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-primary">Nos produits</h2>
              <p className="text-sm text-text-muted">Sélectionnés pour vous</p>
            </div>
            <Link
              href="/products"
              className="text-sm font-medium text-accent hover:underline"
            >
              Voir tout →
            </Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {bestSellers.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <section className="rounded-lg border border-border bg-white p-8 text-center animate-fade-in-up delay-200">
        <h2 className="text-xl font-bold text-primary">Vous ne trouvez pas votre taille ?</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-muted">
          70% des hommes et femmes africains ne correspondent pas aux tailles standard.
          MORPHO est conçu pour vous, pas pour les mannequins européens.
        </p>
        <Link
          href="/account"
          className="mt-6 inline-block w-full rounded-lg bg-primary px-8 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 sm:w-auto"
        >
          Vérifier ma morphologie
        </Link>
      </section>
    </div>
  );
}
