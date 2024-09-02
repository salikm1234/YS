import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from './HomeScreen';
import CalendarScreen from './CalendarScreen';
import GoalSelectionScreen from './GoalSelectionScreen';
import SettingsScreen from './SettingsScreen';
import Ionicons from 'react-native-vector-icons/Ionicons';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen 
      name="HomeMain" 
      component={HomeScreen} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="GoalSelection" 
      component={GoalSelectionScreen} 
      options={{ title: 'Select Goals' }} 
    />
  </Stack.Navigator>
);

const AppNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;

        if (route.name === 'Home') {
          iconName = 'home-outline';
        } else if (route.name === 'Calendar') {
          iconName = 'calendar-outline';
        } else if (route.name === 'Settings') {
          iconName = 'settings-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
    })}
  >
    <Tab.Screen 
      name="Home" 
      component={HomeStack} 
    />
    <Tab.Screen 
      name="Calendar" 
      component={CalendarScreen} 
    />
    <Tab.Screen 
      name="Settings" 
      component={SettingsScreen} 
    />
  </Tab.Navigator>
);

export default AppNavigator;
