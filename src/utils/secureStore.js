import * as Keychain from 'react-native-keychain';

const TOKEN_KEY = 'mlis_auth_token';

// Save
export async function saveToken(token) {
  await Keychain.setGenericPassword(TOKEN_KEY, token, {
    accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED,
  });
}

// Read
export async function getToken() {
  const creds = await Keychain.getGenericPassword();
  return creds ? creds.password : null;
}

// Clear
export async function clearToken() {
  try { await Keychain.resetGenericPassword(); } catch {}
}

