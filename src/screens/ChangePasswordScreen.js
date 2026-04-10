// // src/screens/ChangePasswordScreen.js
// import React, { useState, useEffect } from 'react';
// import {
//   View,
//   Text,
//   ScrollView,
//   Alert,
//   Keyboard,
//   Animated,
//   TouchableOpacity,
// } from 'react-native';
// import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
// import AppInput from '../ui/AppInput';
// import AppButton from '../ui/AppButton';
// import { formStyles } from '../styles/formstyles';
// import { layoutStyles } from '../styles/layoutStyles';
// import { colors, typography, spacing } from '../theme';
// import { updatePassword } from '../api/auth/changePass';
// import { useHandleAuthError } from '../hooks/useHandleAuthError';
// import EncryptedStorage from 'react-native-encrypted-storage';
// import { setAuthToken } from '../api/client';
// import { useAuth } from '../apicontext/AuthContext';

// /* ──────────── Utility Rules ──────────── */
// const hasMinLen = (s) => s.length >= 8;
// const hasLower = (s) => /[a-z]/.test(s);
// const hasUpper = (s) => /[A-Z]/.test(s);
// const hasNumber = (s) => /\d/.test(s);
// const hasSpecial = (s) => /[^A-Za-z0-9]/.test(s);

// const evaluateRules = (p) => ({
//   min: hasMinLen(p),
//   lower: hasLower(p),
//   upper: hasUpper(p),
//   num: hasNumber(p),
//   special: hasSpecial(p),
// });

// const getStrength = (rules) => {
//   const score = Object.values(rules).filter(Boolean).length;
//   const palette = ['#d9534f', '#f0ad4e', '#ffc107', '#5bc0de', '#28a745'];
//   const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
//   return {
//     color: palette[Math.max(0, score - 1)],
//     text: labels[Math.max(0, score - 1)],
//     score,
//   };
// };

// /* ──────────── Password Input ──────────── */
// const PasswordInput = ({
//   label,
//   placeholder,
//   value,
//   onChangeText,
//   visible,
//   toggleVisible,
// }) => (
//   <View style={formStyles.vstackMd}>
//     <Text style={formStyles.label}>{label}</Text>
//     <View style={{ position: 'relative' }}>
//       <AppInput
//         placeholder={placeholder}
//         value={value}
//         onChangeText={onChangeText}
//         secureTextEntry={!visible}
//         autoCapitalize="none"
//         autoCorrect={false}
//         style={formStyles.input}
//       />
//       <TouchableOpacity
//         onPress={toggleVisible}
//         activeOpacity={0.7}
//         style={{ position: 'absolute', right: 10, top: 12, padding: 6 }}
//       >
//         <MaterialIcons
//           name={visible ? 'visibility' : 'visibility-off'}
//           size={22}
//           color={colors.primary}
//         />
//       </TouchableOpacity>
//     </View>
//   </View>
// );

// /* ──────────── Strength Meter ──────────── */
// const PasswordStrengthMeter = ({ strength }) => {
//   const barAnim = new Animated.Value((strength.score / 5) * 100);
//   Animated.timing(barAnim, {
//     toValue: (strength.score / 5) * 100,
//     duration: 200,
//     useNativeDriver: false,
//   }).start();

//   return (
//     <View style={[formStyles.mbMd]}>
//       <View
//         style={{
//           height: 8,
//           backgroundColor: colors.border,
//           borderRadius: 4,
//           overflow: 'hidden',
//         }}
//       >
//         <Animated.View
//           style={{
//             width: barAnim.interpolate({
//               inputRange: [0, 100],
//               outputRange: ['0%', '100%'],
//             }),
//             height: 8,
//             backgroundColor: strength.color,
//             borderRadius: 4,
//           }}
//         />
//       </View>
//       <Text
//         style={{
//           fontFamily: typography.family.medium,
//           color: strength.color,
//           marginTop: spacing.xs,
//           fontSize: 13,
//         }}
//       >
//         Strength: {strength.text}
//       </Text>
//     </View>
//   );
// };

// /* ──────────── Rule Item ──────────── */
// const RuleItem = ({ ok, label }) => (
//   <View
//     style={{
//       flexDirection: 'row',
//       alignItems: 'center',
//       marginTop: 4,
//       opacity: ok ? 1 : 0.75,
//     }}
//   >
//     <Text
//       style={{
//         color: ok
//           ? colors.success || '#2ecc71'
//           : colors.error || '#e74c3c',
//         fontFamily: typography.family.bold,
//         marginRight: spacing.xs,
//       }}
//     >
//       {ok ? '✓' : '✗'}
//     </Text>
//     <Text
//       style={{
//         color: colors.text || '#222',
//         fontFamily: typography.family.medium,
//         fontSize: 14,
//       }}
//     >
//       {label}
//     </Text>
//   </View>
// );

// /* ──────────── Main Screen ──────────── */
// export default function ChangePasswordScreen({ navigation }) {
//   const [oldPassword, setOldPassword] = useState('');
//   const [newPassword, setNewPassword] = useState('');
//   const [confirmPassword, setConfirmPassword] = useState('');
//   const [matchMsg, setMatchMsg] = useState('');
//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const [visibleOld, setVisibleOld] = useState(false);
//   const [visibleNew, setVisibleNew] = useState(false);
//   const [visibleConfirm, setVisibleConfirm] = useState(false);

//   const [rules, setRules] = useState(evaluateRules(''));
//   const [strength, setStrength] = useState(getStrength(rules));

//   const { handleApiError } = useHandleAuthError();
//   const { signOut } = useAuth?.() || {};

//   /* 🔹 Live update rules & match */
//   useEffect(() => {
//     const r = evaluateRules(newPassword);
//     setRules(r);
//     setStrength(getStrength(r));

//     if (confirmPassword.length > 0) {
//       if (newPassword === confirmPassword) {
//         setMatchMsg('✅ Passwords match');
//         setError('');
//       } else {
//         setMatchMsg('');
//         setError('❌ New and Confirm passwords do not match');
//       }
//     } else {
//       setMatchMsg('');
//     }
//   }, [newPassword, confirmPassword]);

//   /* 🔹 Submit handler with backend UpdateStatus check */
//   const handleSubmit = async () => {
//     Keyboard.dismiss();
//     setError('');
//     setMatchMsg('');

//     if (!oldPassword || !newPassword || !confirmPassword) {
//       setError('Please fill all fields.');
//       return;
//     }

//     const allRulesOk =
//       rules.min && rules.lower && rules.upper && rules.num && rules.special;

//     if (!allRulesOk) {
//       setError('New password does not meet policy requirements.');
//       return;
//     }

//     if (newPassword !== confirmPassword) {
//       setError('New and Confirm passwords do not match.');
//       return;
//     }

//     try {
//       setLoading(true);
//       const res = await updatePassword(oldPassword, newPassword, confirmPassword);

//       const updateStatus = res?.data?.outParams?.UpdateStatus;
//       const updateMsg = res?.data?.outParams?.UpdateMessage;

//       if (updateStatus === '1') {
//         Alert.alert(
//           'Password Updated',
//           `${updateMsg || 'Your password has been changed successfully.'}\n\nPlease log in again.`,
//           [
//             {
//               text: 'OK',
//               onPress: async () => {
//                 try {
//                   await EncryptedStorage.removeItem('token');
//                   await EncryptedStorage.removeItem('user');
//                 } catch {}
//                 setAuthToken(null);
//                 try { signOut && signOut(); } catch {}
//                 navigation.reset({
//                   index: 0,
//                   routes: [{ name: 'Login' }],
//                 });
//               },
//             },
//           ],
//           { cancelable: false }
//         );
//       } else {
//         Alert.alert(
//           'Update Failed',
//           updateMsg || 'Current password is not correct.'
//         );
//       }
//     } catch (err) {
//       const handled = await handleApiError(err);
//       if (!handled) {
//         Alert.alert('Error', 'Unable to update password. Please try again later.');
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const buttonDisabled =
//     loading || newPassword !== confirmPassword || newPassword.length === 0;

//   return (
//     <ScrollView
//       style={layoutStyles.pageContainer}
//       contentContainerStyle={[formStyles.scrollContainer]}
//       keyboardShouldPersistTaps="handled"
//     >
//       <View style={formStyles.card}>
//         <Text style={formStyles.title}>Change Password</Text>

//         <PasswordInput
//           label="Current Password"
//           placeholder="Enter your current password"
//           value={oldPassword}
//           onChangeText={setOldPassword}
//           visible={visibleOld}
//           toggleVisible={() => setVisibleOld((v) => !v)}
//         />

//         <PasswordInput
//           label="New Password"
//           placeholder="Min 8 chars, mix of aA1@"
//           value={newPassword}
//           onChangeText={setNewPassword}
//           visible={visibleNew}
//           toggleVisible={() => setVisibleNew((v) => !v)}
//         />

//         {newPassword.length > 0 && <PasswordStrengthMeter strength={strength} />}

//         <PasswordInput
//           label="Confirm Password"
//           placeholder="Re-enter your new password"
//           value={confirmPassword}
//           onChangeText={setConfirmPassword}
//           visible={visibleConfirm}
//           toggleVisible={() => setVisibleConfirm((v) => !v)}
//         />

//         <View style={[formStyles.mbMd]}>
//           <Text style={formStyles.sectionTitle}>Password must contain:</Text>
//           <RuleItem ok={rules.min} label="At least 8 characters" />
//           <RuleItem ok={rules.lower} label="At least one lowercase letter (a–z)" />
//           <RuleItem ok={rules.upper} label="At least one uppercase letter (A–Z)" />
//           <RuleItem ok={rules.num} label="At least one number (0–9)" />
//           <RuleItem ok={rules.special} label="At least one special character (e.g. !@#$%)" />
//         </View>

//         {/* Messages */}
//         {matchMsg ? (
//           <Text
//             style={{
//               color: colors.success || '#2ecc71',
//               textAlign: 'center',
//               fontFamily: typography.family.medium,
//               marginVertical: spacing.xs,
//             }}
//           >
//             {matchMsg}
//           </Text>
//         ) : null}

//         {error ? (
//           <Text
//             style={{
//               color: colors.error || '#e74c3c',
//               textAlign: 'center',
//               fontFamily: typography.family.medium,
//               marginVertical: spacing.xs,
//             }}
//           >
//             {error}
//           </Text>
//         ) : null}

//         <AppButton
//           title="Update Password"
//           onPress={handleSubmit}
//           loading={loading}
//           disabled={buttonDisabled}
//           variant="primary"
//         />
//       </View>
//     </ScrollView>
//   );
// }
// src/screens/ChangePasswordScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
  Keyboard,
  Animated,
  TouchableOpacity,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AppInput from '../ui/AppInput';
import AppButton from '../ui/AppButton';
import { formStyles } from '../styles/formstyles';
import { layoutStyles } from '../styles/layoutStyles';
import { colors, typography, spacing } from '../theme';
import { updatePassword } from '../api/auth/changePass';
import { useHandleAuthError } from '../hooks/useHandleAuthError';
import EncryptedStorage from 'react-native-encrypted-storage';
import { setAuthToken } from '../api/client';
import { useAuth } from '../apicontext/AuthContext';

/* ──────────── Utility Rules ──────────── */
const hasMinLen = (s) => s.length >= 8;
const hasLower = (s) => /[a-z]/.test(s);
const hasUpper = (s) => /[A-Z]/.test(s);
const hasNumber = (s) => /\d/.test(s);
const hasSpecial = (s) => /[^A-Za-z0-9]/.test(s);

const evaluateRules = (p) => ({
  min: hasMinLen(p),
  lower: hasLower(p),
  upper: hasUpper(p),
  num: hasNumber(p),
  special: hasSpecial(p),
});

const getStrength = (rules) => {
  const score = Object.values(rules).filter(Boolean).length;
  const palette = ['#d9534f', '#f0ad4e', '#ffc107', '#5bc0de', '#28a745'];
  const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  return {
    color: palette[Math.max(0, score - 1)],
    text: labels[Math.max(0, score - 1)],
    score,
  };
};

/* ──────────── Password Input ──────────── */
const PasswordInput = ({
  label,
  placeholder,
  value,
  onChangeText,
  visible,
  toggleVisible,
}) => (
  <View style={formStyles.vstackMd}>
    <Text style={formStyles.label}>{label}</Text>
    <View style={{ position: 'relative' }}>
      <AppInput
        placeholder={placeholder}
        value={value}
        onChangeText={onChangeText}
        secureTextEntry={!visible}
        autoCapitalize="none"
        autoCorrect={false}
        style={formStyles.input}
      />
      <TouchableOpacity
        onPress={toggleVisible}
        activeOpacity={0.7}
        style={{ position: 'absolute', right: 10, top: 12, padding: 6 }}
      >
        <MaterialIcons
          name={visible ? 'visibility' : 'visibility-off'}
          size={22}
          color={colors.primary}
        />
      </TouchableOpacity>
    </View>
  </View>
);

/* ──────────── Strength Meter ──────────── */
const PasswordStrengthMeter = ({ strength }) => {
  const barAnim = new Animated.Value((strength.score / 5) * 100);
  Animated.timing(barAnim, {
    toValue: (strength.score / 5) * 100,
    duration: 200,
    useNativeDriver: false,
  }).start();

  return (
    <View style={[formStyles.mbMd]}>
      <View
        style={{
          height: 8,
          backgroundColor: colors.border,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        <Animated.View
          style={{
            width: barAnim.interpolate({
              inputRange: [0, 100],
              outputRange: ['0%', '100%'],
            }),
            height: 8,
            backgroundColor: strength.color,
            borderRadius: 4,
          }}
        />
      </View>
      <Text
        style={{
          fontFamily: typography.family.medium,
          color: strength.color,
          marginTop: spacing.xs,
          fontSize: 13,
        }}
      >
        Strength: {strength.text}
      </Text>
    </View>
  );
};

/* ──────────── Rule Item ──────────── */
const RuleItem = ({ ok, label }) => (
  <View
    style={{
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 4,
      opacity: ok ? 1 : 0.75,
    }}
  >
    <Text
      style={{
        color: ok ? (colors.success || '#2ecc71') : (colors.error || '#e74c3c'),
        fontFamily: typography.family.bold,
        marginRight: spacing.xs,
      }}
    >
      {ok ? '✓' : '✗'}
    </Text>
    <Text
      style={{
        color: colors.text || '#222',
        fontFamily: typography.family.medium,
        fontSize: 14,
      }}
    >
      {label}
    </Text>
  </View>
);

/* ──────────── Main Screen ──────────── */
export default function ChangePasswordScreen({ navigation }) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [matchMsg, setMatchMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const [visibleOld, setVisibleOld] = useState(false);
  const [visibleNew, setVisibleNew] = useState(false);
  const [visibleConfirm, setVisibleConfirm] = useState(false);

  const [rules, setRules] = useState(evaluateRules(''));
  const [strength, setStrength] = useState(getStrength(rules));

  const { handleApiError } = useHandleAuthError();
  const { signOut } = useAuth?.() || {};

  /* 🔹 Live update rules & match */
  useEffect(() => {
    const r = evaluateRules(newPassword);
    setRules(r);
    setStrength(getStrength(r));

    if (confirmPassword.length > 0) {
      if (newPassword === confirmPassword) {
        setMatchMsg('✅ Passwords match');
        setError('');
      } else {
        setMatchMsg('');
        setError('❌ New and Confirm passwords do not match');
      }
    } else {
      setMatchMsg('');
    }
  }, [newPassword, confirmPassword]);

  // // 🔧 Normalize different possible response shapes & types
  // // ✔️ Robust parser for UpdateStatus/UpdateMessage
  // const parseUpdateResult = (res) => {
  //   // 🔹 Normalize data safely
  //   let data = res?.data ?? res ?? {};
  //   if (typeof data === 'string') {
  //     try {
  //       data = JSON.parse(data);
  //     } catch {
  //       console.log('⚠️ parseUpdateResult: response was plain text, not JSON');
  //       return { statusNum: NaN, statusOk: false, message: 'Invalid response' };
  //     }
  //   }

  //   const out = data?.outParams ?? {};
  //   const rawStatus = out?.UpdateStatus;
  //   const statusNum =
  //     rawStatus === undefined || rawStatus === null || rawStatus === ''
  //       ? NaN
  //       : Number(String(rawStatus).trim());

  //   const statusOk = rawStatus === '1' || rawStatus === 1 || statusNum === 1;

  //   const message =
  //     out?.UpdateMessage ??
  //     data?.executionMessage ??
  //     data?.message ??
  //     '';

  //   console.log('parseUpdateResult →', { rawStatus, statusNum, statusOk, message });
  //   return { statusNum, statusOk, message };
  // };



  /* 🔹 Submit with proper UpdateStatus handling (number vs string) */
  const handleSubmit = async () => {
    Keyboard.dismiss();
    setError('');
    setMatchMsg('');

    if (!oldPassword || !newPassword || !confirmPassword) {
      setError('Please fill all fields.');
      return;
    }

    const allRulesOk =
      rules.min && rules.lower && rules.upper && rules.num && rules.special;

    if (!allRulesOk) {
      setError('New password does not meet policy requirements.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New and Confirm passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await updatePassword(oldPassword, newPassword, confirmPassword);

      // const { statusOk, message } = parseUpdateResult(res);

      if (res.success===true) {
        Alert.alert(
          'Update Success',
          `${res.message || 'Your password has been changed successfully.'}\n\nPlease log in again.`,
          [
            {
              text: 'OK',
              onPress: async () => {
                try {
                  await EncryptedStorage.removeItem('token');
                  await EncryptedStorage.removeItem('user');
                } catch { }
                setAuthToken(null);
                try { signOut && signOut(); } catch { }
                navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
              },
            },
          ],
          { cancelable: false }
        );
      } else {
        // 0 or any non-success → show backend reason if available
        Alert.alert('Update Failed', res.message || 'Current Password is not correct');
      }
    } catch (err) {
      const handled = await handleApiError(err);
      if (!handled) {
        Alert.alert('Error', 'Unable to update password. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const buttonDisabled =
    loading || newPassword !== confirmPassword || newPassword.length === 0;

  return (
    <ScrollView
      style={layoutStyles.pageContainer}
      contentContainerStyle={[formStyles.scrollContainer]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={formStyles.card}>
        <Text style={formStyles.title}>Change Password</Text>

        <PasswordInput
          label="Current Password"
          placeholder="Enter your current password"
          value={oldPassword}
          onChangeText={setOldPassword}
          visible={visibleOld}
          toggleVisible={() => setVisibleOld((v) => !v)}
        />

        <PasswordInput
          label="New Password"
          placeholder="Min 8 chars, mix of aA1@"
          value={newPassword}
          onChangeText={setNewPassword}
          visible={visibleNew}
          toggleVisible={() => setVisibleNew((v) => !v)}
        />

        {newPassword.length > 0 && <PasswordStrengthMeter strength={strength} />}

        <PasswordInput
          label="Confirm Password"
          placeholder="Re-enter your new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          visible={visibleConfirm}
          toggleVisible={() => setVisibleConfirm((v) => !v)}
        />

        <View style={[formStyles.mbMd]}>
          <Text style={formStyles.sectionTitle}>Password must contain:</Text>
          <RuleItem ok={rules.min} label="At least 8 characters" />
          <RuleItem ok={rules.lower} label="At least one lowercase letter (a–z)" />
          <RuleItem ok={rules.upper} label="At least one uppercase letter (A–Z)" />
          <RuleItem ok={rules.num} label="At least one number (0–9)" />
          <RuleItem ok={rules.special} label="At least one special character (e.g. !@#$%)" />
        </View>

        {/* Messages */}
        {matchMsg ? (
          <Text
            style={{
              color: colors.success || '#2ecc71',
              textAlign: 'center',
              fontFamily: typography.family.medium,
              marginVertical: spacing.xs,
            }}
          >
            {matchMsg}
          </Text>
        ) : null}

        {error ? (
          <Text
            style={{
              color: colors.error || '#e74c3c',
              textAlign: 'center',
              fontFamily: typography.family.medium,
              marginVertical: spacing.xs,
            }}
          >
            {error}
          </Text>
        ) : null}

        <AppButton
          title="Update Password"
          onPress={handleSubmit}
          loading={loading}
          disabled={buttonDisabled}
          variant="primary"
        />
      </View>
    </ScrollView>
  );
}
