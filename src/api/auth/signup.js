// src/api/signup.js
import { preAuthApi5010 } from '../client';
import uuid from 'react-native-uuid';

/**
 * Submit Mobile Access Request (Existing Customer)
 * Endpoint: /API/MobileAccessRequest/MobileAccessRequestCustomer
 * Required: AccountNumber, SourceInstanceId, SelectCustomerType="Existing Customer"
 */
export async function submitMobileAccessRequestExisting({
  accountNumber,
  sourceInstanceId=uuid.v4(),
  updatedBy = null, // optional for now
}) {
  const payload = {
    body: {
      SelectCustomerType: 'Existing Customer',
      SelectAccountType: '',
      SelectEmployer: '',
      MobileNumber: '',
      NationalId: '',
      FirstName: '',
      MiddleName: '',
      LastName: '',
      Gender: '',
      Province: '',
      District: '',
      Address: '',
      Branch: '',
      SourceInstanceId: sourceInstanceId,     // <-- REQUIRED
      UpdatedBy: updatedBy,                    // <-- your user id if available
      DateOfBirth: '',
      DocumentType: 'null',
      DocumentId: 'null',
      DocumentExpiryDate: '',
      CustomerId: '',
      Email: '',
      MaritalStatus: '',
      ResidentialStatus: '',
      AccountNumber: accountNumber,            // <-- REQUIRED
    },
  };
console.log(payload)
  const res = await preAuthApi5010.post(
    '/API/MobileAccessRequest/MobileAccessRequestCustomer',
    payload
  );

  // Expected success shape:
  // {
  //   executionStatus: "Success",
  //   instanceId: "cf73bdfa-....",
  //   outParams: { APIRequestId: "MARREQ202531000712" }
  // }
  const data = res?.data || {};
  const ok = data?.executionStatus === 'Success';
  const apiRequestId = data?.outParams?.APIRequestId || null;

  return { ok, apiRequestId, raw: data };
}
