const DEFAULT_SITE_URL = "https://careeriq-nine.vercel.app";

/** Stable public origin used for externally visible links and auth callbacks. */
export function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL).replace(/\/+$/, "");
}
