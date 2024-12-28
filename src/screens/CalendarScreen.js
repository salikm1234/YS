import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Button, TouchableOpacity, Alert } from "react-native";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { rescheduleTasks } from "../utils/rescheduler";

const CalendarScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [tasks, setTasks] = useState([]);
  const constraints = {
    workInterval: 25, // Work interval in minutes
    breakInterval: 5, // Break interval in minutes
    busyTimes: [
      { start: "2023-11-19T12:00:00", end: "2023-11-19T13:00:00" }, // Example busy time
    ],
    sleepStart: 22, // Sleep start hour (10 PM)
    sleepEnd: 8, // Sleep end hour (8 AM)
  };

  useEffect(() => {
    if (selectedDate) {
      loadAndRescheduleTasks();
    }
  }, [selectedDate]);

  const loadAndRescheduleTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      const allTasks = storedTasks ? JSON.parse(storedTasks) : [];

      // Filter tasks for the selected day
      const dayTasks = allTasks.filter(
        (task) => task.createdAt.split("T")[0] === selectedDate
      );

      // Reschedule tasks
      const rescheduledTasks = rescheduleTasks(dayTasks, constraints);

      // Save rescheduled tasks back to AsyncStorage
      await AsyncStorage.setItem("tasks", JSON.stringify(rescheduledTasks));
      setTasks(rescheduledTasks.filter((task) => task.start.split("T")[0] === selectedDate));
    } catch (error) {
      Alert.alert("Error", "Failed to load and reschedule tasks.");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      const tasks = storedTasks ? JSON.parse(storedTasks) : [];
      const updatedTasks = tasks.filter((task) => task.id !== taskId);

      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
      loadAndRescheduleTasks(); // Refresh and reschedule tasks
      Alert.alert("Success", "Task deleted successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to delete the task.");
    }
  };

  return (
    <View style={styles.container}>
      <Calendar
        onDayPress={(day) => setSelectedDate(day.dateString)}
        markedDates={{
          [selectedDate]: { selected: true, marked: true, selectedColor: "blue" },
        }}
      />
      <Text style={styles.header}>Tasks for {selectedDate || "None"}</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.taskItem}>
            <Text style={styles.taskName}>{item.taskName}</Text>
            <Text>{item.start.split("T")[1].slice(0, 5)} - {item.end.split("T")[1].slice(0, 5)}</Text>
            <Button title="Delete" onPress={() => deleteTask(item.id)} color="red" />
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
    fontWeight: "bold",
    marginVertical: 10,
  },
  taskItem: {
    backgroundColor: "#f5f5f5",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
  },
  taskName: {
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CalendarScreen;
