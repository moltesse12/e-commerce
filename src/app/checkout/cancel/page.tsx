import Link from "next/link";

export default function CheckoutCancelPage() {
  return (
    <div className="py-20 text-center">
      <h1 className="text-2xl font-bold text-primary">Paiement annulé</h1>
      <p className="mt-2 text-gray-600">
        Le paiement a été annulé. Votre panier est toujours disponible.
      </p>
      <Link
        href="/cart"
        className="mt-6 inline-block rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white"
      >
        Retour au panier
      </Link>
    </div>
  );
}
