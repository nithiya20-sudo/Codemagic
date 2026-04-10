// src/api/auth/changePass.js
import { changePass5010 } from '../client';
import EncryptedStorage from 'react-native-encrypted-storage';

export async function updatePassword(oldPassword, newPassword, confirmPassword) {
  try {
    // 🔹 Get stored user info
    const userStr = await EncryptedStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : {};
    const username = user?.username || user?.UserName || user?.userName || '';

    // 🔹 Construct wrapped payload (as per Postman)
    const payload = {
      body: {
        UserName: username,
        OldPassword: oldPassword,
        NewPassword: newPassword,
        ConfirmPassword: confirmPassword,
      },
    };

    const url = '/API/MobileAccessRequest/UpdatePassword';
    console.log('🔎 Full Change Pass URL:', `${changePass5010.defaults.baseURL}${url}`);
    console.log('🔎 Full Change Pass payload:', payload);

    // ✅ POST with { body: { ... } }
    const { data } = await changePass5010.post(url, payload);

    const updateStatus = data?.outParams?.UpdateStatus;
    const updateMessage =
      data?.outParams?.UpdateMessage ||
      data?.executionMessage ||
      'Password updated';

    const success =
      (updateStatus === '1' || updateStatus === 1 )&& data?.executionStatus === 'Success';

    console.log('🟢 ChangePass ← Data:', JSON.stringify(data));
    console.log(success,  updateMessage);
    return { success, message: updateMessage };
  } catch (error) {
    console.error('🔴 UpdatePassword Error:', error?.response?.data || error?.message);
    throw error;
  }
}
