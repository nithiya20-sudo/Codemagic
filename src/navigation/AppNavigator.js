// AppNavigator.js
import React from 'react';
import { TouchableOpacity, Alert } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import LoginScreen from '../screens/LoginScreen';
import SignupScreen from '../screens/SignupScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import DrawerNavigator from './DrawerNavigator';

import UserProfileScreen from '../screens/UserProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';

import QuickLoanScreen from '../screens/QuickLoanScreen';
import NormalLoanScreen from '../screens/NormalLoanScreen';
import LoanStatusScreen from '../screens/LoanStatusScreen';
import KYCDetailsScreen from '../screens/KYCDetailsScreen';
import IncomeDetailsScreen from '../screens/IncomeDetailsScreen';
import CustIncomeScreen from '../screens/CustIncomeScreen';
import LoanStatementScreen from '../screens/LoanStatementScreen';
import OtpVerificationScreen from '../screens/OtpVerificationScreen';
import AffordabilityScreen from '../screens/AffordabilityScreen';
import SplashScreen from '../screens/SplashScreen';

// KYC Wizard Screens
import KycAddressScreen from '../screens/kyc/KycAddressScreen';
import KycEmailScreen from '../screens/kyc/KycEmailScreen';
import KycMobileScreen from '../screens/kyc/KycMobileScreen';
import KycDocumentsScreen from '../screens/kyc/KycDocumentsScreen';
import KycReviewScreen from '../screens/kyc/KycReviewScreen';
import PdfViewerScreen from '../screens/PdfViewerScreen';
import { colors } from '../theme';

const Stack = createNativeStackNavigator();

// ===============================================================
// 🔹 Shared HOME icon (for all KYC screens)
// ===============================================================
function HomeButton(navigation) {
  return (
    <TouchableOpacity
      onPress={() =>
        Alert.alert(
          "Exit KYC?",
          "You can return and complete your KYC later.",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Go Home", onPress: () => navigation.navigate("MainDrawer") }
          ]
        )
      }
      style={{ paddingHorizontal: 12 }}
    >
      <MaterialIcons name="home" size={24} color={colors.primary} />
    </TouchableOpacity>
  );
}

// ===============================================================
// 🔹 Helper to add headerRight to KYC screens only
// ===============================================================
const withKycHeader = (title) => ({
  title,
  headerTitleStyle: { fontFamily: 'Poppins-Regular' },
});

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="Splash"
      screenOptions={{
        headerTitleStyle: {
          fontFamily: 'Poppins-SemiBold',   // or 'Poppins-Regular' if you prefer
          fontSize: 18,
          color: '#000',
        },
        headerBackTitleVisible: false,
      }}
    >

      {/* AUTH SCREENS */}
      <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Signup" component={SignupScreen} options={{ title: 'Sign Up' }} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Forgot Password' }} />

      <Stack.Screen
        name="OtpVerification"
        component={OtpVerificationScreen}
        options={{
          title: 'OTP Verification',
          headerTitleStyle: { fontFamily: 'Poppins-Regular' },
        }}
      />

      {/* MAIN DRAWER */}
      <Stack.Screen name="MainDrawer" component={DrawerNavigator} options={{ headerShown: false }} />

      {/* PROFILE & OTHER SCREENS */}
      <Stack.Screen
        name="UserProfile"
        component={UserProfileScreen}
        options={{ title: 'User Profile' }}
      />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ title: 'Change Password' }}
      />

      <Stack.Screen name="QuickLoan" component={QuickLoanScreen} options={{ title: 'Quick Loan' }} />
      <Stack.Screen name="NormalLoan" component={NormalLoanScreen} options={{ title: 'Normal Loan' }} />
      <Stack.Screen name="LoanStatus" component={LoanStatusScreen} options={{ title: 'Loan Status' }} />

      {/* ========================================================= */}
      {/*                 KYC MAIN DETAILS SCREEN                   */}
      {/* ========================================================= */}
      <Stack.Screen
        name="KYCDetails"
        component={KYCDetailsScreen}
        options={({ navigation }) => ({
          ...withKycHeader("KYC Details"),
          headerRight: () => HomeButton(navigation),
          headerBackVisible: false,
        })}
      />

      <Stack.Screen name="IncomeDetails" component={CustIncomeScreen} options={{ title: 'Income Details' }} />
      <Stack.Screen name="LoanStatement" component={LoanStatementScreen} options={{ title: 'Loan Statement' }} />
      <Stack.Screen name="Affordability" component={AffordabilityScreen} options={{ title: 'Affordability' }} />

      {/* ========================================================= */}
      {/*                    KYC WIZARD SCREENS                     */}
      {/* ========================================================= */}

      <Stack.Screen
        name="KycAddressScreen"
        component={KycAddressScreen}
        options={({ navigation }) => ({
          ...withKycHeader("KYC Address"),
          headerRight: () => HomeButton(navigation),
          headerBackVisible: false,
        })}
      />

      <Stack.Screen
        name="KycEmailScreen"
        component={KycEmailScreen}
        options={({ navigation }) => ({
          ...withKycHeader("Verify Email"),
          headerRight: () => HomeButton(navigation),
          headerBackVisible: false,
        })}
      />

      <Stack.Screen
        name="KycMobileScreen"
        component={KycMobileScreen}
        options={({ navigation }) => ({
          ...withKycHeader("Verify Mobile"),
          headerRight: () => HomeButton(navigation),
          headerBackVisible: false,
        })}
      />

      <Stack.Screen
        name="KycDocumentsScreen"
        component={KycDocumentsScreen}
        options={({ navigation }) => ({
          ...withKycHeader("KYC Documents"),
          headerRight: () => HomeButton(navigation),
          headerBackVisible: false,
        })}
      />

      <Stack.Screen
        name="KycReviewScreen"
        component={KycReviewScreen}
        options={({ navigation }) => ({
          ...withKycHeader("KYC Review"),
          headerRight: () => HomeButton(navigation),
          headerBackVisible: false,
        })}
      />
      <Stack.Screen
        name="PdfViewer"
        component={PdfViewerScreen}
        options={{
          title: "Loan Statement",
          headerBackTitleVisible: false
        }}
      />
    </Stack.Navigator>
  );
}
