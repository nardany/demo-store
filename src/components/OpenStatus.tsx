"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

function yerevanNow() {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Yerevan",
    hour: "2-digit",
    minute: "2-digit",
    weekday: "short",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  return { day: days.indexOf(get("weekday")), minutes: Number(get("hour")) * 60 + Number(get("minute")) };
}

export function useOpenStatus() {
  const [state, setState] = useState<{ open: boolean; note: string } | null>(null);

  useEffect(() => {
    const update = () => {
      const { day, minutes } = yerevanNow();
      const open = toMinutes(site.hours.open);
      const close = toMinutes(site.hours.close);
      const workingDay = !site.hours.closedDays.includes(day);

      if (workingDay && minutes >= open && minutes < close) {
        const left = close - minutes;
        setState({ open: true, note: left <= 60 ? `կփակվի ${left} րոպեից` : `մինչև ${site.hours.close}` });
      } else {
        setState({ open: false, note: minutes < open && workingDay ? `կբացվի ${site.hours.open}-ին` : `վաղը ${site.hours.open}-ից` });
      }
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, []);

  return state;
}

export function OpenStatus({ className = "" }: { className?: string }) {
  const status = useOpenStatus();
  if (!status) return <span className={`inline-block h-5 ${className}`} />;

  return (
    <span className={`inline-flex items-center gap-2 text-sm ${className}`}>
      <span className="relative flex h-2.5 w-2.5">
        {status.open && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />}
        <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${status.open ? "bg-emerald-500" : "bg-stone-400"}`} />
      </span>
      <span className="font-semibold">{status.open ? "Բաց է" : "Փակ է"}</span>
      <span className="text-stone-500 dark:text-stone-400">· {status.note}</span>
    </span>
  );
}
