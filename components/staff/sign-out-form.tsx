import { signOutAction } from "@/app/staff/actions";

export function SignOutForm({
  emphasis = "secondary",
}: {
  emphasis?: "secondary" | "primary";
}) {
  return (
    <form action={signOutAction}>
      <button
        type="submit"
        className={
          emphasis === "primary"
            ? "inline-flex min-h-12 items-center justify-center rounded-sm bg-navy-900 px-6 py-3 font-bold text-white transition-colors hover:bg-teal-700"
            : "inline-flex min-h-11 items-center justify-center rounded-sm border border-navy-900/25 bg-white px-5 py-2.5 font-bold text-navy-900 transition-colors hover:border-teal-700 hover:text-teal-700"
        }
      >
        Sign out
      </button>
    </form>
  );
}
