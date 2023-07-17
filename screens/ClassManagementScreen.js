import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ClassManagementScreen = ({ route }) => {
  const { classData, listingId, formattedEndDateTime, formattedStartDateTime, className, classPrice, classDescription, classSeats } = route.params;

  return (
    <View style={styles.container}>
      <Text>{className}</Text>
      <Text>Class Price: ${classPrice}</Text>
      <Text>{classDescription}</Text>
      <Text>Start Date & Time: {formattedStartDateTime}</Text>
      <Text>End Date & Time: {formattedEndDateTime}</Text>
      <Text>Listing ID: {listingId}</Text>
      <Text>Available Seats: {classSeats}</Text>
      {/* Add additional class details here */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    marginBottom: 10,
  },
});

export default ClassManagementScreen;
