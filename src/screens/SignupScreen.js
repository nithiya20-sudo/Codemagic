import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import AppInput from '../ui/AppInput';
import AppButton from '../ui/AppButton';
import { formStyles } from '../styles/formstyles';
import { layoutStyles } from '../styles/layoutStyles';
import { colors, typography, spacing } from '../theme';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';
import { validateAccount, sendMobileOTP, submitMobileAccessRequestExisting, verifyMobileOTP } from '../api/auth';
import { interpretAccountStatus } from '../utils/interpretAccountStatus';
// import { submitMobileAccessRequestExisting } from '../api/signup'; // ✅ new import
// console.log('✅ formStyles keys:', Object.keys(formStyles || {}));
// console.log('✅ layoutStyles keys:', Object.keys(layoutStyles || {}));
// console.log('DEBUG 🔍 formStyles value:', KeyboardAwareScrollView);
// 🔹 Small inline message banner
function MessageBanner({ type = 'info', text }) {
  if (!text) return null;
  const bg =
    type === 'success' ? '#E7F7ED' :
      type === 'error' ? '#FDECEC' : '#EEF2FF';
  const fg =
    type === 'success' ? '#116A3E' :
      type === 'error' ? '#A1121A' : '#1C3FAA';
  return (
    <View style={{
      padding: 12, borderRadius: 8, backgroundColor: bg,
      marginBottom: 12, borderWidth: 1, borderColor: '#00000010',
    }}>
      <Text style={{ color: fg, fontFamily: typography.family.medium }}>{text}</Text>
    </View>
  );
}

export default function SignupScreen({ navigation }) {
  const [selectedType, setSelectedType] = useState('existing');
  const [accountNo, setAccountNo] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [requestId, setRequestId] = useState('');
  const [resendTimer, setResendTimer] = useState(0);

  // 🔹 Message state
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('info');
  const showSuccess = (t) => { setMsgType('success'); setMsg(t); };
  const showError = (t) => { setMsgType('error'); setMsg(t); };
  const clearMsg = () => setMsg('');

  // 🔹 Countdown timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setInterval(() => setResendTimer((s) => s - 1), 1000);
    return () => clearInterval(timer);
  }, [resendTimer]);

  // 🔹 Clear message when input changes
  useEffect(() => {
    if (msg) clearMsg();
  }, [accountNo, otp]);

  // 🔹 Validate account and handle all 4 scenarios
  const handleVerifyAccount = async () => {
    clearMsg();
    if (!accountNo.trim()) return showError('Please enter your Account Number');
    if (!/^\d+$/.test(accountNo.trim())) return showError('Account Number must contain only digits');
    if (accountNo.trim().length < 10 || accountNo.trim().length > 15)
      return showError('Account Number should be between 10 to 15 digits');

    setLoading(true);
    try {
      const result = await validateAccount(accountNo.trim());
      if (result?.executionStatus === 'Success') {
        await interpretAccountStatus(result?.outParams, accountNo, setStep, setResendTimer);
        showSuccess('Account verified successfully.');
      } else {
        showError('Unable to verify account. Please try again later.');
      }
    } catch (err) {
      console.error('❌ ValidateAccount API Error:', err.message);
      showError('Network or server issue. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Resend OTP only (no validation)
  const handleResendOTP = async () => {
    clearMsg();
    setLoading(true);
    try {
      const otpRes = await sendMobileOTP(accountNo.trim());
      if (otpRes.success) {
        showSuccess(otpRes.message || 'OTP resent successfully.');
        setResendTimer(30);
      } else {
        showError(otpRes.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      showError(err.message || 'Unable to resend OTP.');
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Verify OTP ➜ then call registration API with verified account number
  const handleVerifyOTP = async () => {
    clearMsg();

    if (!otp.trim()) return showError('Please enter OTP');
    if (!/^\d{6}$/.test(otp.trim())) return showError('OTP must be 4–6 digits');
    if (!accountNo?.trim()) return showError('Missing account number. Please verify again.');

    setLoading(true);
    try {
      // 1️⃣ Verify OTP
      const { success, valid, message } = await verifyMobileOTP(accountNo.trim(), otp.trim());

      if (!success) {
        return showError(message || 'OTP verification failed.');
      }
      if (!valid) {
        return showError(message || 'Invalid OTP. Please try again.');
      }

      showSuccess(message || 'OTP verified successfully.');

      // 2️⃣ Registration API — only if OTP is valid
      const { ok: regOk, apiRequestId, raw: regRaw } = await submitMobileAccessRequestExisting({
        accountNumber: accountNo.trim(),
      });

      if (regOk) {
        setRequestId(apiRequestId || 'N/A');
        setStep(3);
        showSuccess('Registration submitted successfully.');
      } else {
        showError(regRaw?.executionMessage || 'Registration failed after OTP verification.');
      }
    } catch (err) {
      console.error('❌ Verify OTP or Register Error:', err.message);
      showError(err?.message || 'Unable to complete OTP verification.');
    } finally {
      setLoading(false);
    }
  };


  // 🔹 Step rendering
  const renderStep = () => {
    if (step === 1) {
      return (
        <View style={formStyles.vstackMd}>
          <Text style={formStyles.label}>Enter your Account Number</Text>
          <AppInput
            editable={step === 1} // disable once verified
            value={accountNo}
            onChangeText={(text) => setAccountNo(text.replace(/[^0-9]/g, '').slice(0, 15))}
            placeholder="e.g. 0311399113201"
            keyboardType="numeric"
            maxLength={15}
          />
          <AppButton
            title={loading ? 'Verifying…' : 'Verify Account'}
            onPress={handleVerifyAccount}
            disabled={loading}
          />
        </View>
      );
    }

    if (step === 2) {
      return (
        <View style={formStyles.vstackMd}>
          <Text style={formStyles.label}>
            Enter the OTP sent to your registered contact
          </Text>
          <AppInput
            value={otp}
            onChangeText={(text) => setOtp(text.replace(/[^0-9]/g, '').slice(0, 6))}
            placeholder="Enter 6-digit OTP"
            keyboardType="numeric"
            maxLength={6}
          />
          <AppButton
            title={loading ? 'Verifying…' : 'Verify OTP'}
            onPress={handleVerifyOTP}
            disabled={loading}
          />

          {/* 🔹 Resend OTP Section */}
          <View style={[formStyles.hstackCenter, { marginTop: spacing.sm }]}>
            {resendTimer > 0 ? (
              <Text style={{
                fontFamily: typography.family.regular,
                color: colors.mutedText,
              }}>
                Resend available in {resendTimer}s
              </Text>
            ) : (
              <TouchableOpacity onPress={handleResendOTP}>
                <Text style={{
                  fontFamily: typography.family.medium,
                  color: colors.primary,
                  textDecorationLine: 'underline',
                }}>
                  Resend OTP
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      );
    }

    if (step === 3) {
      return (
        <View style={[formStyles.vstackMd, { alignItems: 'center' }]}>
          <Text style={{
            fontFamily: typography.family.semibold,
            fontSize: 18,
            color: colors.primaryDark,
            marginBottom: spacing.md,
          }}>
            ✅ Request Submitted Successfully
          </Text>
          <Text style={[formStyles.infoLabel, { textAlign: 'center' }]}>
            Your registration request has been sent for approval.
          </Text>
          <Text style={{
            fontFamily: typography.family.medium,
            color: colors.text,
            marginTop: spacing.sm,
          }}>
            Request ID: <Text style={{ color: colors.primary }}>{requestId}</Text>
          </Text>

          <AppButton
            title="Back to Login"
            variant="link"
            onPress={() => navigation.navigate('Login')}
            style={{ marginTop: spacing.lg }}
            textStyle={{ color: colors.primaryDark }}
          />
        </View>
      );
    }
  };

  return (
    <KeyboardAwareScrollView
      enableOnAndroid
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[formStyles.scrollContainer, formStyles.centeredScreen]}
      style={formStyles.flexContainer}
    >
      <View style={[layoutStyles.card, layoutStyles.cardAuth]}>
        <Text style={[formStyles.title, formStyles.mbLg]} numberOfLines={2} adjustsFontSizeToFit>
          Sign Up
        </Text>

        {/* Tabs */}
        <View style={{
          flexDirection: 'row',
          marginBottom: spacing.lg,
          borderRadius: 8,
          backgroundColor: colors.surface,
          overflow: 'hidden',
        }}>
          <TouchableOpacity
            style={{
              flex: 1,
              backgroundColor:
                selectedType === 'existing' ? colors.primary : colors.surface,
              paddingVertical: 10,
              alignItems: 'center',
            }}
            onPress={() => setSelectedType('existing')}
          >
            <Text style={{
              color: selectedType === 'existing' ? '#fff' : colors.text,
              fontFamily: typography.family.medium,
            }}>
              Existing Customer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            disabled
            style={{
              flex: 1,
              backgroundColor: colors.border,
              paddingVertical: 10,
              alignItems: 'center',
              opacity: 0.5,
            }}
          >
            <Text style={{
              color: colors.mutedText,
              fontFamily: typography.family.medium,
            }}>
              New Customer (Coming Soon)
            </Text>
          </TouchableOpacity>
        </View>

        {/* 🔹 Status Message */}
        <MessageBanner type={msgType} text={msg} />

        {renderStep()}

        {step < 3 && (
          <View style={[formStyles.hstackCenter, { marginTop: spacing.lg }]}>
            <Text style={formStyles.pipeText}>Already registered?</Text>
            <AppButton title="Login" variant="link" onPress={() => navigation.navigate('Login')} />
          </View>
        )}
      </View>
    </KeyboardAwareScrollView>
  );
}
