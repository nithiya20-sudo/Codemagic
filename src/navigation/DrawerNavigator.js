// src/navigation/DrawerNavigator.js
import React from 'react';
import { Alert, Text, TouchableOpacity, StatusBar, View } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from '@react-navigation/drawer';

import HomeScreen from '../screens/HomeScreen';
import UserProfileScreen from '../screens/UserProfileScreen';
import ChangePasswordScreen from '../screens/ChangePasswordScreen';
import { useAuth } from '../apicontext/AuthContext';
import { headerStyles } from '../styles/headerStyles';
import { colors, typography, spacing } from '../theme';
import { useKyc } from '../screens/kyc/KycContext';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator({ navigation }) {
  const { user, logout } = useAuth();
  const { resetKyc } = useKyc();
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Do you really want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            resetKyc();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          },
        },
      ],
      { cancelable: true },
    );
  };

  return (
    <>
      <StatusBar
        backgroundColor={colors.primaryDark}
        barStyle="light-content"
      />

      <Drawer.Navigator
        initialRouteName="Home"
        screenOptions={{
          // 🔹 Header styling
          headerStyle: { backgroundColor: colors.primaryDark },
          headerTintColor: colors.onPrimary,
          headerTitleAlign: 'left',
          headerTitle: props => (
            <Text
              style={{
                fontFamily: typography.family.semibold,
                fontSize: spacing.lg + 2,
                lineHeight: spacing.xl - 4,
                color: colors.onPrimary,
              }}
            >
              {props.children}
            </Text>
          ),

          // 🔹 Drawer styling
          drawerActiveTintColor: colors.onPrimary,
          drawerActiveBackgroundColor: colors.primary,
          drawerInactiveTintColor: colors.text,
          drawerLabelStyle: {
            fontFamily: typography.family.medium,
            fontSize: spacing.md + 4,
          },
          drawerContentStyle: { backgroundColor: colors.surface },
        }}
        drawerContent={props => (
          <DrawerContentScrollView
            {...props}
            contentContainerStyle={{ flexGrow: 1 }}
          >
            {/* 🔹 Drawer Header with user info */}
            <View
              style={{
                backgroundColor: colors.primaryDark,
                paddingVertical: spacing.lg,
                paddingHorizontal: spacing.lg,
                flexDirection: 'row',
                alignItems: 'center',
                borderBottomLeftRadius: spacing.lg,
                borderBottomRightRadius: spacing.lg,
                shadowColor: colors.shadow,
                shadowOpacity: 0.1,
                shadowRadius: spacing.sm,
                shadowOffset: { width: 0, height: spacing.xs },
                elevation: 3,
              }}
            >
              <View
                style={{
                  width: spacing.xl + spacing.md,
                  height: spacing.xl + spacing.md,
                  borderRadius: (spacing.xl + spacing.md) / 2,
                  backgroundColor: colors.surface,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: spacing.md,
                }}
              >
                <MaterialIcons
                  name="person"
                  size={spacing.lg + spacing.sm}
                  color={colors.primaryDark}
                />
              </View>

              <View style={{ flexShrink: 1 }}>
                <Text
                  style={{
                    fontFamily: typography.family.semibold,
                    fontSize: spacing.md + 4,
                    lineHeight: spacing.lg + 6,
                    color: colors.onPrimary,
                  }}
                  numberOfLines={1}
                >
                  {user?.fullName || user?.username || 'User'}
                </Text>
              </View>
            </View>

            {/* 🔹 Separator below header to prevent overlap */}
            <View
              style={{
                height: spacing.xs,
                backgroundColor: colors.surface,
                borderTopWidth: 1,
                borderColor: colors.border,
                marginTop: spacing.sm,
                marginBottom: spacing.md,
              }}
            />

            {/* 🔹 Drawer menu items */}
            <View
              style={{
                flex: 1,
                backgroundColor: colors.surface,
                paddingTop: spacing.xs,
              }}
            >
              <DrawerItemList {...props} />
            </View>

            {/* 🔹 Logout item */}
            <DrawerItem
              label={() => (
                <Text
                  style={{
                    fontFamily: typography.family.medium,
                    fontSize: spacing.md + 2,
                    color: colors.primaryDark,
                  }}
                >
                  Logout
                </Text>
              )}
              onPress={handleLogout}
              icon={({ size }) => (
                <MaterialIcons
                  name="logout"
                  size={size}
                  color={colors.primaryDark}
                />
              )}
              style={{
                borderTopWidth: 1,
                borderColor: colors.border,
                marginTop: spacing.sm,
                marginBottom: spacing.lg,
              }}
            />
          </DrawerContentScrollView>
        )}
      >
        {/* ✅ Home Screen with brand header */}
        <Drawer.Screen
          name="Home"
          component={HomeScreen}
          options={({ navigation }) => ({
            headerTitle: '',
            headerLeft: () => (
              <TouchableOpacity
                onPress={() => navigation.toggleDrawer()}
                style={headerStyles.leftWrap}
                hitSlop={{
                  top: spacing.sm,
                  bottom: spacing.sm,
                  left: spacing.sm,
                  right: spacing.sm,
                }}
              >
                <MaterialIcons
                  name="menu"
                  size={spacing.lg + 4}
                  color={colors.onPrimary}
                />
                <Text style={headerStyles.leftText}>Home</Text>
              </TouchableOpacity>
            ),
            headerRight: () => (
              <TouchableOpacity
                onPress={() => navigation.navigate('UserProfile')}
                style={headerStyles.rightWrap}
                hitSlop={{
                  top: spacing.sm,
                  bottom: spacing.sm,
                  left: spacing.sm,
                  right: spacing.sm,
                }}
              >
                <MaterialIcons
                  name="person-outline"
                  size={spacing.lg}
                  color={colors.onPrimary}
                />
                <Text style={headerStyles.rightText}>
                  {user?.fullName || user?.username || 'User'}
                </Text>
              </TouchableOpacity>
            ),
          })}
        />

        {/* ✅ Other Screens */}
        <Drawer.Screen
          name="UserProfile"
          component={UserProfileScreen}
          options={{
            title: 'User Profile',
            drawerLabel: 'User Profile',
          }}
        />
        <Drawer.Screen
          name="ChangePassword"
          component={ChangePasswordScreen}
          options={{
            title: 'Change Password',
            drawerLabel: 'Change Password',
          }}
        />
      </Drawer.Navigator>
    </>
  );
}
