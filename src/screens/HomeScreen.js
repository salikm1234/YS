import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';

const MODES = {
  WORK: 'Work Session',
  BREAK: 'Break',
  BUSY: 'Busy Time',
  LIMBO: 'Pause/Limbo',
  LOCKED_IN: 'Locked In',
};

const HomeScreen = () => {
  const [mode, setMode] = useState(MODES.LIMBO); // Default mode
  const [timeLeft, setTimeLeft] = useState(0); // Time in seconds
  const [nextTask, setNextTask] = useState('Study Physics'); // Placeholder next task

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer); // Clear timer when component unmounts
    } else if (timeLeft === 0 && mode !== MODES.LIMBO) {
      handleModeTransition(); // Automatically move to next mode
    }
  }, [timeLeft]);

  const startTimer = (duration) => {
    setTimeLeft(duration * 60); // Convert minutes to seconds
  };

  const handleModeTransition = () => {
    switch (mode) {
      case MODES.WORK:
        setMode(MODES.LIMBO);
        break;
      case MODES.BREAK:
        setMode(MODES.WORK);
        startTimer(25); // Start next work session (Pomodoro default)
        break;
      case MODES.BUSY:
        setMode(MODES.LIMBO);
        break;
      case MODES.LOCKED_IN:
        setMode(MODES.LIMBO);
        break;
      default:
        setMode(MODES.LIMBO);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Current Mode: {mode}</Text>
      {timeLeft > 0 && <Text style={styles.timer}>Time Left: {formatTime(timeLeft)}</Text>}

      {mode === MODES.LIMBO && (
        <View>
          <Text>Next Task: {nextTask}</Text>
          <Button title="Start Next Task" onPress={() => setMode(MODES.WORK)} />
        </View>
      )}

      {mode === MODES.WORK && (
        <View>
          <Text>Focus on your task!</Text>
          <Button title="Need a Break" onPress={() => setMode(MODES.BREAK)} />
          <Button title="Finish" onPress={() => setMode(MODES.LIMBO)} />
          <Button title="Lock In" onPress={() => setMode(MODES.LOCKED_IN)} />
        </View>
      )}

      {mode === MODES.BREAK && (
        <View>
          <Text>Enjoy your break!</Text>
          <Button title="Finish Break" onPress={() => handleModeTransition()} />
        </View>
      )}

      {mode === MODES.BUSY && (
        <View>
          <Text>Currently Busy</Text>
          <Button title="Start Early" onPress={() => setMode(MODES.WORK)} />
        </View>
      )}

      {mode === MODES.LOCKED_IN && (
        <View>
          <Text>Locked In Mode</Text>
          <Button title="Unlock" onPress={() => setMode(MODES.LIMBO)} />
        </View>
      )}
    </View>
  );
};

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  timer: {
    fontSize: 18,
    marginBottom: 20,
  },
});

export default HomeScreen;
