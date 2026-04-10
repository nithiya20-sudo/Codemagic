// src/apihook/useAuth.js
import { loginUser } from '../api/auth';

export function useAuthApi() {
  const signIn = async (username, password) => {
    // Prepare payload for the backend
    const payload = { username, password };
    const data = await loginUser(payload);
    return data; // expected: { token, user }
  };

  // 🧩 TEMP SIMULATION FOR TESTING 2FA
// if (username === 'otpuser') {
//   return {
//     success: true,
//     twoFA: true,
//     tempToken: 'TEMP-12345',
//     message: 'OTP required for verification',
//   };
// }
  return { signIn };
}
