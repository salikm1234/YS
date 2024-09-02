import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Button, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';

const CalendarScreen = ({ navigation }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [dailyGoals, setDailyGoals] = useState([]);
  const [markedDates, setMarkedDates] = useState({});

  useFocusEffect(
    React.useCallback(() => {
      if (selectedDate) {
        loadGoals(selectedDate);
      }
    }, [selectedDate])
  );

  const loadGoals = async (date) => {
    const goals = await AsyncStorage.getItem(date);
    setDailyGoals(goals ? JSON.parse(goals) : []);

    setMarkedDates({
      [date]: {
        selected: true,
        marked: true,
        selectedColor: '#00adf5',
      },
    });
  };

  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
  };

  const deleteGoal = async (goalId) => {
    const updatedGoals = dailyGoals.filter(goal => goal.id !== goalId);
    setDailyGoals(updatedGoals);

    if (selectedDate) {
      await AsyncStorage.setItem(selectedDate, JSON.stringify(updatedGoals));
    }
  };

  const resetGoals = async () => {
    if (selectedDate) {
      await AsyncStorage.removeItem(selectedDate);
      setDailyGoals([]);
    }
  };

  const renderItem = ({ item }) => {
    const startTime = item.startTime ? new Date(item.startTime) : null;
    const endTime = item.endTime ? new Date(item.endTime) : null;

    return (
      <View style={styles.goalItem}>
        <Text style={[styles.goalText, item.completed && styles.completedText]}>
          {item.name}
        </Text>
        {startTime && endTime ? (
          <Text style={styles.goalTime}>
            {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - 
            {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        ) : (
          <Text style={styles.goalTime}>Time not set</Text>
        )}
        <TouchableOpacity
          style={styles.deleteButtonContainer}
          onPress={() => deleteGoal(item.id)}
        >
          <Ionicons name="trash-bin" size={24} color="#ff6347" />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Calendar
        onDayPress={onDayPress}
        markedDates={markedDates}
      />
      {selectedDate && (
        <View>
          {dailyGoals.length > 0 ? (
            <FlatList
              data={dailyGoals}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              ListHeaderComponent={<Text style={styles.header}>Goals for {selectedDate}</Text>}
            />
          ) : (
            <View style={styles.noGoals}>
              <Text>No goals planned for this day.</Text>
            </View>
          )}
          <Button
            title="Add More Goals"
            onPress={() => navigation.navigate('GoalSelection', { date: selectedDate })}
          />
          <Button
            title="Reset Goals"
            onPress={resetGoals}
            color="red"
          />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  goalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#00BFFF',
  },
  goalText: {
    fontSize: 18,
    color: '#fff',
    flex: 1,
  },
  goalTime: {
    fontSize: 16,
    color: '#fff',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  deleteButtonContainer: {
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 12,
  },
  noGoals: {
    alignItems: 'center',
    marginTop: 20,
  },
});

export default CalendarScreen;
