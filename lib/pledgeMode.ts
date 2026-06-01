/**
 * "Certificate-only" pledges skip the pledge framing entirely.
 *
 * Used for one-off branded events where the form is just a way to mint a
 * personalised certificate (e.g. corporate kids' camps), not a commitment
 * the participant is asked to honour. The page should never use the word
 * "pledge" and shouldn't show a participant counter.
 *
 * The flag now lives in the DB (`Pledge.isCertificateOnly`). The legacy slug
 * list is kept only as a fallback so historic events keep working before the
 * column is backfilled.
 */
export const CERTIFICATE_ONLY_SLUG_LIST = [
  'jungle-adventure-2026',
] as const;

const CERTIFICATE_ONLY_SLUGS = new Set<string>(CERTIFICATE_ONLY_SLUG_LIST);

type CertFlaggable = { slug: string; isCertificateOnly?: boolean | null };

/**
 * Accepts either a slug (legacy callers) or a pledge-like object. Prefers the
 * DB flag; falls back to the hardcoded slug list.
 */
export function isCertificateOnly(pledgeOrSlug: string | CertFlaggable): boolean {
  if (typeof pledgeOrSlug === 'string') {
    return CERTIFICATE_ONLY_SLUGS.has(pledgeOrSlug);
  }
  if (pledgeOrSlug.isCertificateOnly) return true;
  return CERTIFICATE_ONLY_SLUGS.has(pledgeOrSlug.slug);
}
