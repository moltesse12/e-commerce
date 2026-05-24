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
  guide: string;
  unit: string;
  min: number;
  max: number;
  step: number;
  default: number;
};

const FIELDS: Field[] = [
  { key: "height_cm", label: "Taille", guide: "Debout, dos au mur. Du sommet du crâne au sol.", unit: "cm", min: 100, max: 250, step: 1, default: 175 },
  { key: "weight_kg", label: "Poids", guide: "Le matin à jeun, sans vêtements.", unit: "kg", min: 30, max: 200, step: 0.5, default: 75 },
  { key: "chest_cm", label: "Tour de poitrine", guide: "Mètre ruban sous les aisselles, niveau pectoraux.", unit: "cm", min: 50, max: 180, step: 1, default: 100 },
  { key: "waist_cm", label: "Tour de taille", guide: "Au niveau du nombril, sans serrer.", unit: "cm", min: 40, max: 160, step: 1, default: 85 },
  { key: "hips_cm", label: "Tour de hanches", guide: "Partie la plus large des hanches, pieds joints.", unit: "cm", min: 50, max: 180, step: 1, default: 95 },
  { key: "inseam_cm", label: "Entrejambe", guide: "De l'entrejambe au sol, le long de la jambe.", unit: "cm", min: 40, max: 120, step: 1, default: 80 },
];

const MEASUREMENT_TIPS = [
  "Utilisez un mètre ruban de couturière (pas un mètre de chantier)",
  "Portez des vêtements légers et ajustés pendant la mesure",
  "Tenez-vous droit, respiration normale",
  "Si vous hésitez entre deux valeurs, prenez la plus grande",
];

export function MeasurementForm({ existing }: Props) {
  const [values, setValues] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    for (const f of FIELDS) {
      init[f.key] = existing?.[f.key]?.toString() ?? "";
    }
    return init;
  });
  const [showGuide, setShowGuide] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  function getNum(key: string): number {
    const v = parseFloat(values[key]);
    return isNaN(v) ? 0 : v;
  }

  function handleSlider(key: string, raw: string) {
    const num = parseFloat(raw);
    if (isNaN(num) || num < 0) return;
    setValues({ ...values, [key]: raw });
  }

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
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <button
        type="button"
        onClick={() => setShowGuide(!showGuide)}
        className="flex items-center gap-2 text-xs font-medium text-accent"
        aria-expanded={showGuide}
      >
        <svg className={`h-4 w-4 transition-transform ${showGuide ? "rotate-90" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        {showGuide ? "Masquer le guide" : "Comment bien mesurer ?"}
      </button>

      {showGuide && (
        <div className="rounded-lg border border-info/20 bg-info/10 p-4" role="region" aria-label="Guide de mesure">
          <p className="mb-3 text-xs font-semibold text-info">Conseils avant de commencer</p>
          <ul className="space-y-1.5">
            {MEASUREMENT_TIPS.map((tip) => (
              <li key={tip} className="flex items-start gap-2 text-xs text-text">
                <span className="mt-0.5 text-info">●</span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {FIELDS.map((f) => {
          const num = getNum(f.key);
          const hasValue = values[f.key] !== "";
          return (
            <div key={f.key} className={f.key === "weight_kg" ? "" : ""}>
              <label className="flex items-baseline justify-between text-xs font-medium text-text">
                <span>
                  {f.label}
                  <span className="text-text-muted"> ({f.unit})</span>
                </span>
                <span className="font-semibold font-mono text-accent">
                  {hasValue ? num : "—"}
                </span>
              </label>
              <input
                type="range"
                min={f.min}
                max={f.max}
                step={f.step}
                value={hasValue ? Math.min(Math.max(num, f.min), f.max) : f.default}
                onChange={(e) => handleSlider(f.key, e.target.value)}
                className="mt-2 h-1.5 w-full cursor-pointer appearance-none rounded-full bg-border accent-accent"
                aria-label={`${f.label} en ${f.unit}`}
                aria-describedby={`guide-${f.key}`}
              />
              <div className="mt-1 flex justify-between text-[10px] text-text-muted">
                <span>{f.min}</span>
                <span>{f.max}</span>
              </div>
              <p id={`guide-${f.key}`} className="mt-0.5 text-[11px] text-text-muted">
                {f.guide}
              </p>
            </div>
          );
        })}
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-accent px-6 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        aria-label={saving ? "Enregistrement en cours" : "Enregistrer les mesures"}
      >
        {saving ? "Enregistrement..." : "Enregistrer"}
      </button>

      {saved && (
        <p className="text-sm font-medium text-success" role="status">
          Mesures enregistrées ✓
        </p>
      )}
    </div>
  );
}
