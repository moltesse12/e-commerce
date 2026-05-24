ALTER TABLE profiles ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;

CREATE POLICY "Admin full access orders" ON orders FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

CREATE POLICY "Admin full access reviews" ON reviews FOR ALL
    USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
