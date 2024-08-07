import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Calendar } from 'react-native-calendars';
import Ionicons from 'react-native-vector-icons/Ionicons';

const TaskItem = ({ task, onDelete, onEdit }) => {
  return (
    <View style={styles.taskContainer}>
      <Text style={styles.taskText}>{task.name}</Text>
      <Text style={styles.timeText}>{task.startTime} - {task.endTime}</Text>
      <Button title="Edit" onPress={() => onEdit(task.id)} />
      <Button title="Delete" onPress={() => onDelete(task.id)} />
    </View>
  );
};

const SchedulesScreen = ({ navigation }) => {
  const [tasks, setTasks] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const storedTasks = await AsyncStorage.getItem('tasks');
        if (storedTasks) {
          setTasks(JSON.parse(storedTasks));
        }
      } catch (error) {
        console.error('Failed to load tasks.', error);
      }
    };
    loadTasks();
  }, []);

  const deleteTask = async (taskId) => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      let tasksArray = storedTasks ? JSON.parse(storedTasks) : [];
      tasksArray = tasksArray.filter(task => task.id !== taskId);
      await AsyncStorage.setItem('tasks', JSON.stringify(tasksArray));
      setTasks(tasksArray);
    } catch (error) {
      console.error('Failed to delete task.', error);
    }
  };

  const shuffleTasks = () => {
    const shuffledTasks = [...tasks].sort(() => Math.random() - 0.5);
    setTasks(shuffledTasks);
  };

  const editTask = (taskId) => {
    navigation.navigate('Edit', { taskId });
  };

  const filteredTasks = tasks.filter(task => task.date === selectedDate);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <Ionicons name="chevron-back-outline" size={24} color="red" onPress={() => navigation.navigate('Entry')} />
          <Text style={styles.header}>{new Date().toLocaleString('default', { month: 'long' })} {new Date().getFullYear()}</Text>
          <Ionicons name="calendar-outline" size={24} color="red" />
        </View>
        <Calendar
          current={selectedDate}
          onDayPress={day => setSelectedDate(day.dateString)}
          markedDates={{ [selectedDate]: { selected: true } }}
          theme={{
            calendarBackground: '#1c1c1c',
            textSectionTitleColor: 'white',
            dayTextColor: 'white',
            selectedDayBackgroundColor: 'red',
            selectedDayTextColor: 'white',
            monthTextColor: 'white',
            indicatorColor: 'white',
          }}
        />
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TaskItem task={item} onDelete={deleteTask} onEdit={editTask} />
          )}
        />
        <Button title="Shuffle Tasks" onPress={shuffleTasks} />
        <Button title="Add Task" onPress={() => navigation.navigate('Add')} />
        <Button title="Go to Manual Input" onPress={() => navigation.navigate('Manual')} />
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    color: 'red',
  },
  taskContainer: {
    padding: 10,
    marginVertical: 5,
    backgroundColor: '#1c1c1c',
    borderRadius: 5,
  },
  taskText: {
    color: 'white',
    marginBottom: 5,
  },
  timeText: {
    color: 'white',
    marginBottom: 5,
  },
  button: {
    marginTop: 5,
  },
});

export default SchedulesScreen;
