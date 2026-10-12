"use client";
import { createContext, useContext, useReducer, type Dispatch } from "react";
import { cases, sickAnimals } from "@/content/kasallik";
import { drugs, initialStock } from "@/content/ombor";
import { createReducer, initialDemoState, type Action, type DemoState, type Defs } from "@/lib/drug-store";

// "Molim kasal" va "Dori ombori" umumiy holati. Faqat sahifa xotirasida: qayta yuklanganda boshidan (TZ v3.1 §2.3).
export const demoDefs: Defs = { drugs, cases, initialStock };
const reducer = createReducer(demoDefs);

const first = sickAnimals.sigir.symptoms[0]!;
const init = (): DemoState =>
  reducer(initialDemoState(demoDefs), { type: "selectCase", caseId: first.id, weight: sickAnimals.sigir.weights[1]! });

const Ctx = createContext<{ state: DemoState; dispatch: Dispatch<Action> } | null>(null);

export function DemoStoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, init);
  return <Ctx.Provider value={{ state, dispatch }}>{children}</Ctx.Provider>;
}

export function useDemoStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error("DemoStoreProvider kerak");
  return v;
}
