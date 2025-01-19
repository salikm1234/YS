import React from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';

export default function BusyTimeList({ busyTimes, onDelete }) {
  return (
    <FlatList
      data={busyTimes}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item, index }) => (
        <View style={styles.listItem}>
          <Text>
            {item.type} Busy Time: {item.startTime} - {item.endTime} ({item.recurrence})
          </Text>
          <TouchableOpacity onPress={() => onDelete(index)}>
            <Text style={styles.deleteButton}>Delete</Text>
          </TouchableOpacity>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  listItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  deleteButton: {
    color: 'red',
  },
});