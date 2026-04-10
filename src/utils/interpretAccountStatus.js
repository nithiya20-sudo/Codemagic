// src/utils/interpretAccountStatus.js
import { sendMobileOTP } from '../api/auth';
import { Alert } from 'react-native';

export async function interpretAccountStatus(outParams, accountNo, setStep, setResendTimer) {
  if (!outParams) {
    Alert.alert('Error', 'Invalid API response format.');
    return;
  }

  const { AccountNumber, UserName, RequestInProgress, IsExists } = outParams;

  // ✅ Check #1: New IsExists flag
  if (IsExists === '0') {
    Alert.alert('Invalid Account', 'Account number not found. Please verify and try again.');
    return;
  }

  if (IsExists === '1') {
    // Scenario 1: Already Registered
    if (UserName && RequestInProgress === '0') {
      Alert.alert('Already Registered', `Mobile access already activated for ${UserName}.`);
      return;
    }

    // Scenario 2: Request In Progress
    if (!UserName && RequestInProgress === '1') {
      Alert.alert(
        'Request In Progress',
        'A mobile access request is already being processed for this account.'
      );
      return;
    }

    // Scenario 3: Valid Account — send OTP
    if (!UserName && RequestInProgress === '0') {
      try {
        const otpRes = await sendMobileOTP(accountNo.trim());
        if (otpRes.success) {
          Alert.alert('OTP Sent', otpRes.message);
          setStep(2);
          setResendTimer(30);
        } else {
          Alert.alert('Error', otpRes.message || 'Failed to send OTP.');
        }
      } catch (err) {
        console.log(err)
        Alert.alert('Error', 'Unable to send OTP. Please try again.');
      }
      return;
    }

    Alert.alert('Notice', 'Unexpected account status. Please contact support.');
    return;
  }

  // 🔙 Backward compatibility (older API without IsExists)
  if (typeof IsExists === 'undefined') {
    if (!AccountNumber && UserName && RequestInProgress === '0') {
      Alert.alert('Already Registered', `Mobile access already activated for ${UserName}.`);
      return;
    }
    if (!AccountNumber && !UserName && RequestInProgress === '1') {
      Alert.alert('Request In Progress', 'A mobile access request is already being processed.');
      return;
    }
    if (AccountNumber && !UserName && RequestInProgress === '0') {
      try {
        const otpRes = await sendMobileOTP(accountNo.trim());
        if (otpRes.success) {
          Alert.alert('OTP Sent', otpRes.message);
          setStep(2);
          setResendTimer(30);
        } else {
          Alert.alert('Error', otpRes.message || 'Failed to send OTP.');
        }
      } catch (err) {
        Alert.alert('Error', 'Unable to send OTP. Please try again.');
      }
      return;
    }
    if (!AccountNumber && !UserName && RequestInProgress === '0') {
      Alert.alert('Invalid Account', 'Account number not found. Please verify and try again.');
      return;
    }
    Alert.alert('Notice', 'Unexpected account status. Please contact support.');
  }
}
