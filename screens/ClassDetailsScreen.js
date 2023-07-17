import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase/firebase';

const ClassDetailsScreen = ({ route }) => {
    const { classData, classId } = route.params;  
    const formattedStartDateTime = classData.startDateTime
      ? classData.startDateTime.toDate().toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : '';
    const formattedEndDateTime = classData.endDateTime
      ? classData.endDateTime.toDate().toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : '';
      
    const handleBookClass = async () => {
      const updatedClassSeats = classData.classSeats - 1;
      
      try {
        // Update the 'classSeats' field in Firestore
        await updateDoc(doc(db, 'classes', classData.classId), {
          classSeats: updatedClassSeats,
        });
      
        // Handle any additional logic or UI updates after successful update
        console.log('Class booked! Updated class seats:', updatedClassSeats);
      } catch (error) {
        console.error('Error updating class seats:', error);
      }
    };
  
    return (
      <SafeAreaView>
        <Text>{classData.className}</Text>
        <Text>${classData.classPrice}</Text>
        <Text>{classData.classSeats} Seats Available</Text>
        <Text>{classData.classId}</Text>
        <Text>Description:</Text>
        <Text>{classData.classDescription}</Text>
        <Text>{formattedStartDateTime}</Text>
        <Text>{formattedEndDateTime}</Text>
        <TouchableOpacity style={styles.button} onPress={handleBookClass}>
          <Text style={styles.buttonText}>Book Class</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  };
  
  const styles = StyleSheet.create({
    button: {
      backgroundColor: '#FF385C',
      borderRadius: 10,
      paddingVertical: 15,
      paddingHorizontal: 30,
      marginTop: 20,
    },
    buttonText: {
      color: '#FFFFFF',
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
  
  export default ClassDetailsScreen;