import { useCallback, useSyncExternalStore } from "react";

/** Media so'rov (serverda serverValue). Hydration xavfsiz. */
export function useMediaQuery(query: string, serverValue = false) {
  const subscribe = useCallback((cb: () => void) => {
    const m = matchMedia(query);
    m.addEventListener("change", cb);
    return () => m.removeEventListener("change", cb);
  }, [query]);
  return useSyncExternalStore(subscribe, () => matchMedia(query).matches, () => serverValue);
}

export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
