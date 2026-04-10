// src/screens/kyc/KycEmailScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView } from 'react-native';

import AppInput from '../../ui/AppInput';
import AppButton from '../../ui/AppButton';

import { layoutStyles } from '../../styles/layoutStyles';
import { formStyles } from '../../styles/formstyles';
import { colors, spacing } from '../../theme';

import { useKyc } from './KycContext';
import { useAuth } from '../../apicontext/AuthContext';

import { getCustomerDetails } from '../../api/customer/getCustomerDetails';
import { sendKycOtp, validateOTP } from '../../api/auth';

export default function KycEmailScreen({ navigation }) {
  const { kycData, updateSection } = useKyc();
  const { user } = useAuth();

  const username = user?.username;

  // -----------------------------
  // STATE
  // -----------------------------
  const [originalEmail, setOriginalEmail] = useState('');
  const [email, setEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [otp, setOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(false);

  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);

  const [message, setMessage] = useState(null);
  const [messageColor, setMessageColor] = useState(colors.mutedText);

  const [timer, setTimer] = useState(0);
  const [otpRequested, setOtpRequested] = useState(false);
  const timerRef = useRef(null);

  // -----------------------------
  // LOAD EXISTING EMAIL
  // -----------------------------
  useEffect(() => {
    async function load() {
      try {
        if (!username) return;

        // 👉 Use KYC context first
        if (kycData?.contact?.email) {
          setOriginalEmail(kycData.contact.email);
          setEmail(kycData.contact.email);

          if (kycData.contact.emailVerified) {
            setEmailVerified(true);
          }
          return;
        }

        // 👉 Else load from backend
        // const res = await getCustomerDetails(username);
        // const p = res?.outParams || {};

        // const backendEmail = (p.Email || "").trim();

        setOriginalEmail(backendEmail);
        setEmail(backendEmail);

        updateSection("contact", {
          ...kycData.contact,
          email: backendEmail,
          emailVerified: backendEmail ? true : false,
        });

        if (backendEmail) setEmailVerified(true);

      } catch (err) {
        console.log("Email load error:", err);
      }
    }

    load();
  }, []);


  // -----------------------------
  // TIMER MANAGEMENT
  // -----------------------------
  useEffect(() => {
    if (timer === 0 && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [timer]);

  const startTimer = () => {
    setTimer(120); // 2 minutes
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
        }
        return prev - 1;
      });
    }, 1000);
  };

  const formatTimer = (t) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // -----------------------------
  // SEND OTP (ONE BUTTON)
  // -----------------------------
  const handleSendOtp = async () => {
    if (!email || !email.includes('@')) {
      setMessage('Enter a valid email address.');
      setMessageColor(colors.failure);
      return;
    }

    if (isEditing && email === originalEmail) {
      setMessage('New email cannot be same as registered email.');
      setMessageColor(colors.failure);
      return;
    }

    setLoadingSend(true);
    setMessage(null);

    try {
      const res = await sendKycOtp(username, 'E', email);
      const msg = res?.outParams?.UpdateMessage || 'OTP sent successfully.';

      setMessage(msg);
      setMessageColor(colors.success);
      setOtpRequested(true);
      startTimer();
    } catch (err) {
      console.log('Send OTP error:', err);
      setMessage('Failed to send OTP.');
      setMessageColor(colors.failure);
    }

    setLoadingSend(false);
  };

  // -----------------------------
  // VERIFY OTP
  // -----------------------------
  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) {
      setMessage('Enter a valid OTP.');
      setMessageColor(colors.failure);
      return;
    }

    setLoadingVerify(true);
    setMessage(null);

    try {
      const res = await validateOTP(username, otp);
      const isValid = res?.outParams?.IsValid === '1';

      if (!isValid) {
        setMessage('Invalid OTP.');
        setMessageColor(colors.failure);
        setLoadingVerify(false);
        return;
      }

      // SUCCESS
      setEmailVerified(true);
      setEmail(email);
      setIsEditing(false);
      setOriginalEmail(email);
      setOtp('');
      setTimer(0);
      setOtpRequested(false);
      updateSection("contact", {
        email: email,
        emailVerified: true,
      });
      setMessage('✔ New Email verified successfully.');
      setMessageColor(colors.success);
    } catch (err) {
      console.log('OTP verification error:', err);
      setMessage('OTP verification failed.');
      setMessageColor(colors.failure);
    }

    setLoadingVerify(false);
  };

  // -----------------------------
  // NEXT
  // -----------------------------
  const handleNext = () => {
    // If user is in edit mode, they MUST complete verification first
    if (isEditing) {
      setMessage('Please verify your updated email before continuing.');
      setMessageColor(colors.failure);
      return;
    }

    // If not verified at all, block
    if (isEditing &&!emailVerified) {
      setMessage('Email must be verified before continuing.');
      setMessageColor(colors.failure);
      return;
    }

    updateSection('contact', {
      ...kycData.contact,
      email,
      emailVerified: true,
    });

    navigation.navigate('KycMobileScreen');
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    
      <ScrollView contentContainerStyle={formStyles.container}>
        <View style={formStyles.card}>
          {/* Title */}
          <Text style={formStyles.sectionTitle}>Verify Email</Text>

          {/* Registered Email row */}
          <View style={[formStyles.infoRow, formStyles.mbSm]}>
            <Text style={formStyles.infoLabel}>Registered Email</Text>

          </View>
          <View style={[formStyles.infoRow, formStyles.mbSm]}>
            <Text style={formStyles.infoValue}>
              {originalEmail || '-'}
            </Text>
          </View>
          {/* Verified indicator */}
          {!isEditing && emailVerified && (
            <Text style={formStyles.success}>✔ Email verified</Text>
          )}

          {/* Edit Email link (always visible when not editing) */}
          {!isEditing && (
            <Text
              onPress={() => {
                setIsEditing(true);
                setEmailVerified(false);
                setOtp('');
                setTimer(0);
                setOtpRequested(false);
                setMessage(null);
              }}
              style={formStyles.link}
            >
              Edit Email
            </Text>
          )}

          {/* Edit mode */}
          {isEditing && (
            <View style={[formStyles.vstackMd, { marginTop: spacing.lg }]}>
              {/* New Email */}
              <View>
                <Text style={formStyles.label}>New Email</Text>
                <AppInput
                  value={email}
                  placeholder="Enter new email"
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>

              {/* Single Send OTP button */}
              <AppButton
                title="Send OTP"
                onPress={handleSendOtp}
                disabled={loadingSend || timer > 0}
              />

              {/* Timer text */}
              {timer > 0 && (
                <Text style={formStyles.label}>
                  Resend OTP in {formatTimer(timer)}
                </Text>
              )}

              {/* OTP + Verify (only after OTP is requested at least once) */}
              {otpRequested && (
                <View style={formStyles.vstackSm}>
                  <View>
                    <Text style={formStyles.label}>Enter OTP</Text>
                    <AppInput
                      value={otp}
                      placeholder="Enter OTP"
                      onChangeText={setOtp}
                      keyboardType="number-pad"
                    />
                  </View>

                  <AppButton
                    title={loadingVerify ? 'Verifying...' : 'Verify OTP'}
                    onPress={handleVerifyOtp}
                    disabled={loadingVerify}
                  />
                </View>
              )}
            </View>
          )}

          {/* Inline message */}
          {message && (
            <Text
              style={[
                formStyles.label,
                { color: messageColor, marginTop: spacing.md },
              ]}
            >
              {message}
            </Text>
          )}


        </View>
        {/* Back / Next */}
        <View style={[formStyles.infoRow, { marginTop: spacing.lg }]}>
          <View style={{ flex: 1 }}>
            <AppButton
              title="Back"
              variant="secondary"
              onPress={() => navigation.navigate("KycAddressScreen")}
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppButton
              title="Next"
              onPress={handleNext}
            />
          </View>
        </View>
      </ScrollView>

 
  );
}
