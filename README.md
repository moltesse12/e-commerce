# MORPHO

E-commerce vêtements avec **matching taille intelligent** adapté aux morphologies africaines.

## Stack

- **Framework** : Next.js 15 (App Router)
- **Base de données** : Supabase (PostgreSQL + Auth + RLS)
- **Paiement** : Flutterwave (Wave, Orange Money, MoMo, Airtel Money, carte)
- **Styles** : Tailwind CSS v4
- **Tests** : Vitest

## Fonctionnalités

- Matching taille par distance euclidienne pondérée (poitrine, taille, épaules, etc.)
- Estimation à partir du poids et de la taille si mesures détaillées non fournies
- Avis clients avec contexte morphologique (taille/poids du reviewer)
- Panier localStorage, checkout avec paiement mobile africain
- Dashboard admin (commandes, produits, revenus)
- SEO (sitemap, robots, métadonnées Open Graph)

## Démarrer

```bash
npm install
npm run dev
```

Variables d'environnement requises dans `.env.local` :

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé anon Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé service_role Supabase (webhook) |
| `NEXT_PUBLIC_FLW_PUBLIC_KEY` | Clé publique Flutterwave |
| `FLW_SECRET_KEY` | Clé secrète Flutterwave |
| `FLW_ENCRYPTION_KEY` | Clé de chiffrement Flutterwave |
| `FLW_WEBHOOK_SECRET` | Secret webhook Flutterwave |
