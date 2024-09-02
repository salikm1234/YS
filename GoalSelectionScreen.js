import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TouchableOpacity, StyleSheet, TextInput, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';

const GoalSelectionScreen = ({ route, navigation }) => {
  const { date } = route.params || { date: new Date().toISOString().split('T')[0] };  // Default to today's date
  const [goalText, setGoalText] = useState('');
  const [duration, setDuration] = useState('');  
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [scheduledGoals, setScheduledGoals] = useState([]);
  const [sleepTime, setSleepTime] = useState(null);
  const [wakeUpTime, setWakeUpTime] = useState(null);
  const [busyTimes, setBusyTimes] = useState([]);

  useEffect(() => {
    loadScheduledGoals();
    loadDaySchedule();
  }, []);

  const loadDaySchedule = async () => {
    const localDate = new Date(date);
    const dayOfWeek = localDate.toLocaleString('en-us', { weekday: 'short' });
    const schedule = await AsyncStorage.getItem(dayOfWeek);
    const parsedSchedule = schedule ? JSON.parse(schedule) : { sleepTime: null, wakeUpTime: null, busyTimes: [] };
    setSleepTime(parsedSchedule.sleepTime ? new Date(parsedSchedule.sleepTime) : null);
    setWakeUpTime(parsedSchedule.wakeUpTime ? new Date(parsedSchedule.wakeUpTime) : null);
    setBusyTimes(parsedSchedule.busyTimes || []);
  };

  const loadScheduledGoals = async () => {
    const existingGoals = await AsyncStorage.getItem(date);
    if (existingGoals) {
      setScheduledGoals(JSON.parse(existingGoals));
    }
  };

  const addGoal = () => {
    if (!goalText || !duration) {
      Alert.alert('Error', 'Please enter both a goal and duration.');
      return;
    }

    const goal = {
      id: Date.now().toString(),
      name: goalText.trim(),
      duration: parseInt(duration, 10),
      dimension: 'Custom',
      startTime: null,
      endTime: null,
    };

    const availableSlot = findAvailableTimeSlot(goal.duration);
    if (!availableSlot) {
      Alert.alert('Error', 'No available time slot for this task.');
      return;
    }

    goal.startTime = availableSlot.startTime;
    goal.endTime = new Date(availableSlot.startTime.getTime() + goal.duration * 60000);

    setSelectedGoals(prevGoals => [...prevGoals, goal]);
    setGoalText('');
    setDuration('');
  };

  const findAvailableTimeSlot = (duration) => {
    if (!wakeUpTime || !sleepTime) {
      Alert.alert('Error', 'Please make sure both sleep and wake-up times are set.');
      return null;
    }

    const startOfDay = new Date(wakeUpTime.getTime());
    const endOfDay = new Date(sleepTime.getTime());

    // Merge all busy times including sleep, scheduled tasks, and currently selected goals
    const allBusyTimes = [
      ...busyTimes.map(bt => ({
        startTime: new Date(bt.startTime),
        endTime: new Date(bt.endTime),
      })),
      ...scheduledGoals.map(goal => ({
        startTime: new Date(goal.startTime),
        endTime: new Date(goal.endTime),
      })),
      ...selectedGoals.map(goal => ({
        startTime: new Date(goal.startTime),
        endTime: new Date(goal.endTime),
      })),
      {
        startTime: endOfDay,
        endTime: new Date(endOfDay.getTime() + 8 * 60 * 60 * 1000), // Assuming 8 hours of sleep
      },
    ];

    // Sort busy times by start time
    allBusyTimes.sort((a, b) => a.startTime - b.startTime);

    // Split the day into 15-minute time blocks
    const timeBlock = 15 * 60 * 1000; // 15 minutes in milliseconds
    let blockStart = startOfDay;

    while (blockStart < endOfDay) {
      const blockEnd = new Date(blockStart.getTime() + duration * 60000);

      // Check if this time block is free
      const isFree = allBusyTimes.every(bt => blockEnd <= bt.startTime || blockStart >= bt.endTime);

      if (isFree) {
        return { startTime: blockStart, endTime: blockEnd };
      }

      // Move to the next time block
      blockStart = new Date(blockStart.getTime() + timeBlock);
    }

    return null; // No available time slot found
  };

  const removeGoal = (goalId) => {
    setSelectedGoals(prevGoals => prevGoals.filter(goal => goal.id !== goalId));
  };

  const saveGoals = async () => {
    const existingGoals = await AsyncStorage.getItem(date);
    const updatedGoals = existingGoals ? JSON.parse(existingGoals) : [];

    const finalGoals = [...updatedGoals, ...selectedGoals];
    await AsyncStorage.setItem(date, JSON.stringify(finalGoals));

    navigation.goBack();
  };

  const renderGoalItem = ({ item }) => (
    <View style={styles.goalItem}>
      <Text style={styles.goalText}>{item.name}</Text>
      <Text style={styles.goalTime}>
        {item.startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
        {item.endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
      <TouchableOpacity onPress={() => removeGoal(item.id)}>
        <Ionicons name="remove-circle" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.label}>Enter Your Goal</Text>
        <TextInput
          style={styles.input}
          placeholder="Type your goal here"
          value={goalText}
          onChangeText={setGoalText}
        />
        <Text style={styles.label}>Duration (minutes)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter duration in minutes"
          keyboardType="numeric"
          value={duration}
          onChangeText={setDuration}
        />
        <TouchableOpacity style={styles.addButton} onPress={addGoal}>
          <Ionicons name="add-circle" size={40} color="#00BFFF" />
          <Text style={styles.addButtonText}>Add Goal</Text>
        </TouchableOpacity>

        <FlatList
          data={selectedGoals}
          renderItem={renderGoalItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={<Text style={styles.header}>Selected Goals</Text>}
        />

        <Button title="Submit Goals" onPress={saveGoals} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 60,
    backgroundColor: '#f5f5f5',
  },
  label: {
    fontSize: 18,
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderColor: '#00BFFF',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 60,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 60,
  },
  addButtonText: {
    fontSize: 20,
    marginLeft: 30,
    color: '#00BFFF',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 45,
    borderRadius: 10,
    marginBottom: 30,
    backgroundColor: '#00BFFF',
  },
  goalText: {
    fontSize: 18,
    color: '#fff',
  },
  goalTime: {
    fontSize: 16,
    color: '#fff',
  },
});

export default GoalSelectionScreen;
