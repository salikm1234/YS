import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, DeviceEventEmitter } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFormattedDate } from '../utils/TimeUtils';
import GlobalStyles from '../styles/GlobalStyles';

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(getFormattedDate(new Date())); // Default to today
  const [tasks, setTasks] = useState([]);
  const [busyTimes, setBusyTimes] = useState([]);

  const refreshData = async (date) => {
    // Fetch tasks for the selected date
    const storedTasks = JSON.parse(await AsyncStorage.getItem('tasks')) || [];
    const filteredTasks = storedTasks.filter((task) => task.date === date);
    setTasks(filteredTasks);

    // Fetch busy times for the selected date
    const storedBusyTimes = JSON.parse(await AsyncStorage.getItem('busyTimes')) || [];
    const filteredBusyTimes = storedBusyTimes.filter((busyTime) => busyTime.date === date);
    setBusyTimes(filteredBusyTimes);
  };

  useEffect(() => {
    // Initial load
    refreshData(selectedDate);

    // Listener for task and busy time updates
    const taskListener = DeviceEventEmitter.addListener('taskAdded', (date) => {
      if (date === selectedDate) {
        refreshData(date);
      }
    });

    const busyTimeListener = DeviceEventEmitter.addListener('busyTimeUpdated', (date) => {
      if (date === selectedDate) {
        refreshData(date);
      }
    });

    return () => {
      taskListener.remove();
      busyTimeListener.remove();
    };
  }, [selectedDate]);

  const deleteTask = async (id) => {
    const storedTasks = JSON.parse(await AsyncStorage.getItem('tasks')) || [];
    const updatedTasks = storedTasks.filter((task) => task.id !== id);
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    refreshData(selectedDate);
  };

  return (
    <View style={GlobalStyles.container}>
      <Text style={GlobalStyles.heading}>Calendar</Text>

      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{ [selectedDate]: { selected: true, selectedColor: 'tomato' } }}
      />

      <Text style={styles.sectionHeading}>Tasks</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>{item.name}</Text>
            <TouchableOpacity onPress={() => deleteTask(item.id)}>
              <Text style={styles.deleteButton}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <Text style={styles.sectionHeading}>Busy Times</Text>
      <FlatList
        data={busyTimes}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.listItem}>
            <Text>
              {item.type} Busy Time: {item.date}, {new Date(item.startTime).toLocaleTimeString()} -{' '}
              {new Date(item.endTime).toLocaleTimeString()} ({item.recurrence})
            </Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  deleteButton: {
    color: 'red',
  },
});