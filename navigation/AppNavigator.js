import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import HomeScreen from '../screens/HomeScreen';
import ManualTaskAddingScreen from '../screens/ManualTaskAddingScreen';
import SettingsScreen from '../screens/SettingsScreen';
import CalendarScreen from '../screens/CalendarScreen';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Add Task') iconName = 'add-circle';
          else if (route.name === 'Settings') iconName = 'settings';
          else if (route.name === 'Calendar') iconName = 'calendar';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{ activeTintColor: 'tomato', inactiveTintColor: 'gray' }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Add Task" component={ManualTaskAddingScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
    </Tab.Navigator>
  );
}