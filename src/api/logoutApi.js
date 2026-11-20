// src/api/logoutApi.js
const BASE_URL = 'https://loans.znbs.co.zm/iProofService/api/RemoteGateway';

export const signOutAndCancelPassword = async token => {
  if (!token) return { ok: false, reason: 'no-token' };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000); // don't hang logout

  try {
    const response = await fetch(
      `${BASE_URL}/SignOutandCancelPassword?token=${encodeURIComponent(token)}`,
      { method: 'POST', signal: controller.signal },
    );
    return { ok: response.ok, status: response.status };
  } catch (error) {
    return { ok: false, reason: 'network', error };
  } finally {
    clearTimeout(timer);
  }
};
