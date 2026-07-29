"use client";

import { useActionState } from "react";

import {
  loginAction,
  type LoginActionState,
} from "@/app/staff/actions";

const initialLoginState: LoginActionState = {
  message: null,
};

export function LoginForm() {
  const [state, action, isPending] = useActionState(
    loginAction,
    initialLoginState,
  );

  return (
    <form action={action} className="mt-8 space-y-6">
      {state.message ? (
        <div
          id="login-error"
          role="alert"
          className="border-l-4 border-patriot-red bg-red-50 px-4 py-3 text-base leading-6 text-red-900"
        >
          {state.message}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="email"
          className="block text-base font-bold text-navy-900"
        >
          Work email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          maxLength={254}
          required
          aria-describedby={state.message ? "login-error" : undefined}
          className="mt-2 min-h-13 w-full rounded-sm border border-navy-900/25 bg-white px-4 py-3 text-lg text-navy-950 shadow-inner transition-colors placeholder:text-slate-500 hover:border-navy-700 focus:border-teal-700"
          placeholder="name@example.gov.ph"
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-base font-bold text-navy-900"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          maxLength={1024}
          required
          aria-describedby={state.message ? "login-error" : undefined}
          className="mt-2 min-h-13 w-full rounded-sm border border-navy-900/25 bg-white px-4 py-3 text-lg text-navy-950 shadow-inner transition-colors hover:border-navy-700 focus:border-teal-700"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="inline-flex min-h-13 w-full items-center justify-center rounded-sm bg-navy-900 px-6 py-3 text-lg font-bold text-white shadow-[0_12px_28px_rgba(16,42,67,0.2)] transition-colors hover:bg-teal-700 disabled:cursor-wait disabled:bg-navy-700 disabled:text-navy-100"
      >
        {isPending ? "Signing in…" : "Sign in securely"}
      </button>

      <p className="text-sm leading-6 text-slate-600">
        Access is limited to authorized Audit Team 14 staff. Your account must
        have an active staff role.
      </p>
    </form>
  );
}
