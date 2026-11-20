// Public business details shown on the website and in the legal pages
// Legal business name; it must match the business verification documents
// given to Meta, LinkedIn, Google and TikTok
export const COMPANY_NAME = '25M Printing Company';
export const COMPANY_PHONE = '(708) 398-3232';
export const COMPANY_PHONE_LINK = 'tel:+17083983232';
// Support and general questions
export const COMPANY_EMAIL = 'support@wreckingsocial.com';
// Privacy questions and data access / deletion requests
export const PRIVACY_EMAIL = 'privacy@wreckingsocial.com';
export const COMPANY_ADDRESS_LINES = [
  '4223 W Lake St, Suite 208',
  'Chicago, Illinois 60624',
  'United States',
];
export const LEGAL_EFFECTIVE_DATE = 'November 19, 2026';
// Complete source code of the version we run (AGPL-3.0 section 13). The
// image is built from this repository's main branch
export const SOURCE_CODE_URL = 'https://github.com/Mastodon7/Wrecking-Social';

// The address of the public website, the same FRONTEND_URL the app runs on
export const websiteUrl = () =>
  (process.env.FRONTEND_URL || 'https://wreckingsocial.com').replace(/\/$/, '');
