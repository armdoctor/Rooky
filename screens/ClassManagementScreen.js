import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

const ClassManagementScreen = ({ route }) => {
    const { classData } = route.params;
  
    // Access the class information from the classData object
    const {
      listingId,
      formattedEndDateTime,
      formattedStartDateTime,
      className,
      classPrice,
      classDescription,
      classSeats,
    } = classData;
  
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{className}</Text>
        <Text style={styles.price}>Class Price: ${classPrice}</Text>
        <Text style={styles.description}>{classDescription}</Text>
        <Text style={styles.date}>Start Date & Time: {formattedStartDateTime}</Text>
        <Text style={styles.date}>End Date & Time: {formattedEndDateTime}</Text>
        <Text style={styles.listingId}>Listing ID: {listingId}</Text>
        <Text style={styles.seats}>Available Seats: {classSeats}</Text>
        {/* Add additional class details here */}
      </View>
    );
  };  

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: 'black',
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
  },
  date: {
    fontSize: 14,
    marginBottom: 10,
  },
  listingId: {
    fontSize: 14,
    marginBottom: 10,
    color: '#888',
  },
  seats: {
    fontSize: 14,
    marginBottom: 10,
    fontWeight: 'bold',
  },
});

export default ClassManagementScreen;
