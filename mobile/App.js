import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import SearchScreen from './src/screens/SearchScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import ShowDetailScreen from './src/screens/ShowDetailScreen';
import { theme } from './src/services/theme';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="ShowDetail" component={ShowDetailScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
