import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Button, TextInput, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';

const daysOfWeek = ['S', 'M', 'Tu', 'W', 'T', 'F', 'Sa'];

const SettingsScreen = () => {
  const [selectedDay, setSelectedDay] = useState('Sun');
  const [sleepTime, setSleepTime] = useState(null);
  const [wakeUpTime, setWakeUpTime] = useState(null);
  const [busyTimes, setBusyTimes] = useState([]);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [currentEditingField, setCurrentEditingField] = useState(null);
  const [timePickerValue, setTimePickerValue] = useState(new Date());
  const [newBusyStartTime, setNewBusyStartTime] = useState(null);  // Initialize newBusyStartTime
  const [newBusyEndTime, setNewBusyEndTime] = useState(null);      // Initialize newBusyEndTime
  const [sleepDuration, setSleepDuration] = useState('');

  useEffect(() => {
    loadSchedule();
  }, [selectedDay]);

  useEffect(() => {
    calculateSleepDuration();
  }, [sleepTime, wakeUpTime]);

  const loadSchedule = async () => {
    const schedule = await AsyncStorage.getItem(selectedDay);
    const parsedSchedule = schedule ? JSON.parse(schedule) : { sleepTime: null, wakeUpTime: null, busyTimes: [] };
    setSleepTime(parsedSchedule.sleepTime ? new Date(parsedSchedule.sleepTime) : null);
    setWakeUpTime(parsedSchedule.wakeUpTime ? new Date(parsedSchedule.wakeUpTime) : null);
    setBusyTimes(parsedSchedule.busyTimes || []);
  };

  const saveSchedule = async (newSchedule) => {
    await AsyncStorage.setItem(selectedDay, JSON.stringify(newSchedule));
  };

  const calculateSleepDuration = () => {
    if (sleepTime && wakeUpTime) {
      let diff = wakeUpTime - sleepTime;
      if (diff < 0) {
        diff += 24 * 60 * 60 * 1000; // Handle times that span midnight
      }
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      setSleepDuration(`${hours} hours and ${minutes} minutes`);
    } else {
      setSleepDuration('Set both times to calculate');
    }
  };

  const handleTimeChange = (event, selectedDate) => {
    if (selectedDate) {
      setTimePickerValue(selectedDate);
    }
  };

  const openTimePicker = (field) => {
    setCurrentEditingField(field);
    if (field === 'sleep' && sleepTime) {
      setTimePickerValue(sleepTime);
    } else if (field === 'wakeUp' && wakeUpTime) {
      setTimePickerValue(wakeUpTime);
    } else if (field === 'busyStart' && newBusyStartTime) {
      setTimePickerValue(newBusyStartTime);
    } else if (field === 'busyEnd' && newBusyEndTime) {
      setTimePickerValue(newBusyEndTime);
    } else {
      setTimePickerValue(new Date());
    }
    setShowTimePicker(true);
  };

  const finalizeTimeSelection = () => {
    setShowTimePicker(false);

    if (currentEditingField === 'sleep') {
      setSleepTime(timePickerValue);
      saveSchedule({ sleepTime: timePickerValue, wakeUpTime, busyTimes });
    } else if (currentEditingField === 'wakeUp') {
      setWakeUpTime(timePickerValue);
      saveSchedule({ sleepTime, wakeUpTime: timePickerValue, busyTimes });
    } else if (currentEditingField === 'busyStart') {
      setNewBusyStartTime(timePickerValue);
    } else if (currentEditingField === 'busyEnd') {
      setNewBusyEndTime(timePickerValue);
    }

    setCurrentEditingField(null);
  };

  const handleAddBusyTime = () => {
    if (newBusyStartTime && newBusyEndTime) {
      const newBusyTime = `${newBusyStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${newBusyEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      const updatedBusyTimes = [...busyTimes, newBusyTime];
      setBusyTimes(updatedBusyTimes);
      setNewBusyStartTime(null);
      setNewBusyEndTime(null);
      saveSchedule({ sleepTime, wakeUpTime, busyTimes: updatedBusyTimes });
    } else {
      alert('Please select both start and end times for the busy time.');
    }
  };

  const handleRemoveBusyTime = (time) => {
    const updatedBusyTimes = busyTimes.filter(t => t !== time);
    setBusyTimes(updatedBusyTimes);
    saveSchedule({ sleepTime, wakeUpTime, busyTimes: updatedBusyTimes });
  };

  const renderBusyTimeItem = ({ item }) => (
    <View style={styles.busyTimeItem}>
      <Text style={styles.busyTimeText}>{item}</Text>
      <TouchableOpacity onPress={() => handleRemoveBusyTime(item)}>
        <Text style={styles.removeButton}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.daySelector}>
          {daysOfWeek.map((day) => (
            <TouchableOpacity
              key={day}
              style={[styles.dayButton, selectedDay === day && styles.selectedDayButton]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={styles.dayButtonText}>{day}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.timePickerContainer}>
          <Text style={styles.label}>Sleep Time:</Text>
          <TouchableOpacity onPress={() => openTimePicker('sleep')}>
            <Text style={styles.timeText}>{sleepTime ? sleepTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Set Sleep Time'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.timePickerContainer}>
          <Text style={styles.label}>Wake Up Time:</Text>
          <TouchableOpacity onPress={() => openTimePicker('wakeUp')}>
            <Text style={styles.timeText}>{wakeUpTime ? wakeUpTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Set Wake Up Time'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sleepDurationText}>Sleep Duration: {sleepDuration}</Text>

        <View style={styles.busyTimesContainer}>
          <Text style={styles.label}>Busy Times:</Text>
          <View style={styles.timePickerContainer}>
            <Text style={styles.label}>Start Time:</Text>
            <TouchableOpacity onPress={() => openTimePicker('busyStart')}>
              <Text style={styles.timeText}>{newBusyStartTime ? newBusyStartTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Set Start Time'}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.timePickerContainer}>
            <Text style={styles.label}>End Time:</Text>
            <TouchableOpacity onPress={() => openTimePicker('busyEnd')}>
              <Text style={styles.timeText}>{newBusyEndTime ? newBusyEndTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Set End Time'}</Text>
            </TouchableOpacity>
          </View>
          <Button title="Add Busy Time" onPress={handleAddBusyTime} />

          {busyTimes.length > 0 ? (
            <FlatList
              data={busyTimes}
              renderItem={renderBusyTimeItem}
              keyExtractor={(item) => item}
            />
          ) : (
            <Text style={styles.noTimesText}>No busy times scheduled for {selectedDay}.</Text>
          )}
        </View>

        {showTimePicker && (
          <>
            <DateTimePicker
              value={timePickerValue}
              mode="time"
              is24Hour={false}
              display="spinner"
              onChange={handleTimeChange}
            />
            <TouchableOpacity style={styles.doneButton} onPress={finalizeTimeSelection}>
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  daySelector: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  dayButton: {
    width: 35, // Set the width
    height: 35, // Set the height equal to the width
    borderRadius: 15, // Half of the width/height to make it a circle
    justifyContent: 'center', // Center the text horizontally
    alignItems: 'center', // Center the text vertically
    backgroundColor: '#00BFFF', // Background color of the button
    margin: 5, // Add some margin around each button
  },
  selectedDayButton: {
    backgroundColor: '#DDEFFF', // Change background color when selected
  },
  dayButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333', // Text color
  },
  timePickerContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  timeText: {
    fontSize: 18,
    color: '#333',
  },
  sleepDurationText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
  },
  busyTimesContainer: {
    flex: 1,
    marginTop: 20,
  },
  busyTimeItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    marginBottom: 10,
    backgroundColor: '#00BFFF',
    borderRadius: 5,
  },
  busyTimeText: {
    color: '#fff',
  },
  removeButton: {
    color: '#ff6347',
  },
  noTimesText: {
    textAlign: 'center',
    color: '#999',
    marginTop: 20,
  },
  doneButton: {
    backgroundColor: '#00BFFF',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default SettingsScreen;
