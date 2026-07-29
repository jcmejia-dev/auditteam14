import "server-only";

const LOCAL_SITE_URL = "http://localhost:3000";

function parseSiteOrigin(value: string, variableName: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${variableName} must be a valid absolute URL.`);
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    throw new Error(`${variableName} must use HTTP or HTTPS.`);
  }

  if (
    url.protocol === "http:" &&
    url.hostname !== "localhost" &&
    url.hostname !== "127.0.0.1"
  ) {
    throw new Error(`${variableName} must use HTTPS outside local development.`);
  }

  if (url.username || url.password) {
    throw new Error(`${variableName} must not contain credentials.`);
  }

  if (
    url.pathname !== "/" ||
    url.search.length > 0 ||
    url.hash.length > 0
  ) {
    throw new Error(
      `${variableName} must contain only the site origin without a path, query, or fragment.`,
    );
  }

  return new URL(url.origin);
}

export function getSiteUrl() {
  const configuredSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredSiteUrl) {
    return parseSiteOrigin(configuredSiteUrl, "NEXT_PUBLIC_SITE_URL");
  }

  const vercelHostname = process.env.VERCEL_URL?.trim();

  if (vercelHostname) {
    return parseSiteOrigin(`https://${vercelHostname}`, "VERCEL_URL");
  }

  return new URL(LOCAL_SITE_URL);
}
