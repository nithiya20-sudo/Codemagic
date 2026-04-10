// src/api/auth/kycOTP.js
import { OTP5012 } from '../client';

export async function validateOTP(username, otp) {
  try {
    const url = '/API/KYCDetails/OTPValidation';

    const payload = {
      body: {
        username: username,
        OTP: otp,       
      },
    };

    console.log('📦 About to send validate OTP:');
    console.log('   URL:', OTP5012.defaults.baseURL + url);
    console.log('   Body:', JSON.stringify(payload));

    const response = await OTP5012.post(url, payload);

    console.log('🟢 opt Validation → Response:', JSON.stringify(response.data));
    return response.data;

  } catch (error) {
    console.error('❌ KYC OTP validation status:', error.response?.status);
    console.error('❌ KYC OTP validation data:', JSON.stringify(error.response?.data));
    throw error;
  }
}
