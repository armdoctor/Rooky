import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';

const BookedClassScreen = ({ navigation, route }) => {
  const { classData } = route.params;
  const [teacherFullName, setTeacherFullName] = useState('');
  const currentUser = auth.currentUser; // Get the current user

  useEffect(() => {
    const fetchTeacherFullName = async () => {
      try {
        const teacherQuery = query(collection(db, 'users'), where('userId', '==', classData.teacherId));
        const teacherSnapshot = await getDocs(teacherQuery);
        const teacherDoc = teacherSnapshot.docs[0];
        if (teacherDoc) {
          const teacherData = teacherDoc.data();
          setTeacherFullName(teacherData.fullName);
        }
      } catch (error) {
        console.error('Error fetching teacher full name:', error);
      }
    };

    fetchTeacherFullName();
  }, [classData.teacherId]);

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

    const handleCancelBooking = async () => {
        try {
          const classRef = doc(db, 'classes', classData.classId);
          await updateDoc(classRef, {
            Students: classData.Students.filter(studentId => studentId !== currentUser.uid),
            classSeats: classData.classSeats + 1, // Increment classSeats by one
          });
          // Display success message or navigate to a confirmation screen
          Alert.alert('Booking Canceled', 'Your booking has been canceled successfully.', [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to the previous screen
                navigation.goBack();
              },
            },
          ]);
        } catch (error) {
          console.error('Error canceling booking:', error);
          // Display error message or handle the error accordingly
          Alert.alert('Error', 'Failed to cancel the booking. Please try again later.');
        }
      };      
         

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{classData.className}</Text>
      <Text style={styles.price}>${classData.classPrice}</Text>
      <Text style={styles.subtitle}>Start:</Text>
      <Text style={styles.date}>{formattedStartDateTime}</Text>
      <Text style={styles.subtitle}>End:</Text>
      <Text style={styles.date}>{formattedEndDateTime}</Text>
      <Text style={styles.subtitle}>Teacher:</Text>
      <Text style={styles.date}>{teacherFullName}</Text>
      <Text style={styles.subtitle}>Description:</Text>
      <Text style={styles.description}>{classData.classDescription}</Text>
      <TouchableOpacity style={styles.cancelButton} onPress={() => handleCancelBooking(currentUser)}>
        <Text style={styles.cancelButtonText}>Cancel Booking</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BookedClassScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
  },
  date: {
    fontSize: 14,
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  cancelButton: {
    backgroundColor: '#FF385C',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
