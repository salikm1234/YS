import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let interval;
    if (running) {
      interval = setInterval(() => {
        setTime(prevTime => prevTime + 1);
      }, 1000);
    } else if (!running && time !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [running, time]);

  const startStopwatch = () => setRunning(true);
  const stopStopwatch = () => setRunning(false);
  const resetStopwatch = () => {
    setRunning(false);
    setTime(0);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.time}>{new Date(time * 1000).toISOString().substr(11, 8)}</Text>
      <Button title={running ? "Stop" : "Start"} onPress={running ? stopStopwatch : startStopwatch} />
      <Button title="Reset" onPress={resetStopwatch} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  time: {
    fontSize: 48,
    marginBottom: 20,
  },
});

export default Stopwatch;
