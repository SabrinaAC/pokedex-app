// src/navigation/AppNavigator.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View } from 'react-native';

import HomeScreen from '../screens/HomeScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import DetailScreen from '../screens/DetailScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
}

function FavoritesStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="FavoritesList" component={FavoritesScreen} />
      <Stack.Screen name="Detail" component={DetailScreen} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#1A1A2E',
            borderTopColor: '#E63946',
            borderTopWidth: 2,
            height: 60,
          },
          tabBarActiveTintColor: '#E63946',
          tabBarInactiveTintColor: '#666',
          tabBarShowIcon: false,
          tabBarLabelStyle: {
            fontSize: 13,
            fontWeight: 'bold',
            marginBottom: 8,
          },
          tabBarIcon: () => <View />,
        }}
      >
        <Tab.Screen
          name="Pokédex"
          component={HomeStack}
          options={{ tabBarLabel: '🔴 Pokédex' }}
        />
        <Tab.Screen
          name="Favoritos"
          component={FavoritesStack}
          options={{ tabBarLabel: '⭐ Favoritos' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}