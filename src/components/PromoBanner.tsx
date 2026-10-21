"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

export function PromoBanner({ text }: { text?: string }) {
  const [hidden, setHidden] = useState(true);
  const key = `promo-dismissed:${text}`;

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(key) === "1");
    } catch {
      setHidden(false);
    }
  }, [key]);

  if (!text || hidden) return null;

  const dismiss = () => {
    setHidden(true);
    try {
      localStorage.setItem(key, "1");
    } catch {}
  };

  return (
    <aside className="bg-steel-800 text-sm text-steel-50">
      <div className="shell flex items-center justify-between gap-3 py-2">
        <p className="flex-1 text-center">{text}</p>
        <button onClick={dismiss} className="rounded p-1 text-steel-200 hover:bg-white/10 hover:text-white" aria-label="Փակել">
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
