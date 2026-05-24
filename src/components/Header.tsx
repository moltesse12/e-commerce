import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold text-primary">
          MORPHO
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-gray-600">
          <Link href="/products">Catalogue</Link>
          <Link href="/account">Mon compte</Link>
          <Link href="/cart">Panier</Link>
        </nav>
      </div>
    </header>
  );
}
