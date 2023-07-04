import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const CreateClass = ({ closeModal, listingId }) => {
  const [className, setClassName] = useState('');
  const [classPrice, setClassPrice] = useState('');
  const [classDescription, setClassDescription] = useState('');

  const handleCreateClass = async () => {
    try {
      const classData = {
        className,
        classPrice: parseFloat(classPrice),
        classDescription,
        createdAt: serverTimestamp(),
        listingId,
      };

      await addDoc(collection(db, 'classes'), classData);
      closeModal();
    } catch (error) {
      console.error('Error creating class:', error);
    }
  };

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Create New Class</Text>
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
          placeholder="Description"
          placeholderTextColor="#888"
          value={classDescription}
          onChangeText={setClassDescription}
          multiline
        />
        <TouchableOpacity style={styles.button} onPress={handleCreateClass}>
          <Text style={styles.buttonText}>Create Class</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
          <Text style={styles.buttonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
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
});

export default CreateClass;
