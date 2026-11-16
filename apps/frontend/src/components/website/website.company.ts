// Public business details shown on the website and in the legal pages
export const COMPANY_NAME = 'Wrecking Social, a 25M Company';
export const COMPANY_EMAIL = 'orders@wreckingsocial.com';
export const COMPANY_ADDRESS_LINES = [
  '4223 W Lake St, Suite 208',
  'Chicago, Illinois 60624',
  'United States',
];
export const LEGAL_EFFECTIVE_DATE = 'November 16, 2026';

// The address of the public website, the same FRONTEND_URL the app runs on
export const websiteUrl = () =>
  (process.env.FRONTEND_URL || 'https://wreckingsocial.com').replace(/\/$/, '');
