import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

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

const styles = StyleSheet.create({
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

export default TaskItem;
