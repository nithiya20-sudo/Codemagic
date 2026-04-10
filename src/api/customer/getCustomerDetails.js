import { loanApi5015 } from '../client';

export async function getCustomerDetails(customerUserName) {
  try {
    const payload = {
      body: {
        CustomerUserName: customerUserName
      }
    };

    //console.log("📤 Fetching Customer Details with payload:", payload);

    const res = await loanApi5015.post(
      '/API/GetDetails/GetExistingCustomerDetails',
      payload
    );

   // console.log("✅ Customer Details Response:", res.data);
    return res.data;
  } catch (err) {
    console.error(
      "❌ Customer Details API Error:",
      err.response?.data || err.message
    );
    throw err;
  }
}
