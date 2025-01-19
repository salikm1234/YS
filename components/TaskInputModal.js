import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import GlobalStyles from '../styles/GlobalStyles';

export default function TaskInputModal({
  visible,
  onClose,
  onSave,
  initialTask = null,
  categories = [],
}) {
  const [taskName, setTaskName] = useState(initialTask?.name || '');
  const [duration, setDuration] = useState(initialTask?.duration || '');
  const [priority, setPriority] = useState(initialTask?.priority || 'Low');
  const [category, setCategory] = useState(initialTask?.category || categories[0]);

  const handleSave = () => {
    if (!taskName || !duration) {
      alert('Please fill in all required fields.');
      return;
    }
    onSave({
      ...initialTask,
      name: taskName,
      duration,
      priority,
      category,
    });
    onClose();
  };

  return (
    <Modal transparent={true} visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <Text style={GlobalStyles.heading}>Task Details</Text>

          <Text>Task Name</Text>
          <TextInput
            style={GlobalStyles.input}
            placeholder="Enter task name"
            value={taskName}
            onChangeText={setTaskName}
          />

          <Text>Duration (in minutes)</Text>
          <TextInput
            style={GlobalStyles.input}
            placeholder="Enter duration"
            keyboardType="numeric"
            value={duration}
            onChangeText={setDuration}
          />

          <Text>Priority</Text>
          <Picker
            selectedValue={priority}
            onValueChange={setPriority}
            style={GlobalStyles.input}
          >
            <Picker.Item label="Low" value="Low" />
            <Picker.Item label="Medium" value="Medium" />
            <Picker.Item label="High" value="High" />
          </Picker>

          <Text>Category</Text>
          <Picker
            selectedValue={category}
            onValueChange={setCategory}
            style={GlobalStyles.input}
          >
            {categories.map((cat, index) => (
              <Picker.Item key={index} label={cat} value={cat} />
            ))}
          </Picker>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={GlobalStyles.button} onPress={handleSave}>
              <Text style={GlobalStyles.buttonText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[GlobalStyles.button, { backgroundColor: 'gray' }]}
              onPress={onClose}
            >
              <Text style={GlobalStyles.buttonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
});