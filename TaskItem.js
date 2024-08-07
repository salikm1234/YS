import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card, IconButton } from 'react-native-paper';

const TaskItem = ({ task, onDelete, onEdit }) => {
  return (
    <Card style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.title}>{task.name}</Text>
        <Text style={styles.time}>{task.time}</Text>
        <View style={styles.actions}>
          <IconButton icon="delete" onPress={() => onDelete(task.id)} />
          <IconButton icon="edit" onPress={() => onEdit(task.id)} />
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
  },
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 18,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  time: {
    marginRight: 8,
  },
});

export default TaskItem;
