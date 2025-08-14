// /lib/use-object-url.ts
import { useEffect, useRef, useState } from "react";

/**
 * Creates a revokable object URL for a given Blob.
 * Ensures cleanup on unmount or when the Blob changes.
 */
export function useObjectURL(blob: Blob | null) {
  const [url, setUrl] = useState<string | null>(null);
  const prevUrlRef = useRef<string | null>(null);

  useEffect(() => {
    // Revoke old
    if (prevUrlRef.current) {
      URL.revokeObjectURL(prevUrlRef.current);
      prevUrlRef.current = null;
    }
    if (!blob) {
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(blob);
    prevUrlRef.current = next;
    setUrl(next);

    return () => {
      if (prevUrlRef.current) {
        URL.revokeObjectURL(prevUrlRef.current);
        prevUrlRef.current = null;
      }
    };
  }, [blob]);

  return url;
}
