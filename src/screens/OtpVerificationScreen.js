import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import AppInput from '../ui/AppInput';
import AppButton from '../ui/AppButton';
import { formStyles } from '../styles/formstyles';
import { saveToken } from '../utils/secureStore';
import { setAuthToken } from '../api/client';
import { useAuth } from '../apicontext/AuthContext';

// ⏱️ simple timer text can be added later using appConfig.auth.otpTTLSeconds
export default function OtpVerificationScreen({ route, navigation }) {
  const { tempToken, pendingUser } = route.params || {};      // token passed from LoginScreen
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const { setUser } = useAuth();

  const handleVerifyOtp = async () => {
    if (!otp.trim()) {
      Alert.alert('Validation', 'Please enter the OTP.');
      return;
    }

    setLoading(true);
    try {
      // 🔹 Mock backend verify
      // Replace this with your real /VerifyOtp API
      console.log('🔍 verifying OTP:', otp, 'tempToken:', tempToken);

      // pretend verification succeeded
      const verified = otp === '123456'; // demo only

      if (!verified) {
        Alert.alert('Invalid OTP', 'Please try again.');
        setLoading(false);
        return;
      }
      // 🔹 Use real user details from login
      await saveToken('REAL_JWT_TOKEN_FROM_SERVER');
      setAuthToken('REAL_JWT_TOKEN_FROM_SERVER');

      await setUser({
        fullName: pendingUser?.fullName || 'User',
        role: pendingUser?.role || 'User',
        username: pendingUser?.username || '',
      });

      Alert.alert('Success', 'OTP verified successfully!');
      navigation.replace('MainDrawer');

    } catch (err) {
      console.error('OTP verification error:', err);
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.select({ ios: 'padding', android: undefined })}
      style={formStyles.container}
    >
      <View style={[formStyles.card, formStyles.vstackMd]}>
        <Text style={formStyles.title}>Enter OTP</Text>
        <View style={formStyles.vstackSm}>
          <Text style={formStyles.label}>We sent it via SMS/Email</Text>
          <AppInput
            value={otp}
            onChangeText={setOtp}
            placeholder="Enter 6-digit code"
            keyboardType="numeric"
            maxLength={6}
          />
        </View>

        <AppButton title={loading ? 'Verifying…' : 'Verify OTP'} onPress={handleVerifyOtp} disabled={loading} />
        <AppButton title="Back to Login" variant="link" onPress={() => navigation.replace('Login')} />
      </View>
    </KeyboardAvoidingView>
  );
}
