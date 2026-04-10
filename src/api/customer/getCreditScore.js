// src/api/customer/getCreditScore.js
import { loanApi5015 } from '../client'; // or correct API client

export async function getCreditScore(customerUserName) {
  // Adjust URL and payload as per your actual API
  const payload = {
      body: {
        CustomerUserName: customerUserName
      }
    };

  console.log('📡 CreditScore payload:', JSON.stringify(payload, null, 2));

  const { data } = await loanApi5015.post('/API/GetDetails/GetCreditScore', payload);
    console.log(JSON.stringify(data));
  return data;
}
