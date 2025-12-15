import { useEffect } from "react";

export function useHotkey(keyCombo: string, callback: () => void) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");

      const cmdOrCtrl =
        (isMac && e.metaKey) || (!isMac && e.ctrlKey);

      if (keyCombo === "cmd+k" && cmdOrCtrl && e.key.toLowerCase() === "k") {
        e.preventDefault();
        callback();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [keyCombo, callback]);
}
