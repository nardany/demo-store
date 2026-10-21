"use client";

import { useActionState } from "react";
import { loginAdmin } from "@/lib/actions/admin-actions";
import { Logo } from "@/components/Logo";
import { keepValuesSubmit } from "./useKeepValuesSubmit";

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAdmin, null);

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
      <div className="card w-full max-w-sm p-8">
        <div className="flex flex-col items-center text-center">
          <Logo size={56} />
          <h1 className="mt-4 text-xl">Ադմին մուտք</h1>
        </div>

        <form onSubmit={keepValuesSubmit(formAction)} className="mt-8 space-y-4">
          <div>
            <label htmlFor="email" className="label">Էլ. փոստ</label>
            <input id="email" type="email" name="email" required autoComplete="username" className="input" />
          </div>
          <div>
            <label htmlFor="password" className="label">Գաղտնաբառ</label>
            <input id="password" type="password" name="password" required autoComplete="current-password" className="input" />
          </div>
          <label className="flex items-center gap-2 text-sm text-stone-600 dark:text-stone-300">
            <input type="checkbox" name="remember" defaultChecked />
            Հիշել ինձ 30 օր
          </label>
          {state?.error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">{state.error}</p>}
          <button type="submit" disabled={isPending} className="btn-primary w-full">
            {isPending ? "Մուտք…" : "Մուտք գործել"}
          </button>
        </form>
      </div>
    </div>
  );
}
