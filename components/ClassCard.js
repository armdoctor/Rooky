import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';

const ClassCard = ({ className, classDescription, classPrice, classStart, classEnd, closeModal }) => {
    const formattedStartDateTime= classStart.toDate().toLocaleString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });
    const formattedEndDateTime= classEnd.toDate().toLocaleString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
    });

  return (
    <View>
      <TouchableOpacity style={styles.classItem}>
        <Text>Name: {className}</Text>
        <Text>Price: {classPrice}</Text>
        <Text>Start: {formattedStartDateTime}</Text>
        <Text>End: {formattedEndDateTime}</Text>
        <Text>Description: {classDescription}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
        <Text style={styles.buttonText}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ClassCard;

const styles = StyleSheet.create({
    classContainer: {
      paddingHorizontal: 10,
    },
    classItem: {
      backgroundColor: '#f7f7f7',
      padding: 20,
      marginBottom: 10,
      borderRadius: 8,
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