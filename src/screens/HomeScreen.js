import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MODES = {
  WORK: "Work Session",
  BREAK: "Break",
  BUSY: "Busy Time",
  LIMBO: "Pause/Limbo",
  LOCKED_IN: "Locked In",
};

const HomeScreen = () => {
  const [mode, setMode] = useState(MODES.LIMBO);
  const [currentTask, setCurrentTask] = useState(null);
  const [nextTask, setNextTask] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0); // Timer in seconds
  const [isLockedIn, setIsLockedIn] = useState(false);
  const [tasks, setTasks] = useState([]); // Store all tasks
  const [intervalId, setIntervalId] = useState(null); // Timer interval reference

  useEffect(() => {
    loadTasks(); // Load tasks from AsyncStorage when screen mounts
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const id = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
      setIntervalId(id);
      return () => clearTimeout(id);
    } else if (timeLeft === 0 && mode !== MODES.LIMBO) {
      handleModeTransition();
    }
  }, [timeLeft]);

  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem("tasks");
      const loadedTasks = storedTasks ? JSON.parse(storedTasks) : [];
      setTasks(loadedTasks);
      setCurrentTask(loadedTasks[0] || null);
      setNextTask(loadedTasks[1] || null);
    } catch (error) {
      console.error("Error loading tasks:", error);
      Alert.alert("Error", "Failed to load tasks.");
    }
  };

  const startTimer = (duration) => {
    setTimeLeft(duration * 60); // Convert minutes to seconds
  };

  const handleStart = () => {
    if (mode === MODES.LIMBO && currentTask) {
      setMode(MODES.WORK);
      startTimer(currentTask.duration);
    } else {
      Alert.alert("No task to start!");
    }
  };

  const handleFinish = () => {
    clearInterval(intervalId);

    // Remove finished task and move to next one
    const remainingTasks = tasks.slice(1); // Remove the first task (currentTask)
    setTasks(remainingTasks);

    if (remainingTasks.length > 0) {
      setCurrentTask(remainingTasks[0]); // Set the next task as current
      setNextTask(remainingTasks[1] || null); // Set the task after that as next
      setMode(MODES.LIMBO);
      Alert.alert("Task Complete", "Moving to the next task.");
    } else {
      setCurrentTask(null);
      setNextTask(null);
      setMode(MODES.LIMBO);
      Alert.alert("All Tasks Complete", "You have no more tasks.");
    }

    setTimeLeft(0);
  };

  const handleNeedBreak = () => {
    clearInterval(intervalId);
    if (mode === MODES.WORK) {
      setMode(MODES.BREAK);
      startTimer(5); // 5-minute break
    }
  };

  const handleLockIn = () => {
    setIsLockedIn(true);
    setMode(MODES.LOCKED_IN);
    setTimeLeft(0);
  };

  const handleUnlock = () => {
    setIsLockedIn(false);
    setMode(MODES.LIMBO);
  };

  const handleModeTransition = () => {
    if (mode === MODES.WORK) {
      setMode(MODES.BREAK);
      startTimer(5); // Transition to 5-minute break
    } else if (mode === MODES.BREAK) {
      setMode(MODES.LIMBO);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  return (
    <View style={isLockedIn ? styles.lockedInContainer : styles.container}>
      {isLockedIn ? (
        <>
          <Text style={styles.lockedInHeader}>Locked-In Mode</Text>
          <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
          <Button title="Unlock" onPress={handleUnlock} color="#ff4d4d" />
        </>
      ) : (
        <>
          <Text style={styles.header}>Current Mode: {mode}</Text>
          <View style={styles.taskContainer}>
            <Text style={styles.label}>Current Task:</Text>
            <Text style={styles.taskText}>
              {currentTask ? currentTask.taskName : "No current task"}
            </Text>
            <Text style={styles.timer}>Time Left: {formatTime(timeLeft)}</Text>
          </View>
          <View style={styles.taskContainer}>
            <Text style={styles.label}>Next Task:</Text>
            <Text>{nextTask ? nextTask.taskName : "None"}</Text>
          </View>
          <View style={styles.buttonsContainer}>
            {mode === MODES.LIMBO && <Button title="Start Task" onPress={handleStart} />}
            {mode === MODES.WORK && (
              <>
                <Button title="Finish Task" onPress={handleFinish} />
                <Button title="Need a Break" onPress={handleNeedBreak} />
                <Button title="Lock In" onPress={handleLockIn} />
              </>
            )}
            {mode === MODES.BREAK && <Button title="Finish Break" onPress={handleFinish} />}
          </View>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 20,
  },
  lockedInContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  lockedInHeader: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  taskContainer: {
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    width: "90%",
  },
  label: {
    fontSize: 18,
    fontWeight: "bold",
  },
  taskText: {
    fontSize: 16,
    marginVertical: 5,
  },
  timer: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#007bff",
    marginVertical: 10,
  },
  buttonsContainer: {
    marginTop: 20,
    flexDirection: "column",
    alignItems: "center",
  },
});

export default HomeScreen;
