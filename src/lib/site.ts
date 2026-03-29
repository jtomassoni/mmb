export function getSiteName(): string {
  return process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "MIDNIGHT SMASHERS";
}

export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return "";
}

/** Shown on the home page and in marketing copy */
export const LAUNCH_DATE_SHORT = "April 9";
export const LAUNCH_DATE_FULL = "April 9, 2026";
