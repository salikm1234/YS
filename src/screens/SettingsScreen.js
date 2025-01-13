import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, StyleSheet, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SettingsScreen = () => {
  const [workInterval, setWorkInterval] = useState("");
  const [breakInterval, setBreakInterval] = useState("");
  const [sleepStart, setSleepStart] = useState("");
  const [sleepEnd, setSleepEnd] = useState("");

  useEffect(() => {
    // Load settings on mount
    const loadSettings = async () => {
      try {
        const storedWorkInterval = await AsyncStorage.getItem("workInterval");
        const storedBreakInterval = await AsyncStorage.getItem("breakInterval");
        const storedSleepStart = await AsyncStorage.getItem("sleepStart");
        const storedSleepEnd = await AsyncStorage.getItem("sleepEnd");

        if (storedWorkInterval) setWorkInterval(storedWorkInterval);
        if (storedBreakInterval) setBreakInterval(storedBreakInterval);
        if (storedSleepStart) setSleepStart(storedSleepStart);
        if (storedSleepEnd) setSleepEnd(storedSleepEnd);
      } catch (error) {
        Alert.alert("Error", "Failed to load settings.");
      }
    };

    loadSettings();
  }, []);

  const saveSettings = async () => {
    try {
      if (!workInterval || !breakInterval || !sleepStart || !sleepEnd) {
        Alert.alert("Error", "All fields are required.");
        return;
      }

      await AsyncStorage.setItem("workInterval", workInterval);
      await AsyncStorage.setItem("breakInterval", breakInterval);
      await AsyncStorage.setItem("sleepStart", sleepStart);
      await AsyncStorage.setItem("sleepEnd", sleepEnd);

      Alert.alert("Success", "Settings saved!");
    } catch (error) {
      Alert.alert("Error", "Failed to save settings.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Settings</Text>

      <Text>Work Interval (minutes):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={workInterval}
        onChangeText={setWorkInterval}
        placeholder="Enter work interval"
      />

      <Text>Break Interval (minutes):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={breakInterval}
        onChangeText={setBreakInterval}
        placeholder="Enter break interval"
      />

      <Text>Sleep Start (24-hour format):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={sleepStart}
        onChangeText={setSleepStart}
        placeholder="Enter sleep start (e.g., 22 for 10 PM)"
      />

      <Text>Wake Up (24-hour format):</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={sleepEnd}
        onChangeText={setSleepEnd}
        placeholder="Enter wake up time (e.g., 6 for 6 AM)"
      />

      <Button title="Save Settings" onPress={saveSettings} />
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
});

export default SettingsScreen;
