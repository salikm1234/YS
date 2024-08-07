import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { TextInput } from 'react-native-paper';

import AsyncStorage from '@react-native-async-storage/async-storage';
import Stopwatch from './Stopwatch';
import Ionicons from 'react-native-vector-icons/Ionicons';

const EntryScreen = ({ navigation }) => {
  const [currentTask, setCurrentTask] = useState('');
  const [breakReason, setBreakReason] = useState('');
  const [nextTask, setNextTask] = useState('');
  const [isLockedIn, setIsLockedIn] = useState(false);

  useEffect(() => {
    const loadCurrentTask = async () => {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        const tasks = JSON.parse(storedTasks);
        if (tasks.length > 0) {
          setCurrentTask(tasks[0].name);
          setNextTask(tasks.length > 1 ? tasks[1].name : 'No more tasks for today');
        } else {
          setCurrentTask('No tasks scheduled');
          setNextTask('No more tasks for today');
        }
      }
    };
    loadCurrentTask();
  }, []);

  const startLockIn = async () => {
    setIsLockedIn(true);
    await AsyncStorage.setItem('isLockedIn', 'true');
  };

  const endTaskEarly = async () => {
    setCurrentTask('');
    setIsLockedIn(false);
    await AsyncStorage.setItem('isLockedIn', 'false');
  };

  const addBreak = () => {
    // Implement add break logic here
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>Current Task: {currentTask}</Text>
        <Button title="Start Early" onPress={startLockIn} />
        <Button title="Done Early" onPress={endTaskEarly} />
        <Button title="Need a Break" onPress={addBreak} />
        <TextInput
          label="Reason for Break"
          value={breakReason}
          onChangeText={text => setBreakReason(text)}
          style={styles.input}
        />
        <Button title="Set Break Time" onPress={() => {}} />
        {isLockedIn && <Stopwatch />}
        <Text>Next Task: {nextTask}</Text>
        <Button title="Go to Schedules" onPress={() => navigation.navigate('Schedules')} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingVertical: 30,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    marginBottom: 20,
  },
});

export default EntryScreen;
