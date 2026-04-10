import React, { createContext, useContext, useState, useEffect } from 'react';
import EncryptedStorage from 'react-native-encrypted-storage';
import { clearToken } from '../utils/secureStore'; // ✅ add this import (we’ll define below)

// Create the Context
const AuthContext = createContext();

// Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user info from secure storage on app start
  useEffect(() => {
    (async () => {
      try {
        const storedUser = await EncryptedStorage.getItem('user');
        if (storedUser) {
          //setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.log('Error loading user from storage', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Persist user securely
  const saveUser = async userObj => {
    try {
      await EncryptedStorage.setItem('user', JSON.stringify(userObj));
      setUser(userObj);
    } catch (error) {
      console.log('Error saving user', error);
    }
  };

  // Clear on logout
  const logout = async () => {
    try {
      await EncryptedStorage.clear(); // clears stored user info
      await clearToken(); // ✅ remove token from secure store
      setUser(null); // clear user from memory
    } catch (error) {
      console.log('Error clearing storage', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser: saveUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for components
export const useAuth = () => useContext(AuthContext);
