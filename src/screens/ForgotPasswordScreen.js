import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import AppInput from '../ui/AppInput';
import AppButton from '../ui/AppButton';
import { formStyles } from '../styles/formstyles';
import { layoutStyles } from '../styles/layoutStyles';
import { colors } from '../theme';
import { validateUser, forgetPassword } from '../api/auth';
import { useNavigation } from '@react-navigation/native';

export default function ForgotPasswordScreen() {
  const navigation = useNavigation();

  const [username, setUsername] = useState('');
  const [stage, setStage] = useState(1);
  const [loading, setLoading] = useState(false);

  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [strength, setStrength] = useState('');
  const [policy, setPolicy] = useState({
    minLen: false,
    upper: false,
    lower: false,
    num: false,
    special: false,
  });

  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    if (countdown > 0) {
      timerRef.current = setTimeout(() => setCountdown(countdown - 1), 1000);
    } else if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    return () => clearTimeout(timerRef.current);
  }, [countdown]);

  const startTimer = () => setCountdown(180);

  const handleSendOTP = async () => {
    if (!username.trim()) {
      Alert.alert('Validation', 'Please enter your username');
      return;
    }
    try {
      setLoading(true);
      const res = await validateUser(username.trim());
      const updateStatus = res?.outParams?.UpdateStatus;
      const msg =
        res?.outParams?.RequestStatus ||
        res?.outParams?.UpdateMessage ||
        res?.executionMessage;

      if (res?.executionStatus === 'Success' && updateStatus === '1') {
        Alert.alert('Success', msg || 'OTP sent successfully');
        setStage(2);
        startTimer();
      } else {
        const fallback = msg || res?.executionMessage || 'User not found';
        Alert.alert('Failed', fallback);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;
    await handleSendOTP();
  };

  useEffect(() => {
    const p = newPassword || '';
    setPolicy({
      minLen: p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      num: /[0-9]/.test(p),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(p),
    });

    let passed = 0;
    if (p.length >= 8) passed++;
    if (/[A-Z]/.test(p)) passed++;
    if (/[a-z]/.test(p)) passed++;
    if (/[0-9]/.test(p)) passed++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(p)) passed++;

    setStrength(
      ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'][passed - 1] || '',
    );
  }, [newPassword]);

  const handleResetPassword = async () => {
    if (!otp || !newPassword || !confirmPassword) {
      Alert.alert('Validation', 'Please fill all fields');
      return;
    }

    const isStrong =
      policy.minLen &&
      policy.upper &&
      policy.lower &&
      policy.num &&
      policy.special;

    if (!isStrong) {
      Alert.alert('Weak Password', 'Password does not meet required policy');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Mismatch', 'Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      const res = await forgetPassword({
        userName: username,
        otp,
        newPassword,
        confirmPassword,
      });
      const msg = res?.outParams?.UpdateMessage;

      if (
        res?.executionStatus === 'Success' &&
        res?.outParams?.UpdateStatus === '1'
      ) {
        Alert.alert('Success', msg || 'Password updated successfully');
        navigation.navigate('Login');
      } else {
        const fallback =
          msg || res?.executionMessage || 'Password update failed';
        Alert.alert('Failed', fallback);
      }
    } catch (err) {
      Alert.alert('Error', err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const renderPolicy = () => (
    <View style={formStyles.vstackSm}>
      <Text style={formStyles.label}>Password must include:</Text>
      <Text
        style={{ color: policy.minLen ? colors.primary : colors.mutedText }}
      >
        • Minimum 8 characters
      </Text>
      <Text style={{ color: policy.upper ? colors.primary : colors.mutedText }}>
        • At least one uppercase letter
      </Text>
      <Text style={{ color: policy.lower ? colors.primary : colors.mutedText }}>
        • At least one lowercase letter
      </Text>
      <Text style={{ color: policy.num ? colors.primary : colors.mutedText }}>
        • At least one number
      </Text>
      <Text
        style={{ color: policy.special ? colors.primary : colors.mutedText }}
      >
        • At least one special character
      </Text>
      {strength ? (
        <Text style={[formStyles.label, { color: colors.text, marginTop: 6 }]}>
          Strength: {strength}
        </Text>
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={layoutStyles.pageContainer}
    >
      <ScrollView contentContainerStyle={formStyles.centeredScreen}>
        <View style={formStyles.card}>
          <Text style={formStyles.title}>Forgot Password</Text>

          {stage === 1 && (
            <>
              <AppInput
                placeholder="Enter Username"
                value={username}
                onChangeText={setUsername}
              />
              <AppButton
                title="Send OTP"
                onPress={handleSendOTP}
                loading={loading}
              />
            </>
          )}

          {stage === 2 && (
            <>
              <AppInput
                placeholder="Enter OTP"
                value={otp}
                onChangeText={setOtp}
                keyboardType="number-pad"
              />
              <AppInput
                placeholder="New Password"
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry
              />
              <AppInput
                placeholder="Confirm Password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry
              />
              {renderPolicy()}
              <AppButton
                title="Reset Password"
                onPress={handleResetPassword}
                loading={loading}
              />
              <View style={formStyles.vstackSm}>
                {countdown > 0 ? (
                  <Text style={formStyles.link}>
                    Resend OTP in {Math.floor(countdown / 60)}:
                    {String(countdown % 60).padStart(2, '0')}
                  </Text>
                ) : (
                  <AppButton
                    title="Resend OTP"
                    variant="link"
                    onPress={handleResendOTP}
                  />
                )}
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
