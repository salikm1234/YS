import React, { useState } from 'react';
import { View, Text, Button, StyleSheet, ScrollView } from 'react-native';
import { TextInput } from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import DateTimePicker from '@react-native-community/datetimepicker';

const ManualScreen = ({ navigation }) => {
  const [taskName, setTaskName] = useState('');
  const [timeEstimate, setTimeEstimate] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const addManualTask = async () => {
    try {
      const newTask = {
        id: Date.now(),
        name: taskName,
        timeEstimate,
        priority,
        category,
        date,
        startTime: startTime.toTimeString().split(' ')[0],
        endTime: endTime.toTimeString().split(' ')[0],
      };
      let tasks = await AsyncStorage.getItem('tasks');
      tasks = tasks ? JSON.parse(tasks) : [];
      tasks.push(newTask);
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      setTaskName('');
      setTimeEstimate('');
      setPriority('');
      setCategory('');
      setDate(new Date().toISOString().split('T')[0]);
      setStartTime(new Date());
      setEndTime(new Date());
      navigation.navigate('Schedules');
    } catch (error) {
      console.error('Failed to add manual task.', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <Text style={styles.header}>Manual Input</Text>
        <TextInput
          label="Task Name"
          value={taskName}
          onChangeText={text => setTaskName(text)}
          style={styles.input}
        />
        <TextInput
          label="Time Estimate"
          value={timeEstimate}
          onChangeText={text => setTimeEstimate(text)}
          style={styles.input}
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
        <Text style={styles.label}>End Time:</Text>
        <Button title={endTime.toTimeString().split(' ')[0]} onPress={() => setShowEndTimePicker(true)} />
        {showEndTimePicker && (
          <DateTimePicker
            value={endTime}
            mode="time"
            display="default"
            onChange={(event, selectedDate) => {
              setShowEndTimePicker(false);
              const currentDate = selectedDate || endTime;
              setEndTime(currentDate);
            }}
          />
        )}
        <Button title="Add Task" onPress={addManualTask} />
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

export default ManualScreen;
