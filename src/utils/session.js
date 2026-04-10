// src/utils/session.js
import EncryptedStorage from 'react-native-encrypted-storage';

/**
 * Clears secure storage and navigates to Login screen.
 * @param {import('@react-navigation/native').NavigationProp<any>} navigation
 * @param {string} loginRouteName  e.g., 'Login'
 */
export async function clearSession(navigation, loginRouteName = 'Login') {
  try {
    await EncryptedStorage.removeItem('token');
    await EncryptedStorage.removeItem('user');
  } catch (e) {
    // ignore
  }

  // Reset navigation stack to Login
  navigation.reset({
    index: 0,
    routes: [{ name: loginRouteName }],
  });
}
