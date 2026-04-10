// src/api/auth/forgetPassword.js
import { preAuthApi5010 } from '../client';

export async function forgetPassword({ userName, otp, newPassword, confirmPassword }) {
    try {
        const url = '/API/MobileAccessRequest/ForgetPassword';
        const payload = {
            body: {
                UserName: userName,
                OTP: otp,
                NewPassword: newPassword,
                ConfirmPassword: confirmPassword,
            },
        };

        console.log('🔎 Full Change Pass URL:', `${preAuthApi5010.defaults.baseURL}${url}`);
        console.log('🔎 Full Change Pass payload:', payload);

        const response = await preAuthApi5010.post(url, payload);

        console.log('🟢 ChangePass ← Data:', JSON.stringify(response.data));

        return response.data;
    } catch (error) {
        console.error('ForgetPassword API Error:', error);
        throw error;
    }
}
