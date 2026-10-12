"use client";

import { useId } from "react";

export function Field({ label, value, onChange, help, multiline = false, maxLength, type = "text", placeholder, min, max, step, disabled = false }: {
  label: string; value: string | number; onChange: (value: string) => void; help?: string; multiline?: boolean;
  maxLength?: number; type?: string; placeholder?: string; min?: number; max?: number; step?: number | "any"; disabled?: boolean;
}) {
  const id = useId();
  const helpId = `${id}-help`;
  const props = { id, value, disabled, placeholder, maxLength, "aria-describedby": help ? helpId : undefined };
  return <label className="field" htmlFor={id}>
    {label}
    {multiline ? <textarea {...props} rows={3} onChange={(e) => onChange(e.target.value)} /> : <input {...props} type={type} min={min} max={max} step={step} onChange={(e) => onChange(e.target.value)} />}
    {help && <span className="field-help" id={helpId}>{help}</span>}
    {maxLength && <span className="char-count">{String(value).length}/{maxLength} belgi</span>}
  </label>;
}

export function Select<T extends string>({ label, value, options, onChange, help }: { label: string; value: T; options: readonly { value: T; label: string }[]; onChange: (value: T) => void; help?: string }) {
  return <label className="field">{label}<select value={value} onChange={(e) => onChange(e.target.value as T)}>{options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>{help && <span className="field-help">{help}</span>}</label>;
}

export function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className="check"><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />{label}</label>;
}

export function ListControls({ index, length, label, onMove, onRemove, removable = true }: { index: number; length: number; label: string; onMove: (from: number, to: number) => void; onRemove?: () => void; removable?: boolean }) {
  return <div className="mover">
    <button type="button" className="btn ghost small" disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label={`${label}: yuqoriga`}>↑ Yuqoriga</button>
    <button type="button" className="btn ghost small" disabled={index === length - 1} onClick={() => onMove(index, index + 1)} aria-label={`${label}: pastga`}>↓ Pastga</button>
    {onRemove && <button type="button" className="btn ghost small danger-text" disabled={!removable} onClick={onRemove} aria-label={`${label}: o‘chirish`}>O‘chirish</button>}
  </div>;
}

export function reordered<T>(items: T[], from: number, to: number): T[] {
  if (from < 0 || from >= items.length || to < 0 || to >= items.length || from === to) return items;
  const next = [...items];
  const [entry] = next.splice(from, 1);
  if (entry !== undefined) next.splice(to, 0, entry);
  return next;
}

export function sectionId(prefix = "bolim") {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}
