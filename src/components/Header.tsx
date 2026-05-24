"use client";

import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold text-primary" aria-label="Accueil MORPHO">
          MORPHO
        </Link>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex min-h-11 min-w-11 items-center justify-center md:hidden"
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={menuOpen}
        >
          <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        <nav
          className={`absolute left-0 right-0 top-16 border-b border-border bg-white px-4 pb-4 pt-2 transition-all duration-300 ease-in-out md:static md:flex md:border-0 md:p-0 md:transition-none ${
            menuOpen
              ? "visible translate-y-0 opacity-100"
              : "invisible -translate-y-2 opacity-0"
          }`}
        >
          <div className="flex flex-col gap-4 text-sm font-medium text-text md:flex-row md:items-center md:gap-6">
            <Link
              href="/products"
              className="hover:text-primary md:hover:text-primary"
              onClick={() => setMenuOpen(false)}
            >
              Catalogue
            </Link>
            <Link
              href="/account"
              className="hover:text-primary md:hover:text-primary"
              onClick={() => setMenuOpen(false)}
            >
              Mon compte
            </Link>
            <Link
              href="/cart"
              className="hover:text-primary md:hover:text-primary"
              onClick={() => setMenuOpen(false)}
            >
              Panier
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
