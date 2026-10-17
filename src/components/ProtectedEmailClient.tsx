"use client";

import { useEffect, useState } from "react";

function decode(encoded: string): string {
  const bytes = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
  return [...new TextDecoder().decode(bytes)].reverse().join("");
}

export function ProtectedEmailClient({
  encoded,
  fallback,
  className,
}: {
  encoded: string;
  fallback: string;
  className?: string;
}) {
  const [address, setAddress] = useState<string | null>(null);
  // Nach dem Hydrieren dekodieren: das ausgelieferte HTML enthält nur den lesbaren Fallback.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setAddress(decode(encoded)), [encoded]);

  if (!address) return <span className={className}>{fallback}</span>;
  return (
    <a href={`mailto:${address}`} className={className}>
      {address}
    </a>
  );
}
