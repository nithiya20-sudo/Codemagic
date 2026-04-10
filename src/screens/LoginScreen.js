import React, { useState } from 'react';
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Image,
  Platform,
} from 'react-native';

import AppInput from '../ui/AppInput';
import AppButton from '../ui/AppButton';
import { formStyles } from '../styles/formstyles';
import { useAuthApi } from '../apihook/useAuth';
import { saveToken } from '../utils/secureStore';
import { setAuthToken } from '../api/client';
import { useAuth } from '../apicontext/AuthContext';
import { appConfig } from '../config/appConfig';
import { layoutStyles } from '../styles/layoutStyles';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import EncryptedStorage from 'react-native-encrypted-storage';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import { colors } from '../theme';
import DeviceInfo from 'react-native-device-info';

// ✅ NEW — Import MasterData API
import { getMasterData } from '../api/master/masterDataService';

export default function LoginScreen({ navigation }) {
  // 🔹 Input states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 🔹 UI control
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // 🔹 API hook
  const { signIn } = useAuthApi();

  // 🔹 Secure Auth Context
  const { setUser } = useAuth();

  const appVersion = DeviceInfo.getVersion();
  const buildNumber = DeviceInfo.getBuildNumber();

  console.log('App info:', { appVersion, buildNumber });

  // ---------------------------------------------------------
  // LOGIN HANDLER
  // ---------------------------------------------------------
  const handleLogin = async () => {
    setError('');

    if (!username.trim() || !password.trim()) {
      Alert.alert('Validation', 'Please enter both username and password');
      return;
    }

    setLoading(true);

    try {
      // 🔐 Authenticate user
      const result = await signIn(username.trim(), password);

      if (!result.success) {
        Alert.alert('Login Failed!', result.message);
        setLoading(false);
        return;
      }

      const { token, fullName, role, email } = result;

      // ---------------------------------------------------------
      // SAVE TOKEN SECURELY
      // ---------------------------------------------------------
      await saveToken(token);

      // ---------------------------------------------------------
      // APPLY TOKEN TO AXIOS CLIENTS (immediately required)
      // ---------------------------------------------------------
      setAuthToken(token);

      // ---------------------------------------------------------
      // BUILD USER OBJECT
      // ---------------------------------------------------------
      const userObj = {
        username: username.trim(),
        fullName: fullName || username.trim(),
        role: role || 'User',
        email: email || '',
        token,
      };

      // ---------------------------------------------------------
      // UPDATE AUTH CONTEXT
      // ---------------------------------------------------------
      await setUser(userObj);

      // Sync token storage (your previous logic)
      await EncryptedStorage.setItem('token', userObj.token);

      // ---------------------------------------------------------
      // 2FA FLOW (unchanged)
      // ---------------------------------------------------------
      if (appConfig.auth.enable2FA) {
        navigation.navigate('OtpVerification', {
          tempToken: result.tempToken,
          pendingUser: userObj,
        });
        setLoading(false);
        return;
      }

      console.log('✅ Login success for:', userObj.fullName);

      // ---------------------------------------------------------
      // NEW: REFRESH MASTER DATA AFTER LOGIN
      // ---------------------------------------------------------
      try {
        console.log('📚 Refreshing MasterData after login...');
        const master = await getMasterData();
        console.log('Master API URL:', master);

        if (master) {
          await EncryptedStorage.setItem('MASTER_DATA', JSON.stringify(master));
          console.log('✔ MasterData refreshed & stored');
        } else {
          console.log('⚠ MasterData API returned empty response');
        }
      } catch (err) {
        console.log('❌ Failed to refresh MasterData:', err);
      }

      // ---------------------------------------------------------
      // SAFE NAVIGATION AFTER EVERYTHING IS READY
      // ---------------------------------------------------------
      navigation.replace('MainDrawer');
    } catch (e) {
      console.error('❌ Login error:', e.message);
      setError(e.message);
      Alert.alert(
        'Login Failed!',
        'Try After Sometime.' || 'Invalid username or password',
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------------------
  // UI MARKUP (UNCHANGED)
  // ---------------------------------------------------------
  return (
    <KeyboardAwareScrollView
      enableOnAndroid
      enableResetScrollToCoords
      resetScrollToCoords={{ x: 0, y: 0 }}
      keyboardShouldPersistTaps="handled"
      extraHeight={Platform.OS === 'android' ? 80 : 60}
      contentContainerStyle={[
        formStyles.scrollContainer,
        formStyles.centeredScreen,
        formStyles.kbPadLg,
      ]}
      style={formStyles.flexContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={[layoutStyles.card, layoutStyles.cardAuth]}>
        {/* Logo */}
        <Image
          source={require('../assets/images/logo-caption.png')}
          style={[layoutStyles.authLogo, formStyles.mbLg]}
          resizeMode="contain"
        />

        <Text style={formStyles.title}>Welcome to MLIS</Text>

        {/* Username */}
        <View style={formStyles.vstackSm}>
          <Text style={formStyles.label}>User Name</Text>
          <AppInput
            value={username}
            onChangeText={setUsername}
            placeholder="e.g. example198"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        {/* Password */}
        <View style={formStyles.vstackSm}>
          <Text style={formStyles.label}>Password</Text>

          <View style={{ position: 'relative' }}>
            <AppInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              secureTextEntry={!showPassword}
              style={[formStyles.input, formStyles.mbLg]}
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              onPress={() => setShowPassword(v => !v)}
              activeOpacity={0.7}
              style={{ position: 'absolute', right: 10, top: 12, padding: 6 }}
            >
              <MaterialIcons
                name={showPassword ? 'visibility' : 'visibility-off'}
                size={22}
                color={colors.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <AppButton
          title={loading ? 'Signing in…' : 'Sign in'}
          onPress={handleLogin}
          disabled={loading}
          style={formStyles.mbLg}
        />

        {/* Forgot / Signup */}
        <View style={formStyles.hstackCenter}>
          <AppButton
            title="Forgot Password?"
            variant="link"
            onPress={() => navigation.navigate('ForgotPassword')}
          />
          <Text style={formStyles.pipeText}>|</Text>
          <AppButton
            title="Signup"
            variant="link"
            onPress={() => navigation.navigate('Signup')}
          />
        </View>

        <View style={{ alignItems: 'center', marginBottom: 15 }}>
          <Text style={{ color: '#1a0707', fontSize: 12 }}>
            Version {appVersion} ({buildNumber})
          </Text>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
