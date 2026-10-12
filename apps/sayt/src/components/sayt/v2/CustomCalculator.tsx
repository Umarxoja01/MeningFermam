"use client";
import { evaluateFormula, type CmsTool } from "@meningfermam/content";
import { useId, useState } from "react";

/** Admin yaratgan hisoblagich: matn va sonlar; hech qanday kiritilgan kod bajarilmaydi. */
export function CustomCalculator({ tool }: { tool: CmsTool }) {
  const id = useId();
  const [values, setValues] = useState<Record<string, string>>({});
  const variables: Record<string, number> = Object.create(null);
  const errors: Record<string, string> = {};
  for (const field of tool.inputs) {
    const raw = values[field.key] ?? String(field.defaultValue);
    const value = Number(raw);
    if (!raw.trim() || !Number.isFinite(value)) errors[field.key] = "Son kiriting.";
    else if (value < field.min || value > field.max) errors[field.key] = `${field.min} dan ${field.max} gacha son kiriting.`;
    else variables[field.key] = value;
  }
  let result: number | null = null;
  let error = "";
  if (Object.keys(errors).length) error = "Hisoblash uchun barcha maydonlarni to‘g‘ri to‘ldiring.";
  else {
    try { result = evaluateFormula(tool.formula, variables); }
    catch (e) { error = e instanceof Error ? e.message : "Hisoblashda xato yuz berdi."; }
  }
  const format = new Intl.NumberFormat("uz-UZ", { maximumFractionDigits: 2 });

  return (
    <div className="custom-calculator calc">
      <h3>{tool.title}</h3>
      {tool.description && <p>{tool.description}</p>}
      <div className="custom-calculator-inputs">
        {tool.inputs.map((field) => (
          <div className="fld" key={field.key}>
            <label htmlFor={`${id}-${field.key}`}>{field.label}{field.unit ? ` (${field.unit})` : ""}</label>
            <input id={`${id}-${field.key}`} type="number" inputMode="decimal" min={field.min} max={field.max} step={field.step}
              value={values[field.key] ?? String(field.defaultValue)}
              onChange={(e) => setValues((old) => ({ ...old, [field.key]: e.target.value }))}
              aria-invalid={!!errors[field.key]} aria-describedby={errors[field.key] ? `${id}-${field.key}-error` : undefined} />
            {errors[field.key] && <p className="err" id={`${id}-${field.key}-error`}>{errors[field.key]}</p>}
          </div>
        ))}
      </div>
      <div className="out" aria-live="polite" aria-atomic="true">
        {error ? <p className="err">{error}</p> : <p><span>{tool.resultLabel}: </span><strong>{format.format(result!)}{tool.resultUnit ? ` ${tool.resultUnit}` : ""}</strong></p>}
      </div>
    </div>
  );
}
