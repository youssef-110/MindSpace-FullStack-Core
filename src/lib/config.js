// Public configuration. The Supabase URL and publishable key are designed to be public:
// every table is protected by row-level security, so they grant no access on their own.
export const SUPABASE_URL = "https://cypmbxzllyevhgrjpnta.supabase.co";
export const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_GtZDL9DuNQgL-kyfVhIRaw_zmuEog5L";

// GDPR Art. 13 contact for data requests. Replace before announcing the site publicly.
export const CONTACT_EMAIL = "privacy@example.com";

// Imprint (DE §5 DDG, AT §5 ECG and §25 MedienG) and GDPR Art. 13(1)(a) need the operator's identity.
// Replace before announcing the site publicly. A c/o or business address service is acceptable.
export const OPERATOR = { name: "[Operator name]", address: "[Postal address]", country: "[Country]" };

// Bump when the privacy policy or consent wording changes materially.
export const CONSENT_VERSION = "2026-10-17";
export const MIN_AGE = 16;
