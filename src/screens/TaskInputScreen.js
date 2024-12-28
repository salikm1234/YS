import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Alert, Button, Platform } from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TaskInputScreen = ({ navigation, route }) => {
  const { taskToEdit } = route.params || {};
  const [taskName, setTaskName] = useState(taskToEdit?.taskName || "");
  const [duration, setDuration] = useState(taskToEdit?.duration?.toString() || "");
  const [priority, setPriority] = useState(taskToEdit?.priority || "Medium"); // Default priority
  const [category, setCategory] = useState(taskToEdit?.category || "");

  const saveTask = async () => {
    if (!taskName || !duration || !priority || !category) {
      Alert.alert("Error", "All fields are required!");
      return;
    }

    const task = {
      id: taskToEdit?.id || Date.now().toString(),
      taskName,
      duration: parseInt(duration, 10),
      priority,
      category,
      createdAt: taskToEdit?.createdAt || new Date().toISOString(),
    };

    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      let tasks = storedTasks ? JSON.parse(storedTasks) : [];
      if (taskToEdit) {
        tasks = tasks.map((t) => (t.id === task.id ? task : t));
      } else {
        tasks.push(task);
      }
      await AsyncStorage.setItem("tasks", JSON.stringify(tasks));
      Alert.alert("Success", taskToEdit ? "Task updated successfully!" : "Task added successfully!");
      navigation.goBack();
    } catch (error) {
      Alert.alert("Error", "Failed to save the task.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{taskToEdit ? "Edit Task" : "Add Task"}</Text>
      <TextInput
        style={styles.input}
        placeholder="Task Name"
        value={taskName}
        onChangeText={setTaskName}
      />
      <TextInput
        style={styles.input}
        placeholder="Duration (minutes)"
        value={duration}
        onChangeText={setDuration}
        keyboardType="numeric"
      />
      <Text style={styles.label}>Priority:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={priority}
          onValueChange={(itemValue) => setPriority(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="High" value="High" />
          <Picker.Item label="Medium" value="Medium" />
          <Picker.Item label="Low" value="Low" />
        </Picker>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Category"
        value={category}
        onChangeText={setCategory}
      />
      <Button title={taskToEdit ? "Update Task" : "Save Task"} onPress={saveTask} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    marginBottom: 15,
    overflow: "hidden", // Ensures consistent styling
  },
  picker: {
    height: Platform.OS === "ios" ? 200 : 50,
    width: "100%",
  },
});

export default TaskInputScreen;
