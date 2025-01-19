import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  Alert,
  StyleSheet,
  DeviceEventEmitter,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFormattedDate } from '../utils/TimeUtils';
import GlobalStyles from '../styles/GlobalStyles';

export default function SettingsScreen() {
  const [busyTimes, setBusyTimes] = useState([]);
  const [newBusyTime, setNewBusyTime] = useState({
    date: getFormattedDate(new Date()),
    startTime: new Date(),
    endTime: new Date(),
    type: 'Soft',
    recurrence: 'None',
  });
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [conversionRate, setConversionRate] = useState('5');

  useEffect(() => {
    const loadSettings = async () => {
      const storedBusyTimes = JSON.parse(await AsyncStorage.getItem('busyTimes')) || [];
      const storedCategories = JSON.parse(await AsyncStorage.getItem('categories')) || ['General'];
      const storedConversionRate = (await AsyncStorage.getItem('conversionRate')) || '5';

      setBusyTimes(storedBusyTimes);
      setCategories(storedCategories);
      setConversionRate(storedConversionRate);
    };

    loadSettings();
  }, []);

  const saveBusyTime = async () => {
    if (!newBusyTime.date || !newBusyTime.startTime || !newBusyTime.endTime) {
      Alert.alert('Error', 'Please fill in all required fields for busy time.');
      return;
    }

    const updatedBusyTime = {
      ...newBusyTime,
      date: newBusyTime.date,
    };

    const updatedBusyTimes = [...busyTimes, updatedBusyTime];
    setBusyTimes(updatedBusyTimes);
    await AsyncStorage.setItem('busyTimes', JSON.stringify(updatedBusyTimes));

    // Emit event to notify Calendar Screen
    DeviceEventEmitter.emit('busyTimeUpdated', updatedBusyTime.date);

    Alert.alert('Success', 'Busy time added!');
  };

  const deleteBusyTime = async (index) => {
    const updatedBusyTimes = busyTimes.filter((_, i) => i !== index);
    setBusyTimes(updatedBusyTimes);
    await AsyncStorage.setItem('busyTimes', JSON.stringify(updatedBusyTimes));

    // Emit event to notify Calendar Screen
    if (updatedBusyTimes.length > 0) {
      DeviceEventEmitter.emit('busyTimeUpdated', updatedBusyTimes[0].date);
    } else {
      DeviceEventEmitter.emit('busyTimeUpdated', getFormattedDate(new Date()));
    }
  };

  const addCategory = async () => {
    if (!newCategory.trim()) {
      Alert.alert('Error', 'Category name cannot be empty.');
      return;
    }

    const updatedCategories = [...categories, newCategory.trim()];
    setCategories(updatedCategories);
    await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));
    setNewCategory('');
    Alert.alert('Success', 'Category added!');
  };

  const deleteCategory = async (index) => {
    const updatedCategories = categories.filter((_, i) => i !== index);
    setCategories(updatedCategories);
    await AsyncStorage.setItem('categories', JSON.stringify(updatedCategories));
  };

  const updateConversionRate = async (rate) => {
    setConversionRate(rate);
    await AsyncStorage.setItem('conversionRate', rate);
  };

  return (
    <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
      <View style={GlobalStyles.container}>
        <Text style={GlobalStyles.heading}>Settings</Text>

        {/* Busy Times */}
        <Text style={styles.sectionHeading}>Busy Times</Text>
        <FlatList
          data={busyTimes}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.listItem}>
              <Text>
                {item.type} Busy Time: {item.date}, {new Date(item.startTime).toLocaleTimeString()} -{' '}
                {new Date(item.endTime).toLocaleTimeString()} ({item.recurrence})
              </Text>
              <TouchableOpacity onPress={() => deleteBusyTime(index)}>
                <Text style={styles.deleteButton}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />

        <Text>Date</Text>
        <DateTimePicker
          value={new Date(newBusyTime.date)}
          mode="date"
          display="spinner"
          onChange={(event, date) =>
            setNewBusyTime({ ...newBusyTime, date: getFormattedDate(date || new Date()) })
          }
        />

        <Text>Start Time</Text>
        <DateTimePicker
          value={newBusyTime.startTime}
          mode="time"
          display="spinner"
          onChange={(event, date) =>
            setNewBusyTime({ ...newBusyTime, startTime: date || new Date() })
          }
        />

        <Text>End Time</Text>
        <DateTimePicker
          value={newBusyTime.endTime}
          mode="time"
          display="spinner"
          onChange={(event, date) =>
            setNewBusyTime({ ...newBusyTime, endTime: date || new Date() })
          }
        />

        <Text>Type</Text>
        <Picker
          selectedValue={newBusyTime.type}
          onValueChange={(itemValue) => setNewBusyTime({ ...newBusyTime, type: itemValue })}
          style={GlobalStyles.input}
        >
          <Picker.Item label="Soft" value="Soft" />
          <Picker.Item label="Hard" value="Hard" />
        </Picker>

        <Text>Recurrence</Text>
        <Picker
          selectedValue={newBusyTime.recurrence}
          onValueChange={(itemValue) => setNewBusyTime({ ...newBusyTime, recurrence: itemValue })}
          style={GlobalStyles.input}
        >
          <Picker.Item label="None" value="None" />
          <Picker.Item label="Daily" value="Daily" />
          <Picker.Item label="Weekly" value="Weekly" />
          <Picker.Item label="Biweekly" value="Biweekly" />
          <Picker.Item label="Monthly" value="Monthly" />
        </Picker>

        <TouchableOpacity style={GlobalStyles.button} onPress={saveBusyTime}>
          <Text style={GlobalStyles.buttonText}>Add Busy Time</Text>
        </TouchableOpacity>

        {/* Categories */}
        <Text style={styles.sectionHeading}>Categories</Text>
        <FlatList
          data={categories}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item, index }) => (
            <View style={styles.listItem}>
              <Text>{item}</Text>
              <TouchableOpacity onPress={() => deleteCategory(index)}>
                <Text style={styles.deleteButton}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
        />
        <TextInput
          style={GlobalStyles.input}
          placeholder="Add a new category"
          value={newCategory}
          onChangeText={setNewCategory}
        />
        <TouchableOpacity style={GlobalStyles.button} onPress={addCategory}>
          <Text style={GlobalStyles.buttonText}>Add Category</Text>
        </TouchableOpacity>

        {/* Conversion Rate */}
        <Text style={styles.sectionHeading}>Conversion Rate</Text>
        <TextInput
          style={GlobalStyles.input}
          keyboardType="numeric"
          value={conversionRate}
          onChangeText={updateConversionRate}
        />
      </View>
    </ScrollView>
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