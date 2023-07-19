import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { updateDoc, doc, arrayUnion } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getAuth } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { list } from 'firebase/storage';

const ClassDetailsScreen = ({ route, navigation }) => {
  const { classData, listingId } = route.params;
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
  const formattedCreatedAt = classData.createdAt
    ? classData.createdAt.toDate().toLocaleString('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true,
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : '';
  const auth = getAuth();
  // Function to fetch the current user's ID
  const getCurrentUserId = () => {
    const user = auth.currentUser;
    if (user) {
      return user.uid;
    } else {
      // User is not logged in
      return null;
    }
  };
  const userId = getCurrentUserId();


    const handleBookClass = async (userId) => {
      const updatedClassSeats = classData.classSeats - 1;
    
      try {
        // Update the 'classSeats' and 'Students' fields in Firestore
        const classRef = doc(db, 'classes', classData.classId);
        await updateDoc(classRef, {
          classSeats: updatedClassSeats,
          Students: arrayUnion(userId), // Add the logged-in user's ID to the 'Students' array field
          classType: 'group'
        });
        // Display success message or navigate to a confirmation screen
        Alert.alert('Booking Confirmed', 'Your booking has been confirmed successfully.', [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to the previous screen
              navigation.goBack();
            },
          },
        ]);
        // Handle any additional logic or UI updates after successful update
        console.log('Class booked! Updated class seats:', updatedClassSeats);
      } catch (error) {
        console.error('Error updating class seats:', error);
      }
    };    

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>{classData.className}</Text>
      </View>
      <View style={styles.contentContainer}>
        <Text style={styles.price}>${classData.classPrice}</Text>
        <Text style={styles.seatsAvailable}>{classData.classSeats} Seats Available</Text>
        <Text style={styles.description}>{classData.classDescription}</Text>
        <Text style={styles.dateTime}>Start: {formattedStartDateTime}</Text>
        <Text style={styles.dateTime}>End: {formattedEndDateTime}</Text>
        <Text style={styles.dateTime}>TeacherID: {classData.teacherId}</Text>
        <Text style={styles.dateTime}>ListingID: {listingId}</Text>
        <Text style={styles.dateTime}>Created At: {formattedCreatedAt}</Text>
        <TouchableOpacity style={styles.bookButton} onPress={() => handleBookClass(userId)}>
          <Text style={styles.bookButtonText}>Book Class</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  backButton: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  seatsAvailable: {
    fontSize: 16,
    color: '#888',
    marginBottom: 24,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
  },
  dateTime: {
    fontSize: 16,
    marginBottom: 8,
  },
  bookButton: {
    backgroundColor: '#FF385C',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  bookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ClassDetailsScreen;
