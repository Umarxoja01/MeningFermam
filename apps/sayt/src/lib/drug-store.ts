// Dori ombori va davolash namunasi (TZ v3.1 §4.4, §4.5; K-01, Q11–Q13). Sof reducer, saqlanmaydi (§2.3).
// Qoidalar:
//  - "Bajarildi" oldidan kunning HAMMA dorilari tekshiriladi; bittasi yetmasa hech narsa ayirilmaydi (egasi: A varianti).
//  - Qoldiq hech qachon manfiy bo'lmaydi.
//  - Bitta amal (kurs + kun) faqat bir marta hisobdan chiqadi: takroriy yoki eskirgan bosish e'tiborsiz.
//  - Kurs faqat hamma kunlar to'liq bajarilganda tugaydi.
//  - Reset ombor bilan birga davolash kunini ham boshiga qaytaradi.

export type Unit = "ml" | "dona" | "namuna birligi";
export type DrugDef = { key: string; name: string; unit: Unit; /** 1 flakondagi ml (dona uchun 1) */ vial: number };
export type StockEntry = { closed: number; open: number };
export type Stock = Readonly<Record<string, StockEntry>>;

/** perKg = 0 bo'lsa amount qat'iy miqdor; aks holda amount ml har perKg kg vazn uchun. */
export type Rx = { drug: string; amount: number; perKg: number; note: string };
export type CaseDef = { id: string; days: number; rx: readonly Rx[]; /** Faqat ko'rsatilgan kunlarda namuna bosqichi bor. */ treatmentDays?: readonly number[] };

export type Defs = { drugs: Readonly<Record<string, DrugDef>>; cases: Readonly<Record<string, CaseDef>>; initialStock: Stock };

export type Course = { caseId: string; weight: number; day: number; done: readonly string[] };
export type Last =
  | { kind: "done"; parts: { drug: string; qty: number }[]; opened: string[]; finished: boolean }
  | { kind: "blocked" }
  | { kind: "reset" };
export type DemoState = { stock: Stock; course: Course | null; last: Last | null; hit: readonly string[]; /** har o'zgarishda +1 */ tick: number };

export type Action =
  | { type: "selectCase"; caseId: string; weight: number }
  | { type: "setWeight"; weight: number }
  | { type: "completeDay"; actionId: string }
  | { type: "addVial"; drug: string }
  | { type: "reset" };

export const total = (e: StockEntry, d: DrugDef) => e.closed * d.vial + e.open;

/** Vazn × ml / kg; namuna matematikasi, klinik tavsiya emas. "Kamida 1" — demo qoidasi (TZ §4.4). */
export const doseFor = (rx: Rx, weight: number) => (rx.perKg ? Math.max(1, Math.round((weight * rx.amount) / rx.perKg)) : rx.amount);

export type RxCheck = { rx: Rx; need: number; unit: Unit | null; have: number | null; ok: boolean };

/** Kunning har bir dorisi: kerak, bor (null = omborda umuman yo'q), yetadimi. */
export function checkDay(defs: Defs, stock: Stock, caseDef: CaseDef, weight: number): RxCheck[] {
  return caseDef.rx.map((rx) => {
    const need = doseFor(rx, weight);
    const def = defs.drugs[rx.drug];
    const entry = stock[rx.drug];
    if (!def || !entry) return { rx, need, unit: null, have: null, ok: false };
    const have = total(entry, def);
    return { rx, need, unit: def.unit, have, ok: have >= need };
  });
}

export const actionIdFor = (c: Course) => `${c.caseId}:${c.day}`;
export const treatmentDaysFor = (c: CaseDef) => c.treatmentDays ?? Array.from({ length: c.days }, (_, i) => i + 1);
export const isFinished = (defs: Defs, c: Course) => c.day > (defs.cases[c.caseId]?.days ?? 0);

/** Ombordan olish. Yetarliligi oldindan tekshirilgan bo'lishi shart. */
function take(e: StockEntry, d: DrugDef, qty: number): { entry: StockEntry; opened: boolean } {
  let { closed, open } = e;
  let q = qty;
  let opened = false;
  while (q > open && closed > 0) {
    q -= open;
    closed -= 1;
    open = d.vial;
    opened = d.unit === "ml";
  }
  return { entry: { closed, open: Math.max(0, open - q) }, opened };
}

export const initialDemoState = (defs: Defs): DemoState => ({ stock: defs.initialStock, course: null, last: null, hit: [], tick: 0 });

export function createReducer(defs: Defs) {
  function reducer(state: DemoState, action: Action): DemoState {
    switch (action.type) {
      case "selectCase": {
        if (state.course?.caseId === action.caseId) return state;
        const caseDef = defs.cases[action.caseId];
        if (!caseDef) return state;
        return { ...state, course: { caseId: action.caseId, weight: action.weight, day: treatmentDaysFor(caseDef)[0] ?? 1, done: [] }, last: null, hit: [] };
      }
      case "setWeight":
        return state.course ? { ...state, course: { ...state.course, weight: action.weight }, last: null } : state;
      case "completeDay": {
        const c = state.course;
        if (!c) return state;
        const caseDef = defs.cases[c.caseId];
        if (!caseDef || isFinished(defs, c)) return state;
        // eskirgan yoki takroriy bosish
        if (action.actionId !== actionIdFor(c) || c.done.includes(action.actionId)) return state;
        const checks = checkDay(defs, state.stock, caseDef, c.weight);
        if (!checks.length || checks.some((x) => !x.ok)) return { ...state, last: { kind: "blocked" }, hit: [] };
        const stock: Record<string, StockEntry> = { ...state.stock };
        const parts: { drug: string; qty: number }[] = [];
        const opened: string[] = [];
        for (const x of checks) {
          const def = defs.drugs[x.rx.drug]!;
          const r = take(stock[x.rx.drug]!, def, x.need);
          stock[x.rx.drug] = r.entry;
          parts.push({ drug: x.rx.drug, qty: x.need });
          if (r.opened) opened.push(x.rx.drug);
        }
        const nextDay = treatmentDaysFor(caseDef).find((day) => day > c.day) ?? caseDef.days + 1;
        const course: Course = { ...c, day: nextDay, done: [...c.done, action.actionId] };
        return { stock, course, last: { kind: "done", parts, opened, finished: isFinished(defs, course) }, hit: parts.map((p) => p.drug), tick: state.tick };
      }
      case "addVial": {
        const e = state.stock[action.drug];
        if (!e) return state;
        return { ...state, stock: { ...state.stock, [action.drug]: { ...e, closed: e.closed + 1 } }, hit: [action.drug] };
      }
      case "reset":
        return {
          stock: defs.initialStock,
          course: state.course ? { ...state.course, day: treatmentDaysFor(defs.cases[state.course.caseId]!)[0] ?? 1, done: [] } : null,
          last: { kind: "reset" },
          hit: [],
          tick: state.tick,
        };
    }
  }
  return (state: DemoState, action: Action): DemoState => {
    const next = reducer(state, action);
    return next === state ? state : { ...next, tick: state.tick + 1 };
  };
}
