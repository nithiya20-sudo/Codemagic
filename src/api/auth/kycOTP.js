// src/api/auth/kycOTP.js
import { OTP5012 } from '../client';

export async function sendKycOtp(username, otpType, otpResource) {
  try {
    const url = '/API/KYCDetails/KYCOTP';

    const payload = {
      body: {
        UserName: username,
        OTPType: otpType,       // 'E' or 'M'
        OTPResource: otpResource
      },
    };

    console.log('📦 About to send KYC OTP:');
    console.log('   URL:', OTP5012.defaults.baseURL + url);
    console.log('   Body:', JSON.stringify(payload));

    const response = await OTP5012.post(url, payload);

    console.log('🟢 sendKycOtp → Response:', JSON.stringify(response.data));
    return response.data;

  } catch (error) {
    console.error('❌ KYC OTP failed status:', error.response?.status);
    console.error('❌ KYC OTP failed data:', JSON.stringify(error.response?.data));
    throw error;
  }
}
