import { createHmac, timingSafeEqual } from 'crypto';

// Meta's deauthorize and data deletion callbacks (Facebook, Instagram,
// Threads) send a signed_request: <base64url HMAC-SHA256 of the payload>.
// <base64url JSON payload>, signed with the app secret.
// https://developers.facebook.com/docs/development/create-an-app/app-dashboard/data-deletion-callback
// Returns the Meta user id, or null when the request is not from that app
// or is older than a day (a leaked request cannot be replayed later).
export const metaUserFromSignedRequest = (
  secret: string | undefined,
  signedRequest: unknown
) => {
  if (!secret || typeof signedRequest !== 'string') {
    return null;
  }

  const [signature, payload] = signedRequest.split('.');
  if (!signature || !payload) {
    return null;
  }

  const expected = createHmac('sha256', secret).update(payload).digest();
  const received = Buffer.from(signature, 'base64url');
  if (
    received.length !== expected.length ||
    !timingSafeEqual(received, expected)
  ) {
    return null;
  }

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    if (
      String(data?.algorithm || '').toUpperCase() !== 'HMAC-SHA256' ||
      !data?.user_id
    ) {
      return null;
    }
    if (
      data.issued_at &&
      Date.now() / 1000 - Number(data.issued_at) > 24 * 60 * 60
    ) {
      return null;
    }
    return String(data.user_id);
  } catch (err) {
    return null;
  }
};
