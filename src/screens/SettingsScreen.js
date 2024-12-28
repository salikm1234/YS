import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, FlatList } from 'react-native';
import { Calendar } from 'react-native-calendars';

const CalendarScreen = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Mock tasks for demonstration
    setTasks([
      { id: '1', taskName: 'Math Homework', time: '10:00 AM - 11:00 AM' },
      { id: '2', taskName: 'Break', time: '11:00 AM - 11:15 AM' },
    ]);
  }, [selectedDate]);

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, marked: true, selectedColor: 'blue' },
        }}
      />
      <Text style={styles.header}>Tasks for {selectedDate || 'None'}</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskName}>{item.taskName}</Text>
            <Text>{item.time}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  taskItem: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  taskName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CalendarScreen;
