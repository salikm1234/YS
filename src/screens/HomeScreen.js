import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Button } from "react-native";

const HomeScreen = () => {
  const [mode, setMode] = useState("limbo"); // Modes: work, break, busy, limbo, locked
  const [currentTask, setCurrentTask] = useState({
    taskName: "Sample Task",
    duration: 25, // in minutes
  });
  const [nextTask, setNextTask] = useState({
    taskName: "Next Sample Task",
    duration: 30, // in minutes
  });
  const [timeLeft, setTimeLeft] = useState(0); // Timer for current activity
  const [isLockedIn, setIsLockedIn] = useState(false); // Lock-In Mode
  const [stopwatchStartTime, setStopwatchStartTime] = useState(null); // Stopwatch for lock-in mode

  // Timer logic
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);

      return () => clearInterval(timer);
    } else if (timeLeft === 0 && mode === "work") {
      setMode("break");
      setTimeLeft(5 * 60); // Set a 5-minute break
    }
  }, [timeLeft]);

  const handleStart = () => {
    if (mode === "limbo" && currentTask) {
      setMode("work");
      setTimeLeft(currentTask.duration * 60); // Start the timer for the task
    } else {
      alert("No task to start!");
    }
  };

  const handleFinish = () => {
    if (mode === "work") {
      setMode("limbo"); // End the current work session
      setTimeLeft(0);
    } else if (mode === "break") {
      setMode("work"); // Move to the next work session
      setTimeLeft(currentTask ? currentTask.duration * 60 : 0);
    }
  };

  const handleNeedBreak = () => {
    if (mode === "work") {
      setMode("break");
      setTimeLeft(5 * 60); // Set break to 5 minutes
    }
  };

  const toggleLockIn = () => {
    if (!isLockedIn) {
      setIsLockedIn(true);
      setStopwatchStartTime(Date.now());
    } else {
      setIsLockedIn(false);
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
          <Text style={styles.lockedInText}>Locked-In Mode</Text>
          <Text style={styles.timer}>{formatTime(timeLeft)}</Text>
          <Button title="Unlock" onPress={toggleLockIn} color="#ff4d4d" />
        </>
      ) : (
        <>
          <Text style={styles.header}>Current Task</Text>
          {currentTask ? (
            <View style={styles.taskContainer}>
              <Text style={styles.taskName}>{currentTask.taskName}</Text>
              {mode !== "limbo" && <Text>Time Left: {formatTime(timeLeft)}</Text>}

              {/* Buttons based on mode */}
              {mode === "limbo" && <Button title="Start" onPress={handleStart} />}
              {mode === "work" && <Button title="Finish" onPress={handleFinish} />}
              {mode === "break" && <Button title="Finish Break" onPress={handleFinish} />}
              {mode === "work" && <Button title="Need a Break" onPress={handleNeedBreak} />}
              {mode === "work" && <Button title="Lock In" onPress={toggleLockIn} />}
            </View>
          ) : (
            <Text>No task in progress.</Text>
          )}
          {nextTask && (
            <View style={styles.nextTaskContainer}>
              <Text style={styles.header}>Next Task</Text>
              <Text>{nextTask.taskName}</Text>
              <Text>Duration: {nextTask.duration} minutes</Text>
            </View>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  lockedInContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  lockedInText: {
    fontSize: 28,
    color: "#fff",
    marginBottom: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  taskContainer: {
    marginBottom: 20,
  },
  taskName: {
    fontSize: 18,
    fontWeight: "bold",
  },
  timer: {
    fontSize: 32,
    color: "#007bff",
    fontWeight: "bold",
  },
  nextTaskContainer: {
    marginTop: 20,
  },
});

export default HomeScreen;
