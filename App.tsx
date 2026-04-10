// /**
//  * Sample React Native App
//  * https://github.com/facebook/react-native
//  *
//  * @format
//  */

// import { NewAppScreen } from '@react-native/new-app-screen';
// import { StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
// import {
//   SafeAreaProvider,
//   useSafeAreaInsets,
// } from 'react-native-safe-area-context';

// function App() {
//   const isDarkMode = useColorScheme() === 'dark';

//   return (
//     <SafeAreaProvider>
//       <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
//       <AppContent />
//     </SafeAreaProvider>
//   );
// }

// function AppContent() {
//   const safeAreaInsets = useSafeAreaInsets();

//   return (
//     <View style={styles.container}>
//       <NewAppScreen
//         templateFileName="App.tsx"
//         safeAreaInsets={safeAreaInsets}
//       />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
// });

// export default App;import React, { useEffect } from 'react';
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { ActivityIndicator, View, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler'; // <-- ADD THIS IMPORT

import { colors } from './src/theme';
import AppNavigator from './src/navigation/AppNavigator';
import { getToken } from './src/utils/secureStore';
import { setAuthToken } from './src/api/client';
import { AuthProvider, useAuth } from './src/apicontext/AuthContext';
import { KycProvider } from './src/screens/kyc/KycContext';
import ActivityProvider from './src/utils/ActivityProvider';
import SessionProvider from './src/utils/SessionProvider';

function AppContent() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.link || '#fff',
        }}
      >
        <ActivityIndicator size="large" color={colors.primary || '#007bff'} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <AppNavigator />
    </NavigationContainer>
  );
}
export default function App() {
  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = await getToken();
        if (token) setAuthToken(token);
      } catch (err) {
        console.error(err);
      }
    };
    initAuth();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ActivityProvider>
        <AuthProvider>
          <KycProvider>
            <NavigationContainer>
              <SessionProvider>
                <StatusBar barStyle="dark-content" backgroundColor="#fff" />
                <AppNavigator />
              </SessionProvider>
            </NavigationContainer>
          </KycProvider>
        </AuthProvider>
      </ActivityProvider>
    </GestureHandlerRootView>
  );
}
