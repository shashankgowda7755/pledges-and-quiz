/**
 * "Certificate-only" pledges skip the pledge framing entirely.
 *
 * Used for one-off branded events where the form is just a way to mint a
 * personalised certificate (e.g. corporate kids' camps), not a commitment
 * the participant is asked to honour. The page should never use the word
 * "pledge" and shouldn't show a participant counter.
 */
export const CERTIFICATE_ONLY_SLUG_LIST = [
  'jungle-adventure-2026',
] as const;

const CERTIFICATE_ONLY_SLUGS = new Set<string>(CERTIFICATE_ONLY_SLUG_LIST);

export function isCertificateOnly(slug: string): boolean {
  return CERTIFICATE_ONLY_SLUGS.has(slug);
}
