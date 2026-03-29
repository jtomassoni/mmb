import { getSiteUrl } from "./site";

/** Default meta description — keep in sync with layout / home metadata. */
export const DEFAULT_DESCRIPTION =
  "Launching April 9, 2026. Minority woman-owned late-night smash burgers for delivery around Littleton, Englewood, Sheridan & south Denver. Order on Uber Eats or DoorDash when we open.";

/** Social / Open Graph image — link previews (SMS, Slack, social). */
export const OG_IMAGE_PATH = "/pics/sms_preview.png";

export const OG_IMAGE_WIDTH = 1536;
export const OG_IMAGE_HEIGHT = 1024;

/**
 * Resolves absolute URLs for Open Graph / Twitter images. Prefer
 * `NEXT_PUBLIC_SITE_URL` in production; falls back to `VERCEL_URL` on Vercel
 * so builds are not stuck on localhost when the public URL env is missing.
 */
export function getMetadataBase(): URL | undefined {
  const base = getSiteUrl();
  if (base) {
    try {
      return new URL(`${base}/`);
    } catch {
      return undefined;
    }
  }
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    try {
      return new URL(`https://${vercel.replace(/^https?:\/\//, "").replace(/\/$/, "")}/`);
    } catch {
      return undefined;
    }
  }
  return undefined;
}

export function siteJsonLdGraph(base: string, siteName: string) {
  const origin = base.replace(/\/$/, "");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${origin}/#website`,
        url: `${origin}/`,
        name: siteName,
        description: DEFAULT_DESCRIPTION,
        inLanguage: "en-US",
        publisher: { "@id": `${origin}/#business` },
      },
      {
        "@type": "FoodEstablishment",
        "@id": `${origin}/#business`,
        name: siteName,
        url: `${origin}/`,
        image: `${origin}${OG_IMAGE_PATH}`,
        description: DEFAULT_DESCRIPTION,
        servesCuisine: "Smash burgers",
        priceRange: "$$",
        areaServed: [
          { "@type": "City", name: "Littleton", containedInPlace: { "@type": "State", name: "Colorado" } },
          { "@type": "City", name: "Englewood", containedInPlace: { "@type": "State", name: "Colorado" } },
          { "@type": "City", name: "Sheridan", containedInPlace: { "@type": "State", name: "Colorado" } },
        ],
      },
    ],
  };
}
