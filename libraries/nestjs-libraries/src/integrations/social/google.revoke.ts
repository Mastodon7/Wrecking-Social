// Cancels a Google OAuth grant (YouTube, Google Business Profile). Revoking
// the refresh token also revokes the access tokens issued with it. Google
// answers 400 when the token is already revoked or expired, which means there
// is nothing left to cancel
export const revokeGoogleToken = async (token: string) => {
  if (!token) {
    return;
  }

  const res = await fetch('https://oauth2.googleapis.com/revoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ token }).toString(),
  });

  if (!res.ok && res.status !== 400) {
    throw new Error(`Google token revocation failed with status ${res.status}`);
  }
};
