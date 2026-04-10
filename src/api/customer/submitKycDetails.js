// src/api/customer/submitKycDetails.js

import { kycApi5012 } from '../client'; // <-- uses your existing axios client

/**
 * Submit final KYC details
 * @param {*} kycBody (the JSON object under body)
 * @returns API response
 */
export async function submitKycDetails(kycBody) {
  try {
    const url = '/API/KYCDetails/KYCDetailsValues';

    const payload = {
      body: kycBody,
    };

    console.log(
      '📤 Submitting KYC Details →',
      JSON.stringify(payload, null, 2),
    );
    console.log('🔗 URL:', kycApi5012.defaults.baseURL + url);
    console.log(
      '📡 Final Headers:',
      JSON.stringify(kycApi5012.defaults.headers, null, 2),
    );

    const response = await kycApi5012.post(url, payload);

    console.log(
      '✅ KYC Submit Response:',
      JSON.stringify(response.data, null, 2),
    );

    return response.data;
  } catch (error) {
    console.error(
      '❌ KYC Submit Failed:',
      error.response?.data || error.message,
    );
    throw error;
  }
}
