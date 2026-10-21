"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Copy, X } from "lucide-react";
import { site, viberLink } from "@/lib/site";

export function ViberButton({ className = "", children = "Գրել Viber-ով" }: { className?: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (!mobile) {
      e.preventDefault();
      setOpen(true);
      return;
    }
    const leftPage = () => clearTimeout(timer.current);
    document.addEventListener("visibilitychange", leftPage, { once: true });
    timer.current = setTimeout(() => {
      document.removeEventListener("visibilitychange", leftPage);
      if (document.visibilityState === "visible") setOpen(true);
    }, 1500);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.phoneRaw);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <>
      <a href={viberLink} onClick={onClick} className={className}>{children}</a>

      {open && (
        <div role="dialog" aria-modal="true" aria-label="Viber" className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center" onClick={() => setOpen(false)}>
          <div className="card w-full max-w-sm bg-white p-6 dark:bg-steel-950" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-lg">Գրեք մեզ Viber-ով</h2>
              <button onClick={() => setOpen(false)} className="rounded p-1 text-stone-400 hover:text-ink dark:hover:text-stone-100" aria-label="Փակել">
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
              Եթե Viber-ը չբացվեց, ավելացրեք համարը Viber-ում կամ գրեք հեռախոսից։
            </p>
            <div className="mt-4 flex items-center justify-between gap-3 rounded-md border border-stone-200 px-4 py-3 dark:border-steel-800">
              <span className="text-lg font-semibold">{site.phone}</span>
              <button onClick={copy} className="btn-ghost px-3 py-1.5 text-xs">
                {copied ? <><Check className="h-3.5 w-3.5" />Պատճենվեց</> : <><Copy className="h-3.5 w-3.5" />Պատճենել</>}
              </button>
            </div>
            <a href={viberLink} className="btn-primary mt-3 w-full py-2.5">Բացել Viber-ը</a>
          </div>
        </div>
      )}
    </>
  );
}
