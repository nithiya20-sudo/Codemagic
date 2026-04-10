// src/hooks/useHandleAuthError.js
import { useCallback } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { clearSession } from '../utils/session';

/**
 * Standardized handler for API errors, including token expiry.
 * Usage:
 *   const { handleApiError } = useHandleAuthError();
 *   try { ... } catch (err) { handleApiError(err); }
 */
export function useHandleAuthError(options = {}) {
  const navigation = useNavigation();
  const {
    loginRouteName = 'Login',
    expiredTitle = 'Session Expired',
    expiredMessage = 'Your session has expired. Please log in again.',
    genericTitle = 'Error',
  } = options;

  const handleApiError = useCallback(
    async (err, { silent = false } = {}) => {
      // Our interceptor in client.js throws { isAuthError: true, message: '...' }
      if (err?.isAuthError) {
        if (!silent) {
          Alert.alert(expiredTitle, err.message || expiredMessage, [
            {
              text: 'OK',
              onPress: async () => {
                await clearSession(navigation, loginRouteName);
              },
            },
          ]);
        } else {
          await clearSession(navigation, loginRouteName);
        }
        return true; // handled
      }

      // Non-auth errors: show a generic alert unless silenced
      if (!silent) {
        Alert.alert(genericTitle, err?.message || 'Something went wrong.');
      }
      return false; // not an auth error
    },
    [navigation, loginRouteName, expiredTitle, expiredMessage, genericTitle],
  );

  return { handleApiError };
}
