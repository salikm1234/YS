import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider as PaperProvider } from 'react-native-paper';
import EntryScreen from './EntryScreen';
import SchedulesScreen from './SchedulesScreen';
import AddScreen from './AddScreen';
import ManualScreen from './ManualScreen';
import EditScreen from './EditScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Entry">
          <Stack.Screen name="Entry" component={EntryScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Schedules" component={SchedulesScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Add" component={AddScreen} />
          <Stack.Screen name="Manual" component={ManualScreen} />
          <Stack.Screen name="Edit" component={EditScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
