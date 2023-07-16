import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, KeyboardAvoidingView } from 'react-native';
import { addDoc, collection, doc, serverTimestamp } from 'firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import { db } from '../firebase/firebase';

const CreateClass = ({ closeModal, listingId }) => {
  const [className, setClassName] = useState('');
  const [classPrice, setClassPrice] = useState('');
  const [classSeats, setClassSeats] = useState('');
  const [classDescription, setClassDescription] = useState('');
  const [startDateTime, setStartDateTime] = useState(new Date());
  const [endDateTime, setEndDateTime] = useState(new Date());
  const [showStartDateTimePicker, setShowStartDateTimePicker] = useState(false);
  const [showEndDateTimePicker, setShowEndDateTimePicker] = useState(false);

  const handleCreateClass = async () => {
    try {
      const classData = {
        className,
        classPrice: parseFloat(classPrice),
        classSeats: parseFloat(classSeats),
        classDescription,
        startDateTime,
        endDateTime,
        createdAt: serverTimestamp(),
        listingId,
      };

      await addDoc(collection(db, 'classes'), classData);
      closeModal();
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  const handleStartDateTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || startDateTime;
    setShowStartDateTimePicker(false);
    setStartDateTime(currentDate);
  };

  const handleEndDateTimeChange = (event, selectedDate) => {
    const currentDate = selectedDate || endDateTime;
    setShowEndDateTimePicker(false);
    setEndDateTime(currentDate);
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={40}>
      <Text style={styles.title}> New Group Class</Text>
      <TextInput
        style={styles.input}
        placeholder="Class Name"
        placeholderTextColor="#888"
        value={className}
        onChangeText={setClassName}
      />
      <TextInput
        style={styles.input}
        placeholder="Price"
        placeholderTextColor="#888"
        value={classPrice}
        onChangeText={setClassPrice}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Number of Seats"
        placeholderTextColor="#888"
        value={classSeats}
        onChangeText={setClassSeats}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Description"
        placeholderTextColor="#888"
        value={classDescription}
        onChangeText={setClassDescription}
        multiline
      />
      <TouchableOpacity
        style={styles.dateTimeButton}
        onPress={() => setShowStartDateTimePicker(true)}
      >
        <Text style={styles.dateTimeButtonText}>
          Start Date & Time: {startDateTime.toLocaleString()}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.dateTimeButton}
        onPress={() => setShowEndDateTimePicker(true)}
      >
        <Text style={styles.dateTimeButtonText}>
          End Date & Time: {endDateTime.toLocaleString()}
        </Text>
      </TouchableOpacity>
      {showStartDateTimePicker && (
        <DateTimePicker
          value={startDateTime}
          mode="datetime"
          is24Hour={true}
          display="default"
          onChange={handleStartDateTimeChange}
        />
      )}
      {showEndDateTimePicker && (
        <DateTimePicker
          value={endDateTime}
          mode="datetime"
          is24Hour={true}
          display="default"
          onChange={handleEndDateTimeChange}
        />
      )}
      <TouchableOpacity style={styles.button} onPress={handleCreateClass}>
        <Text style={styles.buttonText}>Create Class</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#FF385C',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 15,
  },
  cancelButton: {
    backgroundColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  dateTimeButton: {
    marginBottom: 10,
  },
  dateTimeButtonText: {
    fontSize: 14,
    color: '#000',
  },
});

export default CreateClass;
