import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFormattedDate } from '../utils/TimeUtils';
import GlobalStyles from '../styles/GlobalStyles';

export default function ManualTaskAddingScreen() {
  const [taskName, setTaskName] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [duration, setDuration] = useState('');
  const [priority, setPriority] = useState('Low');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const loadCategories = async () => {
      const storedCategories = JSON.parse(await AsyncStorage.getItem('categories')) || ['General'];
      setCategories(storedCategories);
      setCategory(storedCategories[0]);
    };
    loadCategories();
  }, []);

  const handleSubmit = async () => {
    if (!taskName || !duration) {
      Alert.alert('Error', 'Please fill in all required fields.');
      return;
    }

    const newTask = {
      id: `${taskName}-${Date.now()}`,
      name: taskName,
      date: getFormattedDate(selectedDate),
      timestamp: Date.now(),
      duration: parseInt(duration),
      priority,
      category,
    };

    try {
      const existingTasks = JSON.parse(await AsyncStorage.getItem('tasks')) || [];
      const updatedTasks = [...existingTasks, newTask];
      await AsyncStorage.setItem('tasks', JSON.stringify(updatedTasks));
      Alert.alert('Success', 'Task added successfully!');

      // Broadcast event to refresh tasks
      DeviceEventEmitter.emit('taskAdded', newTask.date);

      // Clear all fields
      setTaskName('');
      setSelectedDate(new Date());
      setDuration('');
      setPriority('Low');
      setCategory(categories[0]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save the task. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          paddingVertical: 20,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={GlobalStyles.container}>
          <Text style={GlobalStyles.heading}>Add a New Task</Text>

          <Text>Task Name</Text>
          <TextInput
            style={GlobalStyles.input}
            placeholder="Enter task name"
            value={taskName}
            onChangeText={setTaskName}
          />

          <Text>Date</Text>
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="spinner"
            onChange={(event, date) => setSelectedDate(date || selectedDate)}
          />

          <Text>Duration (in minutes)</Text>
          <TextInput
            style={GlobalStyles.input}
            placeholder="Enter duration"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />

          <Text>Priority</Text>
          <Picker
            selectedValue={priority}
            onValueChange={(itemValue) => setPriority(itemValue)}
            style={GlobalStyles.input}
          >
            <Picker.Item label="Low" value="Low" />
            <Picker.Item label="Medium" value="Medium" />
            <Picker.Item label="High" value="High" />
          </Picker>

          <Text>Category</Text>
          <Picker
            selectedValue={category}
            onValueChange={(itemValue) => setCategory(itemValue)}
            style={GlobalStyles.input}
          >
            {categories.map((cat, index) => (
              <Picker.Item key={index} label={cat} value={cat} />
            ))}
          </Picker>

          <TouchableOpacity style={GlobalStyles.button} onPress={handleSubmit}>
            <Text style={GlobalStyles.buttonText}>Submit</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}