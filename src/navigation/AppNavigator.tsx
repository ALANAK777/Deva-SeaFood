import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAppDispatch, useAppSelector } from '../hooks/redux';
import { checkAuthStatus } from '../store/authSlice';
import { APP_CONSTANTS } from '../utils/constants';

import { SplashScreen } from '../screens/SplashScreen';
import { AuthStack } from './AuthStack';
import { CustomerStack } from './CustomerStack';
import { AdminStack } from './AdminStack';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);
  
  // State to control splash screen visibility
  const [showSplash, setShowSplash] = useState(true);
  const [authCheckCompleted, setAuthCheckCompleted] = useState(false);

  // Handle splash screen completion
  const handleSplashFinish = () => {
    console.log('🎬 AppNavigator - Splash screen finished, starting auth check');
    setShowSplash(false);
    // Start auth check immediately after splash
    dispatch(checkAuthStatus());
  };

  // Track when auth check is completed
  useEffect(() => {
    if (!showSplash && !isLoading) {
      setAuthCheckCompleted(true);
      console.log('🔄 AppNavigator - Auth check completed:', {
        isAuthenticated,
        userId: user?.id,
        userRole: user?.role,
        timestamp: new Date().toISOString()
      });
    }
  }, [showSplash, isLoading, isAuthenticated, user]);

  // Show splash screen first
  if (showSplash) {
    console.log('🌟 AppNavigator - Showing splash screen');
    return <SplashScreen onFinish={handleSplashFinish} />;
  }

  // Show loading during auth check
  if (!authCheckCompleted || isLoading) {
    console.log('⏳ AppNavigator - Checking authentication status...');
    return (
      <SplashScreen 
        onFinish={() => {}} // No auto-finish during auth check
      />
    );
  }

  console.log('🎯 AppNavigator - Rendering navigation based on auth state:', {
    isAuthenticated,
    userRole: user?.role,
    navigatingTo: !isAuthenticated ? 'Auth' : user?.role === 'admin' ? 'Admin' : 'Customer'
  });

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : user?.role === 'admin' ? (
          <Stack.Screen name="Admin" component={AdminStack} />
        ) : (
          <Stack.Screen name="Customer" component={CustomerStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};
