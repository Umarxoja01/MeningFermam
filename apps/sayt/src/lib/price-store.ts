import { useSyncExternalStore } from "react";
import { STORAGE_KEY, browserStorage, clearPrices, defaultPrices, loadPrices, savePrices, type FeedKey, type Prices } from "./prices";

// Brauzerdagi yem narxlari uchun kichik do'kon (useSyncExternalStore). Serverda va birinchi renderda taxminiy narxlar,
// keyin saqlangan narxlar. Boshqa tabda o'zgarsa ham yangilanadi.

let storage: Storage | null | undefined;
let cache: Prices | null = null;
const listeners = new Set<() => void>();

const store = () => (storage === undefined ? (storage = browserStorage()) : storage);
const emit = () => listeners.forEach((l) => l());

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => { if (e.key === STORAGE_KEY || e.key === null) { cache = null; cb(); } };
  addEventListener("storage", onStorage);
  return () => { listeners.delete(cb); removeEventListener("storage", onStorage); };
}

const getPrices = () => (cache ??= loadPrices(store()));
const serverPrices = () => defaultPrices;

export function usePrices() {
  return useSyncExternalStore(subscribe, getPrices, serverPrices);
}

/** Xotira ishlaydimi (serverda true deb olinadi, ogohlantirish chiqmasin). */
export function useStorageAvailable() {
  return useSyncExternalStore(subscribe, () => store() !== null, () => true);
}

export function setPrice(k: FeedKey, v: number) {
  cache = { ...getPrices(), [k]: v };
  savePrices(store(), cache);
  emit();
}

export function resetPrices() {
  clearPrices(store());
  cache = defaultPrices;
  emit();
}
