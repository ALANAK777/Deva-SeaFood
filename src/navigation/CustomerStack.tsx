import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

// Customer screens
import {
  ProductCatalogScreen,
  CartScreen,
  OrderHistoryScreen,
  CustomerProfileScreen,
  ProductDetailScreen,
  CheckoutScreen,
  EditProfileScreen,
} from '../screens/customer';

import { APP_CONSTANTS } from '../utils/constants';
import { CustomerTabParamList, CustomerStackParamList } from '../types/navigation';

const Tab = createBottomTabNavigator<CustomerTabParamList>();
const Stack = createNativeStackNavigator<CustomerStackParamList>();

const CustomerTabs: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Catalog':
              iconName = focused ? 'fish' : 'fish-outline';
              break;
            case 'Cart':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Orders':
              iconName = focused ? 'receipt' : 'receipt-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'help-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: APP_CONSTANTS.COLORS.PRIMARY,
        tabBarInactiveTintColor: APP_CONSTANTS.COLORS.TEXT_SECONDARY,
        tabBarStyle: {
          backgroundColor: APP_CONSTANTS.COLORS.BACKGROUND,
          borderTopColor: APP_CONSTANTS.COLORS.BORDER,
        },
        headerStyle: {
          backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Catalog" 
        component={ProductCatalogScreen}
        options={{ title: 'Products' }}
      />
      <Tab.Screen 
        name="Cart" 
        component={CartScreen}
        options={{ title: 'Cart' }}
      />
      <Tab.Screen 
        name="Orders" 
        component={OrderHistoryScreen}
        options={{ title: 'My Orders' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={CustomerProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export const CustomerStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="CustomerTabs" component={CustomerTabs} />
      <Stack.Screen 
        name="ProductDetail" 
        component={ProductDetailScreen}
        options={{
          headerShown: true,
          title: 'Product Details',
          headerStyle: {
            backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="Checkout" 
        component={CheckoutScreen}
        options={{
          headerShown: true,
          title: 'Checkout',
          headerStyle: {
            backgroundColor: APP_CONSTANTS.COLORS.PRIMARY,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
      <Stack.Screen 
        name="EditProfile" 
        component={EditProfileScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
};
