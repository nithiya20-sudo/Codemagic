// src/api/auth/login.js
import { prodApi } from '../client';

export async function loginUser(payload) {
  console.log('📤 LOGIN REQUEST PAYLOAD:');
  console.log(JSON.stringify(payload, null, 2));

  console.log(
    '🔎 Full URL:',
    prodApi.defaults.baseURL + '/RemoteGateway/AuthenticateUser',
  );
  const { data } = await prodApi.post(
    '/RemoteGateway/AuthenticateUser',
    payload,
  );

  console.log(
    '🔎 Full URL:',
    prodApi.defaults.baseURL + '/RemoteGateway/AuthenticateUser',
  );

  if (!data?.Status) {
    return {
      success: false,
      message: data?.Message || 'Invalid username or password',
    };
  }

  // ✅ Extract the token and required user details
  return {
    success: true,
    token: data.Token,
    fullName: data.FullName,
    role: data?.TokenDetail?.roleNames,
    tenant: data?.TokenDetail?.tenCode,
    userName: data?.Username,
  };
}
