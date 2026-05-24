# MORPHO — Design System

## Brand

- **Nom** : MORPHO
- **Tagline** : Des vêtements qui vous vont vraiment
- **Ton** : Confiant, direct, chaleureux — jamais corporate
- **Public** : Hommes et femmes en Afrique, 18-45 ans, urbains, soucieux de leur apparence

## Typographie

- **Affichage** : `Inter` (Google Fonts), bold, tailles 32/40/48px
- **Corps** : `Inter`, regular/medium, 14/16px
- **Petit texte** : `Inter`, 12/13px
- **Mono** : `JetBrains Mono` pour données techniques (mesures, prix)
- **Échelle** : 12/13/14/16/18/20/24/32/40/48px

## Palette

```css
--color-primary: #1a1a2e;       /* Texte titres, fonds navbar */
--color-accent: #e94560;        /* CTA, prix, badges importants */
--color-surface: #f8f9fa;       /* Fond de page */
--color-white: #ffffff;         /* Fond cartes */
--color-border: #e2e8f0;       /* Bordures, séparateurs */
--color-text: #4a5568;         /* Texte corps */
--color-text-muted: #a0aec0;   /* Texte secondaire */
--color-success: #38a169;      /* Paiement confirmé, stock dispo */
--color-warning: #d69e2e;      /* Stock faible, avertissement */
--color-danger: #e53e3e;       /* Erreur, rupture stock */
--color-info: #3182ce;         /* Info morphologie similaire */
```

## Espacement

Échelle : 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 px

## Composants

### Button
- **Primary** : fond `--color-accent`, texte blanc, border-radius 8px, padding 12/24
- **Secondary** : bordure `--color-border`, fond blanc, texte `--color-primary`
- **Disabled** : opacité 50%
- **Taille** : 40px (small), 48px (default), 56px (large)
- **Hover** : darken 10%, pointer cursor
- **Mobile** : largeur 100% sur <640px pour les CTA

### Input / Textarea
- Bordure `--color-border`, border-radius 8px, padding 8/16
- Focus : bordure `--color-accent`
- Label : 13px, `--color-text`, espacement 4px en dessus
- Erreur : bordure `--color-danger`, message 12px `--color-danger`
- Placeholder : `--color-text-muted`

### Card
- Fond blanc, bordure `--color-border`, border-radius 8px
- Padding : 16/24/32 selon densité
- Hover card : shadow subtle (0 2px 8px rgba(0,0,0,0.06))

### Badge
- Border-radius 9999px, padding 4/12
- Variantes : success (green), warning (yellow), danger (red), info (blue)
- Taille : 12px medium

### Table
- Head : 13px semibold, `--color-text-muted`
- Body : 14px, `--color-text`
- Row hover : fond `--color-surface`
- Border : `--color-border` sous chaque ligne

### Header
- Hauteur : 56px (mobile), 64px (desktop)
- Logo : gauche, brand name bold
- Nav : droite, 14px links
- Backdrop mobile : white

## Layout
- **Max-width** : 1280px (max-w-7xl)
- **Side padding** : 16px (mobile), 32px (desktop)
- **Grid catalogue** : 2 cols (mobile), 3 cols (tablet), 4 cols (desktop)
- **Page produit** : 1 col (mobile), 2 cols (desktop 50/50)

## Ombres
- `shadow-sm` : `0 1px 2px rgba(0,0,0,0.05)`
- `shadow-md` : `0 4px 6px rgba(0,0,0,0.07)`
- `shadow-lg` : `0 10px 15px rgba(0,0,0,0.1)`

## Accessibilité
- **Contraste** : body text ≥ 4.5:1 sur fond blanc
- **Touch targets** : ≥ 44px
- **Focus** : outline 2px `--color-accent` sur tous les éléments interactifs
- **Labels** : tous les input ont un label visible (pas de placeholder-as-label)
- **Liens** : visited = underline + `--color-text-muted`

## Décisions Design (review 2026-05-24)

| Question | Décision | Statut |
|----------|----------|--------|
| Paiement Flutterwave | Modal in-app (pas redirection plein écran) | À implémenter |
| Notifications commande | Email seulement (V1) | À implémenter |
| UX mesures | Sliders avec guide (pas inputs libres) | Implémenté ✓ |
| Home "Comment ça marche" | Timeline verticale (pas 3 colonnes) | Implémenté ✓ |
| Loading states | Skeletons + spinners | Implémenté ✓ |
| Suivi post-achat | Page success avec promesse ajustement | Implémenté ✓ |
| Typographie | Inter (Google Fonts via next/font) | Implémenté ✓ |
| Images produit | Initiales sur gradient | Implémenté ✓ |
| Accessibilité | Skip-to-content + focus-visible | Implémenté ✓ |
