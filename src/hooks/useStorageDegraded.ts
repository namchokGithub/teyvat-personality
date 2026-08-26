import { useEffect, useState } from "react";

import { isStorageDegraded, STORAGE_DEGRADED_EVENT } from "../lib/safe-storage";

export function useStorageDegraded() {
  const [degraded, setDegraded] = useState(isStorageDegraded);

  useEffect(() => {
    const handle = () => setDegraded(true);
    window.addEventListener(STORAGE_DEGRADED_EVENT, handle);
    return () => window.removeEventListener(STORAGE_DEGRADED_EVENT, handle);
  }, []);

  return degraded;
}
