import Link from "next/link";

export default function Home() {
  return (
    <div className="space-y-16">
      <section className="py-16 text-center">
        <h1 className="text-4xl font-bold text-primary">
          Des vêtements qui vous vont vraiment
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
          Plus de commandes à l&apos;aveugle. Entrez vos mesures, on vous recommande
          la taille parfaite.
        </p>
        <Link
          href="/products"
          className="mt-8 inline-block rounded-lg bg-accent px-8 py-3 text-sm font-semibold text-white"
        >
          Voir le catalogue
        </Link>
      </section>

      <section className="grid gap-8 md:grid-cols-3">
        {[
          { title: "Mesurez-vous", desc: "6 mesures simples pour un ajustement parfait" },
          { title: "Recommandation", desc: "Notre algorithme trouve votre taille idéale" },
          { title: "Avis morphologiques", desc: "Comparez avec des profils similaires au vôtre" },
        ].map((item) => (
          <div key={item.title} className="rounded-lg border border-border bg-white p-6">
            <h3 className="font-semibold text-primary">{item.title}</h3>
            <p className="mt-2 text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
