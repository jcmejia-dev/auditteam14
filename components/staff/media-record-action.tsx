"use client";

import { useActionState } from "react";

import type { MediaActionState } from "@/app/staff/media/actions";

export function MediaRecordAction({
  action,
  confirmation,
  label,
  tone = "neutral",
}: {
  action: (
    state: MediaActionState,
    formData: FormData,
  ) => Promise<MediaActionState>;
  confirmation: string;
  label: string;
  tone?: "danger" | "neutral";
}) {
  const [state, formAction, pending] = useActionState(action, {
    message: null,
  });

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(confirmation)) {
          event.preventDefault();
        }
      }}
    >
      <button
        type="submit"
        disabled={pending}
        className={`inline-flex min-h-12 w-full items-center justify-center rounded-sm border px-5 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-60 ${
          tone === "danger"
            ? "border-red-700 text-red-700 hover:bg-red-700 hover:text-white"
            : "border-navy-900/25 text-navy-900 hover:bg-navy-900 hover:text-white"
        }`}
      >
        {pending ? "Working…" : label}
      </button>
      {state.message ? (
        <p role="alert" className="mt-3 text-sm font-semibold text-red-700">
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
