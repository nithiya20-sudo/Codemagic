// src/api/auth/accountVerification.js
import api, { preAuthApi5012, preAuthApi5010 } from '../client'; // use same axios instance

// ✅ Validate existing customer account
export async function validateAccount(accountNumber) {
  const payload = { body: { AccountNumber: accountNumber } }; // 👈 required structure
  console.log(
    '🌐 Trying:',
    preAuthApi5010.defaults.baseURL +
      '/API/MobileAccessRequest/ValidateAccount',
  );
  console.log('🚀 Payload:', JSON.stringify(payload));

  try {
    const { data } = await preAuthApi5010.post(
      '/API/MobileAccessRequest/ValidateAccount',
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      },
    );

    console.log('✅ ValidateAccount Response:', data);
    return data;
  } catch (err) {
    console.error('❌ ValidateAccount API Error:', err.message);
    throw err;
  }
}

// ✅ Send OTP (MobileOTP)
export async function sendMobileOTP(accountNumber) {
  const payload = { body: { AccountNumber: accountNumber } };

  console.log(
    '🌐 Sending OTP via:',
    preAuthApi5012.defaults.baseURL + '/API/KYCDetails/MobileOTP',
  );
  console.log('🚀 Payload:', JSON.stringify(payload));

  try {
    const { data } = await preAuthApi5012.post(
      '/API/KYCDetails/MobileOTP',
      payload,
    );

    console.log('✅ MobileOTP Response:', data);

    const { outParams } = data || {};
    if (
      data.executionStatus === 'Success' &&
      outParams?.SMSAPIStatus === '00' &&
      !outParams?.SMSAPIError
    ) {
      return {
        success: true,
        message: outParams?.MobileOTPMessage || 'OTP sent successfully.',
      };
    } else {
      return {
        success: false,
        message: outParams?.SMSAPIError || 'Failed to send OTP.',
      };
    }
  } catch (err) {
    console.error('❌ MobileOTP API Error:', err.message);
    throw err;
  }
}

// ✅ Verify OTP (OTPValidation)
export async function verifyMobileOTP(accountNumber, otp) {
  const payload = {
    body: {
      AccountNumber: accountNumber,
      OTP: otp,
    },
  };

  console.log(
    '🌐 Verifying OTP via:',
    preAuthApi5012.defaults.baseURL + '/API/KYCDetails/OTPValidation',
  );
  console.log('🚀 Payload:', JSON.stringify(payload));

  try {
    const { data } = await preAuthApi5012.post(
      '/API/KYCDetails/OTPValidation',
      payload,
    );

    console.log('✅ OTPValidation Response:', data);

    const ok = data?.executionStatus === 'Success';
    const isValid = String(data?.outParams?.IsValid) === '1';

    if (!ok) {
      return {
        success: false,
        valid: false,
        message: data?.executionMessage || 'OTP validation failed.',
      };
    }

    if (!isValid) {
      return {
        success: true,
        valid: false,
        message: 'Invalid OTP. Please try again.',
      };
    }

    return {
      success: true,
      valid: true,
      message: 'OTP verified successfully.',
    };
  } catch (err) {
    console.error('❌ OTPValidation API Error:', err.message);
    throw err;
  }
}
