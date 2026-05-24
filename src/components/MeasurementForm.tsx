"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface Props {
  existing: {
    id?: string;
    height_cm?: number | null;
    weight_kg?: number | null;
    chest_cm?: number | null;
    waist_cm?: number | null;
    hips_cm?: number | null;
    inseam_cm?: number | null;
  } | null;
}

type Field = {
  key: keyof NonNullable<Props["existing"]>;
  label: string;
  placeholder: string;
};

const FIELDS: Field[] = [
  { key: "height_cm", label: "Taille", placeholder: "175" },
  { key: "weight_kg", label: "Poids", placeholder: "75" },
  { key: "chest_cm", label: "Tour de poitrine", placeholder: "100" },
  { key: "waist_cm", label: "Tour de taille", placeholder: "85" },
  { key: "hips_cm", label: "Tour de hanches", placeholder: "95" },
  { key: "inseam_cm", label: "Entrejambe", placeholder: "80" },
];

export function MeasurementForm({ existing }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of FIELDS) {
      init[f.key] = existing?.[f.key]?.toString() ?? "";
    }
    return init;
  });
  const [saving, setSaving] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSave() {
    setSaving(true);

    const payload: Record<string, number | boolean> = {};
    for (const f of FIELDS) {
      const v = values[f.key];
      if (v) payload[f.key] = parseFloat(v);
    }
    payload.is_active = true;

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    if (existing?.id) {
      await supabase
        .from("user_measurements")
        .update(payload)
        .eq("id", existing.id);
    } else {
      await supabase
        .from("user_measurements")
        .insert({ ...payload, user_id: user.id });
    }

    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        {FIELDS.map((f) => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-gray-600">
              {f.label} (cm{/* cm or kg for weight */
              f.key === "weight_kg" ? "kg" : ""})
            </label>
            <input
              type="number"
              step="0.1"
              placeholder={f.placeholder}
              value={values[f.key]}
              onChange={(e) =>
                setValues({ ...values, [f.key]: e.target.value })
              }
              className="mt-1 w-full rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
        ))}
      </div>
      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </div>
  );
}
