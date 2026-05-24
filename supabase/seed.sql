-- ============================================================
-- Seed data pour développement
-- ============================================================

-- Catégories
INSERT INTO categories (name, slug, description) VALUES
  ('T-shirts', 't-shirts', 'T-shirts et débardeurs'),
  ('Chemises', 'chemises', 'Chemises casual et habillées'),
  ('Pantalons', 'pantalons', 'Pantalons et jeans'),
  ('Chaussures', 'chaussures', 'Chaussures hommes et femmes');

-- Produits : T-shirts
WITH p AS (
  INSERT INTO products (category_id, name, description, slug, base_price, tags)
  VALUES
    ((SELECT id FROM categories WHERE slug = 't-shirts'), 'T-shirt coton classique', 'T-shirt en coton bio, coupe droite, idéal pour le climat tropical', 't-shirt-coton-classique', 8500, ARRAY['coton', 'basique']),
    ((SELECT id FROM categories WHERE slug = 't-shirts'), 'T-shirt sport respirant', 'T-shirt technique à séchage rapide, parfait pour le sport', 't-shirt-sport-respirant', 12000, ARRAY['sport', 'technique']),
    ((SELECT id FROM categories WHERE slug = 'chemises'), 'Chemise lin légère', 'Chemise en lin 100%, coupe ajustée, idéale pour la chaleur', 'chemise-lin-legere', 18500, ARRAY['lin', 'élégant']),
    ((SELECT id FROM categories WHERE slug = 'pantalons'), 'Pantalon chino regular', 'Pantalon chino en coton stretch, confortable et élégant', 'pantalon-chino-regular', 22000, ARRAY['coton', 'habillé']),
    ((SELECT id FROM categories WHERE slug = 'pantalons'), 'Jean coupe droite', 'Jean en denim 100% coton, coupe droite confortable', 'jean-coupe-droite', 25000, ARRAY['denim', 'décontracté']),
    ((SELECT id FROM categories WHERE slug = 'chaussures'), 'Baskets cuir blanc', 'Baskets en cuir blanc, semelle amortie', 'baskets-cuir-blanc', 32000, ARRAY['cuir', 'sport'])
  RETURNING id, slug
)
-- Variantes : T-shirt coton (S/M/L/XL)
INSERT INTO product_variants (product_id, size_label, stock, sku, chest_cm, length_cm, shoulder_cm, waist_cm, sleeve_cm, neck_cm, weight_min_kg, weight_max_kg)
SELECT p.id, s.size, s.stock, p.slug || '-' || s.size, s.chest, s.length, s.shoulder, s.waist, s.sleeve, s.neck, s.w_min, s.w_max
FROM p
CROSS JOIN (VALUES
  ('S', 20, 88, 68, 42, 76, 20, 37, 55, 65),
  ('M', 30, 96, 70, 44, 82, 21, 39, 65, 75),
  ('L', 25, 104, 72, 46, 88, 22, 41, 75, 85),
  ('XL', 15, 112, 74, 48, 94, 23, 43, 85, 95)
) AS s(size, stock, chest, length, shoulder, waist, sleeve, neck, w_min, w_max)
WHERE p.slug IN ('t-shirt-coton-classique', 't-shirt-sport-respirant', 'chemise-lin-legere', 'pantalon-chino-regular', 'jean-coupe-droite');

-- Variantes : chaussures (pointures)
INSERT INTO product_variants (product_id, size_label, stock, sku)
SELECT p.id, s.pointure, s.stock, p.slug || '-' || s.pointure
FROM (SELECT id, slug FROM products WHERE slug = 'baskets-cuir-blanc') p
CROSS JOIN (VALUES ('40', 10), ('41', 15), ('42', 20), ('43', 18), ('44', 12), ('45', 8)) AS s(pointure, stock);

-- 1er admin : toi (remplace l'email par le tien)
UPDATE profiles SET is_admin = true WHERE id = (SELECT id FROM auth.users WHERE email = 'follynelson12@gmail.com' LIMIT 1);
