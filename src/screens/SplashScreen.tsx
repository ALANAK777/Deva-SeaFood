import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { APP_CONSTANTS } from '../utils/constants';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Start animations
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

    // Auto-navigate after splash duration
    const timer = setTimeout(() => {
      onFinish?.();
    }, APP_CONSTANTS.SPLASH_DURATION);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={APP_CONSTANTS.COLORS.PRIMARY} />
      
      {/* Background Gradient Effect */}
      <View style={styles.background} />
      
      {/* Logo and App Name */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>🐟</Text>
        </View>
        <Text style={styles.appName}>{APP_CONSTANTS.APP_NAME}</Text>
        <Text style={styles.tagline}>Fresh Seafood, Delivered Daily</Text>
      </Animated.View>

      {/* Loading Spinner */}
      <View style={styles.loadingContainer}>
        <LoadingSpinner color={APP_CONSTANTS.COLORS.WHITE} style={styles.spinnerStyle} />
      </View>

      {/* Version */}
      <View style={styles.versionContainer}>
        <Text style={styles.version}>Version {APP_CONSTANTS.VERSION}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
    justifyContent: 'center',
    alignItems: 'center',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 60,
  },
  logoCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: APP_CONSTANTS.COLORS.WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6.84,
  },
  logoText: {
    fontSize: 48,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: APP_CONSTANTS.COLORS.WHITE,
    marginBottom: 8,
    textAlign: 'center',
  },
  tagline: {
    fontSize: 16,
    color: APP_CONSTANTS.COLORS.WHITE,
    opacity: 0.9,
    textAlign: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    bottom: 120,
  },
  versionContainer: {
    position: 'absolute',
    bottom: 50,
  },
  version: {
    color: APP_CONSTANTS.COLORS.WHITE,
    fontSize: 12,
    opacity: 0.7,
  },
  spinnerStyle: {
    flex: 0,
    backgroundColor: 'transparent',
  },
});
