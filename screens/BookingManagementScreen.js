import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import Icon from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';

const BookingManagementScreen = ({ navigation }) => {
  const currentUser = auth.currentUser;
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);
  const [groupClassBookings, setGroupClassBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      const bookingsQuery = query(
        collection(db, 'bookingSuggestions'),
        where('confirmed', '==', true),
        where('confirmedBy', '==', currentUser.uid)
      );

      const bookingsSnapshot = await getDocs(bookingsQuery);
      const confirmedByBookings = [];

      bookingsSnapshot.forEach((doc) => {
        const booking = { id: doc.id, ...doc.data() }; // Include the document ID as the `id` property
        confirmedByBookings.push(booking);
      });

      const createdByQuery = query(
        collection(db, 'bookingSuggestions'),
        where('confirmed', '==', true),
        where('createdBy', '==', currentUser.uid)
      );

      const createdBySnapshot = await getDocs(createdByQuery);
      const createdByBookings = [];

      createdBySnapshot.forEach((doc) => {
        const booking = { id: doc.id, ...doc.data() }; // Include the document ID as the `id` property
        createdByBookings.push(booking);
      });

      const fetchedBookings = [...confirmedByBookings, ...createdByBookings];

      // Sort the bookings in ascending order based on "classStart"
      fetchedBookings.sort((a, b) => a.classStart.toDate() - b.classStart.toDate());

      // Filter and separate the bookings into 'Upcoming' and 'Completed' categories
      const upcomingBookings = fetchedBookings.filter((booking) => booking.confirmed && !booking.completed);

      const completedBookings = fetchedBookings.filter((booking) => booking.confirmed && booking.completed);

      // Fetch the full name of the user associated with each booking
      const updatedUpcomingBookings = await Promise.all(
        upcomingBookings.map(async (booking) => {
          const userQuery = query(collection(db, 'users'), where('userId', '==', booking.confirmedBy === currentUser.uid ? booking.createdBy : booking.confirmedBy));
          const userSnapshot = await getDocs(userQuery);
          const user = userSnapshot.docs[0].data();
          return { ...booking, fullName: user.fullName };
        })
      );

      const updatedCompletedBookings = await Promise.all(
        completedBookings.map(async (booking) => {
          const userQuery = query(collection(db, 'users'), where('userId', '==', booking.confirmedBy === currentUser.uid ? booking.createdBy : booking.confirmedBy));
          const userSnapshot = await getDocs(userQuery);
          const user = userSnapshot.docs[0].data();
          return { ...booking, fullName: user.fullName };
        })
      );

      setUpcomingBookings(updatedUpcomingBookings);
      setCompletedBookings(updatedCompletedBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      fetchBookings();
    }, [])
  );

  useEffect(() => {
    const fetchGroupBookings = async () => {
      try {
        const studentsQuery = query(collection(db, 'classes'), where('Students', 'array-contains', currentUser.uid));
        const teacherQuery = query(collection(db, 'classes'), where('teacherId', '==', currentUser.uid));
        
        const studentsSnapshot = await getDocs(studentsQuery);
        const teacherSnapshot = await getDocs(teacherQuery);
  
        const groupClassBookings = [];
        
        const fetchTeacherFullName = async (teacherId) => {
          const teacherQuery = query(collection(db, 'users'), where('userId', '==', teacherId));
          const teacherSnapshot = await getDocs(teacherQuery);
          const teacher = teacherSnapshot.docs[0].data();
          return teacher.fullName;
        };
  
        for (const doc of studentsSnapshot.docs) {
          const classData = { classId: doc.id, ...doc.data() };
          const teacherFullName = await fetchTeacherFullName(classData.teacherId);
          classData.teacherFullName = teacherFullName;
          groupClassBookings.push(classData);
        }
  
        for (const doc of teacherSnapshot.docs) {
          const classData = { classId: doc.id, ...doc.data() };
          const teacherFullName = await fetchTeacherFullName(classData.teacherId);
          classData.teacherFullName = teacherFullName;
          // Only add the class data if it hasn't already been added (to avoid duplicates)
          if (!groupClassBookings.some(item => item.classId === classData.classId)) {
            groupClassBookings.push(classData);
          }
        }
  
        setGroupClassBookings(groupClassBookings);
      } catch (error) {
        console.error('Error fetching group class bookings:', error);
      }
    };
  
    fetchGroupBookings();
  }, [currentUser.uid]);
  

  const handleBackButtonPress = () => {
    navigation.goBack();
  };

  const formatBookingDateTime = (booking) => {
    const startDateTime = booking.classStart.toDate();
    const formattedDateTime = startDateTime.toLocaleString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
    });
    return formattedDateTime;
  };

  const renderItem = ({ item }) => {
    const durationInHours = item.durationHours; // Assuming duration is stored in hours
    const durationInMinutes = (item.durationHours % 1) * 60; // Calculate the minutes from the decimal part

    // Format the duration as "Xh Ymin"
    const formattedDuration = `${Math.floor(durationInHours)}h and ${Math.round(durationInMinutes)}min`;

    return (
      <TouchableOpacity
        style={styles.bookingItem}
        onPress={() => navigation.navigate('BookingDetailsScreen', { booking: item })}
      >
        <Text style={styles.fullName}>{item.selectedCategory} with {item.fullName}</Text>
        <Text style={styles.bookingDateTime}>{formatBookingDateTime(item)}</Text>
      </TouchableOpacity>
    );
  };

  const renderGroupClassItem = ({ item }) => {
    const teacherFullName = item.teacherFullName;
    const formattedStartDateTime = item.startDateTime
      ? item.startDateTime.toDate().toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : '';
  
    const isCurrentUserTeacher = item.teacherId === currentUser.uid;
  
    const onPressItem = () => {
      if (isCurrentUserTeacher) {
        console.log('Navigating to ClassManagementScreen with classData:', item);
        navigation.navigate('ClassManagementScreen', { classData: item });
      } else {
        console.log('Navigating to BookedClassesScreen with classData:', item);
        navigation.navigate('BookedClassesScreen', { classData: item, teacherFullName });
      }
    };
  
    return (
      <TouchableOpacity style={styles.bookingItem} onPress={onPressItem}>
        <Text style={styles.fullName}>{item.className} with {teacherFullName}</Text>
        <Text style={styles.bookingDateTime}>{formattedStartDateTime}</Text>
      </TouchableOpacity>
    );
  };
  

  return (
    <View style={styles.container}>
      <SafeAreaView>
        <TouchableOpacity style={styles.backButton} onPress={handleBackButtonPress}>
          <Icon name="arrow-back" size={25} color="#FF385C" />
        </TouchableOpacity>
        <Text style={styles.heading}>My Bookings</Text>
        {/* Upcoming Bookings */}
        <Text style={styles.categoryUpcoming}>Upcoming Private Classes</Text>
        <FlatList
          data={upcomingBookings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.subtext}>No upcoming bookings</Text>}
        />
        {/* Upcoming Group Bookings */}
        <Text style={styles.categoryUpcoming}>Upcoming Group Classes</Text>
        <FlatList
          data={groupClassBookings}
          renderItem={renderGroupClassItem}
          keyExtractor={(item) => item.classId}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.subtext}>No upcoming group classes</Text>}
        />

        {/* Completed Bookings */}
        <Text style={styles.categoryCompleted}>Completed</Text>
        <FlatList
          data={completedBookings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={<Text style={styles.subtext}>No completed bookings.</Text>}
        />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 38,
    left: 0,
    zIndex: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingTop: 10,
    marginBottom: 0,
    textAlign: 'center',
  },
  bookingItem: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
  },
  fullName: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bookingDateTime: {
    fontSize: 17,
    marginBottom: 6,
  },
  bookingDuration: {
    fontSize: 16,
    color: '#888',
  },
  listContainer: {
    flexGrow: 1,
  },
  categoryUpcoming: {
    fontSize: 25,
    fontWeight: 'bold',
    marginLeft: 5,
    color: "#FF385C",
    paddingTop: 30,
  },
  categoryCompleted: {
    fontSize: 25,
    fontWeight: 'bold',
    marginLeft: 5,
    marginTop: 20,
    color: "#FF385C",
  },
  subtext: {
    fontSize: 15,
    marginLeft: 5,
    marginTop: 5,
    fontWeight: 'bold',
  },
});

export default BookingManagementScreen;