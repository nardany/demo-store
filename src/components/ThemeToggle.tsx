"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <span className="h-9 w-9" />;

  const dark = resolvedTheme === "dark";
  return (
    <button
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="rounded-md p-2 text-stone-600 transition-colors hover:bg-stone-200/60 hover:text-ink dark:text-stone-300 dark:hover:bg-steel-900 dark:hover:text-stone-50"
      aria-label={dark ? "Լուսավոր ռեժիմ" : "Մուգ ռեժիմ"}
      title={dark ? "Լուսավոր ռեժիմ" : "Մուգ ռեժիմ"}
    >
      {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
