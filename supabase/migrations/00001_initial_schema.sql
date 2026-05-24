-- ============================================================
-- E-commerce Afrique — Initial Schema
-- ============================================================

-- 1. Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name TEXT NOT NULL,
    description TEXT,
    slug TEXT NOT NULL UNIQUE,
    base_price INTEGER NOT NULL CHECK (base_price > 0),
    images JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN NOT NULL DEFAULT true,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Product variants (sizes / stock / reference measurements)
CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size_label TEXT NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    sku TEXT NOT NULL UNIQUE,
    -- reference measurements (cm)
    chest_cm DECIMAL(5,1),
    length_cm DECIMAL(5,1),
    shoulder_cm DECIMAL(5,1),
    waist_cm DECIMAL(5,1),
    sleeve_cm DECIMAL(5,1),
    neck_cm DECIMAL(5,1),
    -- weight range (kg)
    weight_min_kg DECIMAL(5,1),
    weight_max_kg DECIMAL(5,1),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. User measurements
CREATE TABLE user_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    height_cm DECIMAL(5,1),
    weight_kg DECIMAL(5,1),
    chest_cm DECIMAL(5,1),
    waist_cm DECIMAL(5,1),
    hips_cm DECIMAL(5,1),
    inseam_cm DECIMAL(5,1),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_active_measurement UNIQUE (user_id) DEFERRABLE INITIALLY DEFERRED
);

-- 5. Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
    status TEXT NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'paid', 'processing', 'shipped', 'delivered', 'returned', 'cancelled')),
    total_cfa INTEGER NOT NULL CHECK (total_cfa > 0),
    payment_method TEXT,
    payment_ref TEXT,
    shipping_name TEXT NOT NULL,
    shipping_phone TEXT NOT NULL,
    shipping_city TEXT NOT NULL,
    shipping_address TEXT NOT NULL,
    tracking_info TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Order items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_cfa INTEGER NOT NULL CHECK (unit_price_cfa > 0)
);

-- 7. Reviews (morphology-aware)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL UNIQUE REFERENCES order_items(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    fit_rating TEXT CHECK (fit_rating IN ('small', 'true', 'large')),
    size_purchased TEXT,
    reviewer_height_cm DECIMAL(5,1),
    reviewer_weight_kg DECIMAL(5,1),
    comment TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Profiles (extends auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    country TEXT NOT NULL DEFAULT 'sn'
        CHECK (country IN ('sn', 'ci', 'cm', 'ml', 'bf', 'ne', 'tg', 'bj')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Indexes
-- ============================================================
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_active ON products(is_active) WHERE is_active = true;
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_measurements_user ON user_measurements(user_id) WHERE is_active = true;

-- ============================================================
-- Non-public RLS helper (profiles are public)
-- ============================================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Public read for catalogue
CREATE POLICY "Catalogue public read" ON categories FOR SELECT USING (true);
CREATE POLICY "Catalogue public read" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Variants public read" ON product_variants FOR SELECT
    USING (EXISTS (SELECT 1 FROM products WHERE products.id = product_variants.product_id AND products.is_active = true));

-- Profiles: public read, owner write
CREATE POLICY "Profiles public read" ON profiles FOR SELECT USING (true);
CREATE POLICY "Profiles own insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Profiles own update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Orders: owner read, admin all
CREATE POLICY "Orders own select" ON orders FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Orders own insert" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Order items: owner via order
CREATE POLICY "Order items own select" ON order_items FOR SELECT
    USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- Reviews: public read, owner write
CREATE POLICY "Reviews public read" ON reviews FOR SELECT USING (true);
CREATE POLICY "Reviews own insert" ON reviews FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Measurements: owner r/w
CREATE POLICY "Measurements own all" ON user_measurements
    FOR ALL USING (auth.uid() = user_id);

-- ============================================================
-- Auto-create profile on signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, phone)
    VALUES (new.id, new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'phone');
    RETURN new;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
