import { GetCustIncome5011 } from '../client';

export async function getCustomerDetails(customerUserName) {
  try {
    const payload = {
      body: {
        UserName: customerUserName
      }
    };

    console.log("📤 Fetching Customer Income Details with payload:", payload);

    const res = await GetCustIncome5011.post(
      '/API/IncomeMasterDetails/GetIncomeDetails',
      payload
    );

    console.log("✅ Customer Income Details Response:", res.data);
    return res.data;
  } catch (err) {
    console.error(
      "❌ Customer Details API Error:",
      err.response?.data || err.message
    );
    throw err;
  }
}
