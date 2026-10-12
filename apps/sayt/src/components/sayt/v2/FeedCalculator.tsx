"use client";
import { useId, useState } from "react";
import { yem } from "@/content/bosh";
import { animalKeys, animals, calculateFeed, type AnimalKey } from "@/lib/feed-calc";
import { resetPrices, setPrice, usePrices, useStorageAvailable } from "@/lib/price-store";
import { FEED_KEYS, PRICE_MAX, PRICE_MIN, PRICE_STEP, defaultPrices, feedNames, parsePriceInput, stepPrice, type FeedKey } from "@/lib/prices";
import { Tween } from "./Tween";

// Yem hisoblagichi (TZ v3.1 §4.3). Zot maydoni yo'q (Q04); prognoz yo'q (Q08).
// Narx: 0..100 000 butun son; yozish paytida bo'sh maydon hisobni buzmaydi; noto'g'ri qiymat rad etiladi va izoh chiqadi,
// maydondan chiqqanda oxirgi to'g'ri narx qaytadi; faqat narxlar localStorage'da; xotira ishlamasa sahifa ishlayveradi.
export function FeedCalculator() {
  const id = useId();
  const [animal, setAnimal] = useState<AnimalKey>("sigir");
  const [weight, setWeight] = useState(animals.sigir.defaultWeight);
  const [goal, setGoal] = useState(animals.sigir.defaultGoal);
  const prices = usePrices();
  const storageOk = useStorageAvailable();
  /** Faqat yozilayotgan maydonlar; qolganlari narxning o'zini ko'rsatadi. */
  const [drafts, setDrafts] = useState<Partial<Record<FeedKey, string>>>({});

  const a = animals[animal];
  const r = calculateFeed(animal, weight, goal, prices);

  const onInput = (k: FeedKey, raw: string) => {
    setDrafts((d) => ({ ...d, [k]: raw }));
    const parsed = parsePriceInput(raw);
    if (parsed.ok) setPrice(k, parsed.value);
  };
  const onBlur = (k: FeedKey) => setDrafts((d) => {
    const next = { ...d };
    delete next[k];
    return next;
  });
  const onStep = (k: FeedKey, delta: number) => {
    setPrice(k, stepPrice(prices[k], delta));
    onBlur(k);
  };
  const onReset = () => {
    resetPrices();
    setDrafts({});
  };
  const pickAnimal = (k: AnimalKey) => {
    setAnimal(k);
    setWeight(animals[k].defaultWeight);
    setGoal(animals[k].defaultGoal);
  };

  const rowKey = `${animal}-${weight}-${goal}`;
  return (
    <div className="tilt soft-tilt calc rv">
      <div className="fld" role="group" aria-labelledby={`${id}-a`}>
        <span id={`${id}-a`}>{yem.animal}</span>
        <div className="opts">
          {animalKeys.map((k) => <button key={k} type="button" aria-pressed={k === animal} onClick={() => pickAnimal(k)}>{animals[k].label}</button>)}
        </div>
      </div>
      <div className="fld" role="group" aria-labelledby={`${id}-w`}>
        <span id={`${id}-w`}>{yem.weight}</span>
        <div className="opts">
          {a.weights.map((w) => <button key={w} type="button" aria-pressed={w === weight} onClick={() => setWeight(w)}>{w} kg</button>)}
        </div>
      </div>
      <div className="fld" role="group" aria-labelledby={`${id}-g`}>
        <span id={`${id}-g`}>{a.goalLabel}</span>
        <div className="opts">
          {a.goals.map((g) => <button key={g.value} type="button" aria-pressed={g.value === goal} onClick={() => setGoal(g.value)}>{g.label}</button>)}
        </div>
      </div>
      <div className="out" aria-live="polite">
        <ul>
          {r.rows.map((row, n) => (
            <li key={`${rowKey}-${row.key}`} style={{ animationDelay: `${n * 0.05}s` }}><span>{feedNames[row.key]}</span><b>{row.amount}</b></li>
          ))}
          {r.salt > 0 && <li key={`${rowKey}-tuz`}><span>{yem.salt}</span><b>{r.salt} {yem.saltUnit}</b></li>}
        </ul>
        <div className="cost">
          <div><small>{yem.perDay}</small><b><Tween value={r.perDay} suffix=" so‘m" /></b></div>
          <div><small>{yem.perMonth}</small><b><Tween value={r.perMonth} prefix="~" suffix=" so‘m" /></b></div>
        </div>
      </div>
      <details className="prices">
        <summary>{yem.pricesSummary} <small>{yem.pricesHint}</small></summary>
        {FEED_KEYS.map((k) => {
          const name = feedNames[k];
          const draft = drafts[k];
          const parsed = draft === undefined ? null : parsePriceInput(draft);
          const err = !!parsed && !parsed.ok && parsed.reason === "invalid";
          return (
            <div key={k} className={`prow${prices[k] !== defaultPrices[k] ? " changed" : ""}`}>
              <label htmlFor={`${id}-p-${k}`}>{name}</label>
              <span className="pctl">
                <button type="button" aria-label={`${name} narxini ${PRICE_STEP} so‘mga kamaytirish`} disabled={prices[k] <= PRICE_MIN} onClick={() => onStep(k, -PRICE_STEP)}>−</button>
                <input
                  id={`${id}-p-${k}`}
                  inputMode="numeric"
                  autoComplete="off"
                  value={draft ?? String(prices[k])}
                  aria-invalid={err || undefined}
                  aria-describedby={`${id}-u-${k}${err ? ` ${id}-e-${k}` : ""}`}
                  onChange={(e) => onInput(k, e.target.value)}
                  onBlur={() => onBlur(k)}
                />
                <button type="button" aria-label={`${name} narxini ${PRICE_STEP} so‘mga oshirish`} disabled={prices[k] >= PRICE_MAX} onClick={() => onStep(k, PRICE_STEP)}>+</button>
                <small id={`${id}-u-${k}`}>{yem.priceUnit}</small>
              </span>
              {err && <p className="err" id={`${id}-e-${k}`} role="alert">{yem.priceError}</p>}
            </div>
          );
        })}
        {!storageOk && <p className="fine" role="status">{yem.priceNotSaved}</p>}
        <button type="button" className="reset" onClick={onReset}>{yem.pricesReset}</button>
      </details>
      <p className="fine">{yem.fine}</p>
    </div>
  );
}
