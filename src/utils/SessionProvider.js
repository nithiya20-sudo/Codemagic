// SessionProvider.js - COMPLETE FIXED VERSION
import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Keychain from 'react-native-keychain'; // ✅ ADDED
import { getLastInteraction, resetLastInteraction } from './ActivityProvider';
import { CommonActions, useNavigation } from '@react-navigation/native';

const SessionContext = createContext();
const IDLE_LIMIT = 20 * 60 * 1000;

export default function SessionProvider({ children }) {
  const navigation = useNavigation();
  const intervalRef = useRef(null);
  const apiCallingRef = useRef(false);

  const validateSlot = async () => {
    try {
      // ✅ GET slotId FROM YOUR KEYCHAIN (using your existing getToken logic)
      const creds = await Keychain.getGenericPassword();
      const slotId = creds ? creds.password : null;

      console.log('🔍 Keychain slotId:', slotId ? 'found' : 'missing');

      if (!slotId) {
        console.log('❌ No slotId - skipping validation');
        return;
      }

      const response = await fetch(
        `http://13.201.159.177:5002/iProofService/api/RemoteGateway/ValidateSlot?slotId=${slotId}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' } },
      );

      console.log('ValidateSlot Status:', response.status);

      if (
        response.status === 204 ||
        response.status === 401 ||
        response.status === 403
      ) {
        logout(
          response.status === 204
            ? 'Your session has expired.'
            : 'Unauthorized access.',
        );
        return;
      }

      if (response.status === 200) {
        console.log('✅ Session valid');
      }
    } catch (error) {
      console.log('Validation error:', error);
    } finally {
      apiCallingRef.current = false;
    }
  };

  useEffect(() => {
    // ✅ Reset on EVERY navigation (fixes 2nd login)
    const unsubscribe = navigation.addListener('state', () => {
      console.log('🆕 Navigation → Timer reset');
      resetLastInteraction();
    });

    // ✅ Your existing interval
    resetLastInteraction();
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const idleTime = now - getLastInteraction();

      console.log(
        `Idle: ${Math.round(idleTime / 1000)}s / Limit: ${
          IDLE_LIMIT / 1000
        }s, API: ${apiCallingRef.current}`,
      );

      if (idleTime >= IDLE_LIMIT && !apiCallingRef.current) {
        apiCallingRef.current = true;
        validateSlot();
      }
    }, 10000);

    // ✅ Cleanup BOTH
    return () => {
      clearInterval(intervalRef.current);
      unsubscribe();
    };
  }, [navigation]); // ✅ Add navigation dependency

  const logout = async message => {
    clearInterval(intervalRef.current);

    // ✅ Clear YOUR Keychain + AsyncStorage
    try {
      await Keychain.resetGenericPassword();
    } catch {}
    await AsyncStorage.multiRemove(['token', 'slotId']);

    Alert.alert('Session Expired', message, [
      {
        text: 'OK',
        onPress: () =>
          navigation.dispatch(
            CommonActions.reset({ index: 0, routes: [{ name: 'Login' }] }),
          ),
      },
    ]);
  };

  return (
    <SessionContext.Provider value={{}}>{children}</SessionContext.Provider>
  );
}

export const useSession = () => useContext(SessionContext);
