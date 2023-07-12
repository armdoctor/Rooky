import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';

const ClassCard = ({ className, classDescription, classPrice, classStart, classEnd }) => {
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
        <Text>Price: {classPrice}</Text>
        <Text>Start: {formattedStartDateTime}</Text>
        <Text>End: {formattedEndDateTime}</Text>
        <Text>Name: {className}</Text>
        <Text>Description: {classDescription}</Text>
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
});