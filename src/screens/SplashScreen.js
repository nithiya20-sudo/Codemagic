import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, StatusBar, Animated } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import { getMasterData } from '../api/master/masterDataService';

export default function SplashScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;     // start transparent
  const scaleAnim = useRef(new Animated.Value(0.9)).current;   // slight zoom-in effect

  useEffect(() => {
    // 🔹 Start logo animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
    ]).start();

    // 🔹 Load Master Data (fetch first → if fails, fallback)
    const loadMasterData = async () => {
      try {
        console.log("📡 Loading MasterData...");
        const master = await getMasterData();

        if (master) {
          await EncryptedStorage.setItem(
            'MASTER_DATA',
            JSON.stringify(master)
          );
          console.log("📦 MASTER_DATA saved successfully");
        } else {
          console.log("⚠ MasterData API returned NULL");
        }

      } catch (e) {
        console.log('❌ Splash: MasterData load failed:', e?.message || e);
      }
    };

    loadMasterData();

    // 🔹 Hold for a bit, then fade out & navigate to Login
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start(() => {
        navigation.replace('Login');
      });
    }, 2200);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, navigation]);

  return (
    <View style={styles.container}>
      <StatusBar backgroundColor="#fff" barStyle="dark-content" />
      <Animated.Image
        source={require('../assets/images/logo-caption.png')}
        style={[
          styles.logo,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: 250,
    height: 250,
  },
});
