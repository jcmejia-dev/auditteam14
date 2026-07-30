const SUPABASE_URL_VARIABLE = "NEXT_PUBLIC_SUPABASE_URL";
const SUPABASE_PUBLISHABLE_KEY_VARIABLE =
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY";

function readRequiredPublicVariable(
  name: typeof SUPABASE_URL_VARIABLE | typeof SUPABASE_PUBLISHABLE_KEY_VARIABLE,
  value: string | undefined,
) {
  const normalizedValue = value?.trim();

  if (!normalizedValue) {
    throw new Error(
      `Missing ${name}. Add it to the local or hosted environment configuration.`,
    );
  }

  return normalizedValue;
}

export function getSupabaseEnvironment() {
  const url = readRequiredPublicVariable(
    SUPABASE_URL_VARIABLE,
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
  const publishableKey = readRequiredPublicVariable(
    SUPABASE_PUBLISHABLE_KEY_VARIABLE,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  );

  let parsedUrl: URL;

  try {
    parsedUrl = new URL(url);
  } catch {
    throw new Error(
      `${SUPABASE_URL_VARIABLE} must be a valid absolute URL.`,
    );
  }

  if (parsedUrl.protocol !== "https:" && parsedUrl.hostname !== "localhost") {
    throw new Error(
      `${SUPABASE_URL_VARIABLE} must use HTTPS outside local development.`,
    );
  }

  if (!publishableKey.startsWith("sb_publishable_")) {
    throw new Error(
      `${SUPABASE_PUBLISHABLE_KEY_VARIABLE} must contain a Supabase publishable key, never a secret or service-role key.`,
    );
  }

  return { url, publishableKey } as const;
}
