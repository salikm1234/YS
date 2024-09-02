import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const wellnessDimensions = {
  Physical: "Physical wellness promotes proper care of our bodies for optimal health and functioning.",
  Mental: "Mental wellness involves our psychological and emotional well-being.",
  Environmental: "Environmental wellness inspires us to live a lifestyle that is respectful of our surroundings.",
  Financial: "Financial wellness involves the process of learning how to successfully manage financial expenses.",
  Intellectual: "Intellectual wellness encourages us to engage in creative and mentally-stimulating activities.",
  Occupational: "Occupational wellness inspires us to prepare for work in which we will gain personal satisfaction and find enrichment in our life through work.",
  Social: "Social wellness helps you perform social roles effectively and comfortably, and create a support network.",
  Spiritual: "Spiritual wellness allows us to develop a set of values that help us seek meaning and purpose.",
};

const HomeScreen = ({ navigation }) => {
  const [dailyGoals, setDailyGoals] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedDimension, setSelectedDimension] = useState(null);

  const loadGoals = async () => {
    const today = getAdjustedTodayDate();
    const goals = await AsyncStorage.getItem(today);
    const parsedGoals = goals ? JSON.parse(goals) : [];
    setDailyGoals(parsedGoals);
  };

  const getAdjustedTodayDate = () => {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() - 1); // Subtract one day
    return currentDate.toISOString().split('T')[0];
  };

  useFocusEffect(
    React.useCallback(() => {
      loadGoals();
    }, [])
  );

  const openModal = (dimension) => {
    setSelectedDimension(dimension);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedDimension(null);
  };

  const getColorForDimension = () => {
    return '#00BFFF'; // Single color theme
  };

  const toggleCompleteGoal = async (goalId) => {
    const today = getAdjustedTodayDate();
    const updatedGoals = dailyGoals.map(goal =>
      goal.id === goalId ? { ...goal, completed: !goal.completed } : goal
    );
    setDailyGoals(updatedGoals);
    await AsyncStorage.setItem(today, JSON.stringify(updatedGoals));
  };

  const renderItem = ({ item }) => (
    <View style={[styles.goalItem, { backgroundColor: getColorForDimension() }]}>
      <Text style={[styles.goalText, item.completed && styles.completedText]}>
        {item.name}
      </Text>
      <TouchableOpacity onPress={() => toggleCompleteGoal(item.id)}>
        <Ionicons
          name={item.completed ? "checkmark-circle" : "ellipse-outline"}
          size={28}
          color={item.completed ? "#00BFFF" : "#fff"}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={dailyGoals}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={<Text style={styles.header}>Today's Goals</Text>}
      />

      <TouchableOpacity
        style={styles.planButton}
        onPress={() => navigation.navigate('GoalSelection', { date: getAdjustedTodayDate() })}
      >
        <Ionicons name="add-circle" size={50} color="#00BFFF" />
        <Text style={styles.planButtonText}>Plan More Goals</Text>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedDimension}</Text>
            <Text style={styles.modalText}>{wellnessDimensions[selectedDimension]}</Text>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  goalItem: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#00BFFF', // Single color theme
  },
  goalText: {
    fontSize: 18,
    color: '#fff',
    flex: 1,
    marginRight: 10,
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: 'gray',
  },
  planButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  planButtonText: {
    fontSize: 20,
    marginLeft: 10,
    color: '#00BFFF',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    width: '80%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    padding: 10,
    borderRadius: 5,
    backgroundColor: '#00BFFF',
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 18,
  },
});

export default HomeScreen;
