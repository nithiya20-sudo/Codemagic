// src/config/appConfig.js
export const appConfig = {
  auth: {
    // Turn 2FA on/off per client (feature flag)
    enable2FA: false,          // set false to disable OTP flow
    otpChannel: 'SMS',        // 'SMS' | 'EMAIL' | 'BOTH'
    otpLength: 6,             // UI hint only
    otpTTLSeconds: 180,       // UI hint (countdown)
    rememberMeDefault: false, // checkbox default on Login
  },
};
