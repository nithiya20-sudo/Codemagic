// src/screens/kyc/KycMobileScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView } from 'react-native';

import AppInput from '../../ui/AppInput';
import AppButton from '../../ui/AppButton';

import { formStyles } from '../../styles/formstyles';
import { colors, spacing } from '../../theme';

import { useKyc } from './KycContext';
import { useAuth } from '../../apicontext/AuthContext';

import { sendKycOtp, validateOTP } from '../../api/auth';

export default function KycMobileScreen({ navigation }) {
  const { kycData, updateSection } = useKyc();
  const { user } = useAuth();

  const username = user?.username;

  // -----------------------------
  // STATE
  // -----------------------------
  const [originalMobile, setOriginalMobile] = useState('');
  const [mobile, setMobile] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const [otp, setOtp] = useState('');
  const [mobileVerified, setMobileVerified] = useState(false);

  const [loadingSend, setLoadingSend] = useState(false);
  const [loadingVerify, setLoadingVerify] = useState(false);

  const [message, setMessage] = useState(null);
  const [messageColor, setMessageColor] = useState(colors.mutedText);

  const [timer, setTimer] = useState(0);
  const [otpRequested, setOtpRequested] = useState(false);
  const timerRef = useRef(null);

  // -----------------------------
  // LOAD EXISTING MOBILE
  // -----------------------------
  // -----------------------------
  // LOAD EXISTING MOBILE (CALL ONLY ONCE)
  // -----------------------------
  useEffect(() => {
    async function load() {
      try {
        if (!username) return;

        // ✅ Prevent refetch if we already have mobile loaded in context
        if (kycData?.contact?.mobile) {
          setOriginalMobile(kycData.contact.mobile);
          setMobile(kycData.contact.mobile);

          if (kycData.contact.mobileVerified) {
            setMobileVerified(true);
          }
          return;
        }

        // // ❗ Fetch only if nothing is in KYC context
        // const res = await getCustomerDetails(username);
        // const p = res?.outParams || {};

        // const backendMobile = (p.MobileNumber || '').trim();

        setOriginalMobile(backendMobile);
        setMobile(backendMobile);

        updateSection("contact", {
          ...kycData.contact,
          mobile: backendMobile,
          mobileVerified: backendMobile ? true : false,
        });

        setOriginalMobile(backendMobile);
        setMobile(backendMobile);

        if (backendMobile) setMobileVerified(true);

      } catch (err) {
        console.log('Error loading mobile:', err);
      }
    }

    load();
    // 🚫 Do not re-run repeatedly
  }, []);

  // useEffect(() => {
  //   async function load() {
  //     try {
  //       if (!username) return;

  //       const res = await getCustomerDetails(username);
  //       const p = res?.outParams || {};

  //       const backendMobile = (p.MobileNumber || '').trim();

  //       setOriginalMobile(backendMobile);
  //       setMobile(backendMobile);

  //       // Auto-verify existing number
  //       if (backendMobile) {
  //         setMobileVerified(true);
  //       }
  //     } catch (err) {
  //       console.log('Error loading mobile:', err);
  //     }
  //   }

  //   load();
  // }, [username]);

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
    setTimer(120);
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
  // SEND OTP
  // -----------------------------
  const handleSendOtp = async () => {
    if (!mobile || mobile.length < 9) {
      setMessage('Enter a valid mobile number.');
      setMessageColor(colors.failure);
      return;
    }

    if (isEditing && mobile === originalMobile) {
      setMessage('New mobile number cannot be same as existing.');
      setMessageColor(colors.failure);
      return;
    }

    setLoadingSend(true);
    setMessage(null);

    try {
      const res = await sendKycOtp(username, 'M', mobile);
      const msg = res?.outParams?.UpdateMessage || 'OTP sent to mobile.';

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
      setMessage('Enter valid OTP.');
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
      setMobileVerified(true);
      setOriginalMobile(mobile);
      setIsEditing(false);
      setOtp('');
      setTimer(0);
      setOtpRequested(false);

      updateSection('contact', {
        mobile: mobile,
        mobileVerified: true,
      });

      setMessage('✔ Mobile number verified successfully.');
      setMessageColor(colors.success);
    } catch (err) {
      console.log('OTP verify error:', err);
      setMessage('OTP verification failed.');
      setMessageColor(colors.failure);
    }

    setLoadingVerify(false);
  };

  // -----------------------------
  // NEXT
  // -----------------------------
  const handleNext = () => {
    if (isEditing) {
      setMessage('Please verify your updated mobile number first.');
      setMessageColor(colors.failure);
      return;
    }

    if (isEditing&&!mobileVerified) {
      setMessage('Mobile number must be verified before continuing.');
      setMessageColor(colors.failure);
      return;
    }

    updateSection('contact', {
      ...kycData.contact,
      mobile: originalMobile,
      mobileVerified: true,
    });

    navigation.navigate('KycDocumentsScreen');
  };

  // -----------------------------
  // UI
  // -----------------------------
  return (
    <ScrollView contentContainerStyle={formStyles.container}>
      <View style={formStyles.card}>

        <Text style={formStyles.sectionTitle}>Verify Mobile Number</Text>

        {/* Registered Mobile */}
        <View style={[formStyles.infoRow, formStyles.mbSm]}>
          <Text style={formStyles.infoLabel}>Registered Mobile</Text>
        </View>

        <View style={[formStyles.infoRow, formStyles.mbSm]}>
          <Text style={formStyles.infoValue}>
            {originalMobile || '-'}
          </Text>
        </View>

        {/* Verified tick */}
        {!isEditing && mobileVerified && (
          <Text style={formStyles.success}>✔ Mobile verified</Text>
        )}

        {/* Edit link */}
        {!isEditing && (
          <Text
            onPress={() => {
              setIsEditing(true);
              setMobileVerified(false);
              setOtp('');
              setTimer(0);
              setOtpRequested(false);
              setMessage(null);
            }}
            style={formStyles.link}
          >
            Edit Mobile
          </Text>
        )}

        {/* Edit Mode */}
        {isEditing && (
          <View style={[formStyles.vstackMd, { marginTop: spacing.lg }]}>

            <View>
              <Text style={formStyles.label}>New Mobile Number</Text>
              <AppInput
                value={mobile}
                placeholder="Enter new mobile"
                onChangeText={setMobile}
                keyboardType="phone-pad"
              />
            </View>

            {/* Send OTP */}
            <AppButton
              title="Send OTP"
              onPress={handleSendOtp}
              disabled={loadingSend || timer > 0}
            />

            {/* Timer */}
            {timer > 0 && (
              <Text style={formStyles.label}>
                Resend OTP in {formatTimer(timer)}
              </Text>
            )}

            {/* OTP entry */}
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
            onPress={() => navigation.navigate("KycEmailScreen")}
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
