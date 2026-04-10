// src/api/customer/updateCustomerIncome.js
import { UpdateCustIncome5011 } from '../client';

export async function updateCustomerIncome(payload) {
  try {
    const body = {
      body: payload,
    };

    console.log('📤 Update Income Payload:', JSON.stringify(body, null, 2));

    const res = await UpdateCustIncome5011.post(
      '/API/IncomeMasterDetails/update',
      body
    );

    console.log('✅ Update Income Response:', res.data);
    return res.data;
  } catch (err) {
    console.error(
      '❌ Update Income API Error:',
      err.response?.data || err.message
    );
    throw err;
  }
}
