import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import React from 'react';

const ClassCard = ({ className, classDescription, classPrice }) => {

  return (
    <View>
      <TouchableOpacity style={styles.classItem}>
        <Text>Price: {classPrice}</Text>
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