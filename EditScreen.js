import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar } from 'react-native-calendars';

const EditScreen = ({ route, navigation }) => {
  const { taskId } = route.params;
  const [taskName, setTaskName] = useState('');
  const [timeEstimate, setTimeEstimate] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);

  useEffect(() => {
    const loadTask = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        const tasks = storedTasks ? JSON.parse(storedTasks) : [];
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          setTaskName(task.name);
          setTimeEstimate(task.timeEstimate);
          setPriority(task.priority);
          setCategory(task.category);
          setDate(task.date);
          setStartTime(new Date(`${task.date}T${task.startTime}`));
        }
      } catch (error) {
        console.error('Failed to load task.', error);
      }
    };
    loadTask();
  }, [taskId]);

  const calculateEndTime = (startTime, duration) => {
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + parseInt(duration));
    return endTime;
  };

  const saveTask = async () => {
    try {
      const endTime = calculateEndTime(startTime, timeEstimate);
      const storedTasks = await AsyncStorage.getItem('tasks');
      let tasks = storedTasks ? JSON.parse(storedTasks) : [];
      const taskIndex = tasks.findIndex(t => t.id === taskId);
      if (taskIndex > -1) {
        tasks[taskIndex] = {
          id: taskId,
          name: taskName,
          timeEstimate,
          priority,
          category,
          date,
          startTime: startTime.toTimeString().split(' ')[0],
          endTime: endTime.toTimeString().split(' ')[0],
        };
        await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
        navigation.navigate('Schedules');
      }
    } catch (error) {
      console.error('Failed to save task.', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>Edit Task</Text>
        <TextInput
          label="Task Name"
          value={taskName}
          onChangeText={text => setTaskName(text)}
          style={styles.input}
        />
        <TextInput
          label="Time Estimate (minutes)"
          value={timeEstimate}
          onChangeText={text => setTimeEstimate(text)}
          style={styles.input}
          keyboardType="numeric"
        />
        <TextInput
          label="Priority"
          value={priority}
          onChangeText={text => setPriority(text)}
          style={styles.input}
        />
        <TextInput
          label="Category"
          value={category}
          onChangeText={text => setCategory(text)}
          style={styles.input}
        />
        <Calendar
          onDayPress={day => setDate(day.dateString)}
          markedDates={{ [date]: { selected: true } }}
        />
        <Text style={styles.label}>Start Time:</Text>
        <Button title={startTime.toTimeString().split(' ')[0]} onPress={() => setShowStartTimePicker(true)} />
        {showStartTimePicker && (
          <DateTimePicker
            value={startTime}
            mode="time"
            display="default"
            onChange={(event, selectedDate) => {
              setShowStartTimePicker(false);
              const currentDate = selectedDate || startTime;
              setStartTime(currentDate);
            }}
          />
        )}
        <Button title="Save Task" onPress={saveTask} />
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
  label: {
    fontSize: 18,
    marginVertical: 10,
  },
});

export default EditScreen;
