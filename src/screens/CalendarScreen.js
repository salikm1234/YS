import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Button, Alert } from "react-native";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { rescheduleTasks } from "../utils/rescheduler";

const CalendarScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState("");
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (selectedDate) {
      loadAndRescheduleTasks();
    }
  }, [selectedDate]);

  const loadAndRescheduleTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      const allTasks = storedTasks ? JSON.parse(storedTasks) : [];
      console.log("All tasks from storage:", allTasks);

      const validTasks = allTasks.filter((task) => {
        const isValidStart = task.start && !isNaN(Date.parse(task.start));
        const isValidEnd = task.end && !isNaN(Date.parse(task.end));
        if (!isValidStart || !isValidEnd) {
          console.warn(`Invalid task filtered out: ${JSON.stringify(task)}`);
        }
        return isValidStart && isValidEnd;
      });

      console.log("Valid tasks:", validTasks);

      const constraints = {
        busyTimes: [{ start: "2023-12-25T12:00:00", end: "2023-12-25T13:00:00" }],
        sleepStart: 22,
        sleepEnd: 6,
        workInterval: 25,
        breakInterval: 5,
      };

      const rescheduledTasks = await rescheduleTasks(validTasks, constraints);
      console.log("Rescheduled tasks:", rescheduledTasks);

      await AsyncStorage.setItem("tasks", JSON.stringify(rescheduledTasks));
      setTasks(rescheduledTasks.filter((task) => task.start.split("T")[0] === selectedDate));
    } catch (error) {
      console.error("Error in loadAndRescheduleTasks:", error.message, error.stack);
      Alert.alert("Error", "Failed to load and reschedule tasks.");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      const tasks = storedTasks ? JSON.parse(storedTasks) : [];
      const updatedTasks = tasks.filter((task) => task.id !== taskId);

      await AsyncStorage.setItem("tasks", JSON.stringify(updatedTasks));
      loadAndRescheduleTasks();
      Alert.alert("Success", "Task deleted successfully!");
    } catch (error) {
      console.error("Error deleting task:", error.message);
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
            <Text>
              {item.start.split("T")[1].slice(0, 5)} - {item.end.split("T")[1].slice(0, 5)}
            </Text>
            <Button title="Delete" onPress={() => deleteTask(item.id)} color="red" />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 18, fontWeight: "bold", marginVertical: 10 },
  taskItem: { backgroundColor: "#f5f5f5", padding: 10, marginVertical: 5, borderRadius: 8 },
  taskName: { fontSize: 16, fontWeight: "bold" },
});

export default CalendarScreen;
