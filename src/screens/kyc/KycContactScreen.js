import React, { useState } from 'react';
import { View, Text, Alert } from 'react-native';

import AppInput from '../../ui/AppInput';
import AppButton from '../../ui/AppButton';

import { layoutStyles } from '../../styles/layoutStyles';
import { formStyles } from '../../styles/formstyles';
import { typography } from '../../theme';
import { useAuth } from '../../apicontext/AuthContext';
import { getCustomerDetails } from '../../api/customer/getCustomerDetails';
import { useKyc } from './KycContext';

export default function KycContactScreen({ navigation }) {
  const { kycData, updateSection } = useKyc();
  const { user } = useAuth();

  const [mobile, setMobile] = useState(kycData.contact?.mobile || '');
  const [mobileOtp, setMobileOtp] = useState('');
  const [mobileVerified, setMobileVerified] = useState(
    kycData.contact?.mobileVerified || false
  );

  const [email, setEmail] = useState(kycData.contact?.email || '');
  const [emailOtp, setEmailOtp] = useState('');
  const [emailVerified, setEmailVerified] = useState(
    kycData.contact?.emailVerified || false
  );

  const [sendingMobileOtp, setSendingMobileOtp] = useState(false);
  const [verifyingMobileOtp, setVerifyingMobileOtp] = useState(false);

  const [sendingEmailOtp, setSendingEmailOtp] = useState(false);
  const [verifyingEmailOtp, setVerifyingEmailOtp] = useState(false);

  // -------------------------------
  // MOCK API: SEND MOBILE OTP
  // -------------------------------
  const sendMobileOtp = () => {
    if (!mobile || mobile.length < 9) {
      Alert.alert('Validation', 'Enter a valid mobile number');
      return;
    }

    setSendingMobileOtp(true);

    setTimeout(() => {
      setSendingMobileOtp(false);
      Alert.alert('OTP Sent', 'Mobile OTP sent successfully.');
    }, 1200);
  };

  // -------------------------------
  // MOCK API: VERIFY MOBILE OTP
  // -------------------------------
  const verifyMobileOtp = () => {
    if (!mobileOtp || mobileOtp.length < 4) {
      Alert.alert('Validation', 'Enter the OTP');
      return;
    }

    setVerifyingMobileOtp(true);

    setTimeout(() => {
      setVerifyingMobileOtp(false);
      setMobileVerified(true);
      Alert.alert('Success', 'Mobile number verified successfully.');
    }, 1200);
  };

  // -------------------------------
  // MOCK API: SEND EMAIL OTP
  // -------------------------------
  const sendEmailOtp = () => {
    if (!email || !email.includes('@')) {
      Alert.alert('Validation', 'Enter a valid email');
      return;
    }

    setSendingEmailOtp(true);

    setTimeout(() => {
      setSendingEmailOtp(false);
      Alert.alert('OTP Sent', 'Email OTP sent successfully.');
    }, 1200);
  };

  // -------------------------------
  // MOCK API: VERIFY EMAIL OTP
  // -------------------------------
  const verifyEmailOtp = () => {
    if (!emailOtp || emailOtp.length < 4) {
      Alert.alert('Validation', 'Enter the OTP');
      return;
    }

    setVerifyingEmailOtp(true);

    setTimeout(() => {
      setVerifyingEmailOtp(false);
      setEmailVerified(true);
      Alert.alert('Success', 'Email verified successfully.');
    }, 1200);
  };
  // -------------------------------
  // PREFILL MOBILE & EMAIL FROM CUSTOMER DETAILS
  // -------------------------------
  React.useEffect(() => {
    async function loadCustomerContact() {
      try {
        const username = user?.username;
        if (!username) return;

        const data = await getCustomerDetails(username);
        const p = data?.outParams || {};

        // Only override IF context doesn't already have values
        if (!kycData.contact?.mobile && p.MobileNumber) {
          setMobile(p.MobileNumber.trim());
        }

        if (!kycData.contact?.email && p.Email) {
          setEmail(p.Email.trim());
        }

      } catch (err) {
        console.log("❌ Contact prefill error:", err);
      }
    }

    loadCustomerContact();
  }, []);
  // -------------------------------
  // NEXT STEP
  // -------------------------------
  const handleNext = () => {
    if (!mobileVerified) {
      Alert.alert('Validation', 'Mobile number must be verified.');
      return;
    }
    if (!emailVerified) {
      Alert.alert('Validation', 'Email must be verified.');
      return;
    }

    updateSection('contact', {
      mobile,
      mobileVerified,
      email,
      emailVerified,
    });

    navigation.navigate('KycDocumentsScreen');
  };

  return (
    <View style={layoutStyles.screen}>
      <View style={formStyles.formContainer}>

        <Text style={typography.h3}>KYC Contact Details</Text>

        {/* Mobile */}
        <AppInput
          label="Mobile Number"
          value={mobile}
          onChangeText={setMobile}
          placeholder="Enter Mobile Number"
          keyboardType="phone-pad"
        />

        {!mobileVerified && (
          <View style={{ marginTop: 8 }}>
            <AppButton
              title={sendingMobileOtp ? 'Sending...' : 'Send OTP'}
              onPress={sendMobileOtp}
              disabled={sendingMobileOtp}
            />

            <AppInput
              label="Enter Mobile OTP"
              value={mobileOtp}
              onChangeText={setMobileOtp}
              placeholder="Enter OTP"
              keyboardType="number-pad"
            />

            <AppButton
              title={verifyingMobileOtp ? 'Verifying...' : 'Verify OTP'}
              onPress={verifyMobileOtp}
              disabled={verifyingMobileOtp}
            />
          </View>
        )}

        {mobileVerified && (
          <Text style={[typography.body, { marginTop: 8 }]}>
            ✔ Mobile verified
          </Text>
        )}

        {/* Email */}
        <AppInput
          label="Email Address"
          value={email}
          onChangeText={setEmail}
          placeholder="Enter Email"
          keyboardType="email-address"
          autoCapitalize="none"
        />

        {!emailVerified && (
          <View style={{ marginTop: 8 }}>
            <AppButton
              title={sendingEmailOtp ? 'Sending...' : 'Send Email OTP'}
              onPress={sendEmailOtp}
              disabled={sendingEmailOtp}
            />

            <AppInput
              label="Enter Email OTP"
              value={emailOtp}
              onChangeText={setEmailOtp}
              placeholder="Enter OTP"
              keyboardType="number-pad"
            />

            <AppButton
              title={verifyingEmailOtp ? 'Verifying...' : 'Verify Email OTP'}
              onPress={verifyEmailOtp}
              disabled={verifyingEmailOtp}
            />
          </View>
        )}

        {emailVerified && (
          <Text style={[typography.body, { marginTop: 8 }]}>
            ✔ Email verified
          </Text>
        )}

        {/* Buttons Row */}
        <View style={{ flexDirection: 'row', marginTop: 16 }}>
          <View style={{ flex: 1 }}>
            <AppButton
              title="Back"
              variant="secondary"
              onPress={() => navigation.goBack()}
            />
          </View>
          <View style={{ flex: 1 }}>
            <AppButton
              title="Next"
              onPress={handleNext}
            />
          </View>
        </View>
      </View>
    </View>
  );
}
