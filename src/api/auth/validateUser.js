// src/api/auth/validateUser.js
import { preAuthApi5010 } from '../client';

export async function validateUser(userName) {
    try {
        const url = '/API/MobileAccessRequest/ValidateUser';
        const payload = {
            body: {
                UserName: userName
            },
        };

        console.log('📦 About to send ValidateUser:');
        console.log('   URL:', preAuthApi5010.defaults.baseURL + '/API/MobileAccessRequest/ValidateUser');
        console.log('   Headers:', JSON.stringify(preAuthApi5010.defaults.headers, null, 2));
        console.log('   Body:', JSON.stringify(payload));

        const response = await preAuthApi5010.post(url, payload);

        console.log('🟢 ChangePass ← Data:', JSON.stringify(response.data));
        return response.data;

    } catch (error) {
        console.error('❌ ValidateUser failed status:', error.response?.status);
        console.error('❌ ValidateUser failed data:', JSON.stringify(error.response?.data));
        throw error;
    }
}
