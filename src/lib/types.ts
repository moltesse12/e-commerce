export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  slug: string;
  base_price: number;
  images: string[];
  is_active: boolean;
  tags: string[];
  category?: Category;
}

export interface ProductVariant {
  id: string;
  product_id: string;
  size_label: string;
  stock: number;
  sku: string;
  chest_cm: number | null;
  length_cm: number | null;
  shoulder_cm: number | null;
  waist_cm: number | null;
  sleeve_cm: number | null;
  neck_cm: number | null;
  weight_min_kg: number | null;
  weight_max_kg: number | null;
}

export interface Review {
  id: string;
  product_id: string;
  rating: number;
  fit_rating: "small" | "true" | "large" | null;
  size_purchased: string | null;
  reviewer_height_cm: number | null;
  reviewer_weight_kg: number | null;
  comment: string | null;
  created_at: string;
}
