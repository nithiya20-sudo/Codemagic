// src/api/customer/loans.js
import { customerApi5016 } from '../client';

/**
 * Get Customer Loan Accounts
 * Body: { body: { UserId: "<username>" } }
 * Note: Bearer token is auto-added by client.js
 */
export async function fetchCustomerLoanAccounts(username) {
  try {
    const payload = {
      body: {
        UserName: String(username),
      },
    };

    console.log('📦 Payload:', JSON.stringify(payload, null, 2));
    console.log(
      '🔗 URL:',
      customerApi5016.defaults.baseURL + '/API/CustomerAccountDetails/AccountDetails'
    );

    const { data } = await customerApi5016.post(
      '/API/CustomerAccountDetails/AccountDetails',
      payload
    );

    if (data?.executionStatus !== 'Success') {
      throw new Error(data?.executionMessage || 'Failed to load accounts');
    }

    const rows = data?.gridParams?.CustomerAccountDetails || {};
    return Object.values(rows).map((r) => ({
      accountNumber: r?.AccountNumber,
      accountDescription: r?.AccountDescription,
    }));
  } catch (err) {
    console.error('❌ account load error:', err.message);
    throw err;
  }
}
