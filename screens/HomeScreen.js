import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, DeviceEventEmitter, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFormattedDate } from '../utils/TimeUtils';
import GlobalStyles from '../styles/GlobalStyles';

export default function HomeScreen() {
  const [mode, setMode] = useState('Limbo'); // Modes: Work, Break, Busy, Limbo
  const [tasks, setTasks] = useState([]);
  const [breakBank, setBreakBank] = useState(0);
  const [remainingTime, setRemainingTime] = useState(null); // Countdown timer
  const [overtime, setOvertime] = useState(0); // Overtime timer
  const [timerInterval, setTimerInterval] = useState(null); // Interval for countdown/overtime
  const [conversionRate, setConversionRate] = useState(2); // Default conversion rate (work:break)

  const loadTasksAndSettings = async () => {
    const storedTasks = JSON.parse(await AsyncStorage.getItem('tasks')) || [];
    const storedConversionRate = parseInt(await AsyncStorage.getItem('conversionRate')) || 2;

    // Filter and sort tasks
    const sortedTasks = storedTasks
      .filter((task) => !task.completed)
      .sort((a, b) => {
        const dateDiff = new Date(a.date) - new Date(b.date);
        if (dateDiff !== 0) return dateDiff;
        return a.order - b.order; // Maintain shuffle order
      });

    setTasks(sortedTasks);
    setConversionRate(storedConversionRate);

    const breakTime = parseInt(await AsyncStorage.getItem('breakBank')) || 0;
    setBreakBank(breakTime);
  };

  useEffect(() => {
    loadTasksAndSettings();

    const taskListener = DeviceEventEmitter.addListener('taskAdded', loadTasksAndSettings);
    const taskUpdatedListener = DeviceEventEmitter.addListener('taskUpdated', loadTasksAndSettings);
    const taskDeletedListener = DeviceEventEmitter.addListener('taskDeleted', loadTasksAndSettings);

    return () => {
      taskListener.remove();
      taskUpdatedListener.remove();
      taskDeletedListener.remove();
      clearInterval(timerInterval);
    };
  }, []);

  const handleStartNextTask = () => {
    if (tasks.length === 0) {
      Alert.alert('No Tasks Scheduled', 'Please add a task to your schedule before starting.');
      return;
    }
    setMode('Work');
    startCountdown(); // Start the countdown
  };

  const startCountdown = () => {
    if (tasks.length === 0) return;

    const initialTime = tasks[0]?.remainingTime || tasks[0]?.duration * 60; // Default to full duration in seconds
    setRemainingTime(initialTime);
    setOvertime(0);

    if (timerInterval) clearInterval(timerInterval); // Clear any existing interval

    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev > 0) {
          return prev - 1; // Decrease remaining time by 1 second
        } else {
          setOvertime((prevOvertime) => prevOvertime + 1); // Start overtime
          return 0; // Ensure remaining time doesn't go negative
        }
      });
    }, 1000);

    setTimerInterval(interval); // Save the interval for later reference
  };

  const handlePauseTask = async () => {
    if (tasks.length === 0) return;

    clearInterval(timerInterval); // Stop the countdown
    const updatedTask = { ...tasks[0], remainingTime, overtime }; // Save remaining time and overtime
    const updatedTasks = [updatedTask, ...tasks.slice(1)];
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    DeviceEventEmitter.emit('taskUpdated'); // Notify other screens
    setMode('Limbo');
    Alert.alert('Task Paused', 'You can resume this task later.');
  };

  const handleFinishTask = async () => {
    if (tasks.length === 0) {
      Alert.alert('No Tasks', 'There are no tasks to finish.');
      return;
    }

    clearInterval(timerInterval); // Stop the countdown
    const updatedTasks = tasks.slice(1); // Remove the first task
    await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
    DeviceEventEmitter.emit('taskDeleted'); // Notify other screens
    setMode('Limbo');
    setRemainingTime(0); // Reset timers
    setOvertime(0);
    loadTasksAndSettings(); // Reload tasks and settings
    Alert.alert('Task Completed!', 'Great job!');
  };

  const handleStartBreak = (breakDuration) => {
    if (breakDuration > breakBank) {
      Alert.alert('Not Enough Break Time', 'You don’t have enough break time accrued.');
      return;
    }

    setBreakBank((prev) => prev - breakDuration);
    AsyncStorage.setItem('breakBank', JSON.stringify(breakBank - breakDuration));
    setMode('Break');
    setTimerInterval(null);
    setRemainingTime(null);
    setOvertime(0);
  };

  const renderContent = () => {
    const currentTask = tasks[0] || null;
    const nextTask = tasks[1] || null;

    switch (mode) {
      case 'Work':
        return (
          <View>
            <Text style={styles.heading}>Work Mode</Text>
            <Text>Current Task: {currentTask?.name || 'No task'}</Text>
            <Text>Category: {currentTask?.category || 'N/A'}</Text>
            <Text>Priority: {currentTask?.priority || 'N/A'}</Text>
            <Text>
              Time Left:{' '}
              {remainingTime > 0
                ? `${Math.floor(remainingTime / 60)}:${remainingTime % 60 < 10 ? '0' : ''}${remainingTime % 60}`
                : `Overtime: ${Math.floor(overtime / 60)}:${overtime % 60 < 10 ? '0' : ''}${overtime % 60}`}
            </Text>
            <Text>Next Task: {nextTask?.name || 'No task'}</Text>
            <Text style={styles.breakBankText}>Break Bank: {breakBank} minutes</Text>
            <TouchableOpacity style={GlobalStyles.button} onPress={handleFinishTask}>
              <Text style={GlobalStyles.buttonText}>Finish Task</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[GlobalStyles.button, { backgroundColor: 'gray' }]}
              onPress={handlePauseTask}
            >
              <Text style={GlobalStyles.buttonText}>Pause Task</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[GlobalStyles.button, { backgroundColor: 'blue' }]}
              onPress={() => handleStartBreak(5)} // Default 5-minute break
            >
              <Text style={GlobalStyles.buttonText}>Need a Break</Text>
            </TouchableOpacity>
          </View>
        );
      case 'Limbo':
        return (
          <View>
            <Text style={styles.heading}>Limbo Mode</Text>
            <Text>Next Task: {tasks[0]?.name || 'No task'}</Text>
            <TouchableOpacity
              style={[
                GlobalStyles.button,
                tasks.length === 0 && { backgroundColor: 'lightgray' }, // Disable button
              ]}
              disabled={tasks.length === 0}
              onPress={handleStartNextTask}
            >
              <Text style={GlobalStyles.buttonText}>Start Next Task</Text>
            </TouchableOpacity>
          </View>
        );
      default:
        return <Text>Unknown Mode</Text>;
    }
  };

  return <View style={GlobalStyles.container}>{renderContent()}</View>;
}

const styles = StyleSheet.create({
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  breakBankText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: 'green',
  },
});