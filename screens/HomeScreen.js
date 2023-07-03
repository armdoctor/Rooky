import { StyleSheet, Text, View, TouchableOpacity, Modal, Image, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { db, auth } from '../firebase/firebase';
import { getDocs, collection, query, where } from 'firebase/firestore';
import LoginScreen from './LoginScreen';
import Icon from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';
import getProfileImage from '../components/ProfileImage';


const HomeScreen = ({ navigation }) => {
  const [categoryList, setCategoryList] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalVisible, setLoginModalVisible] = useState(false);
  const [targetScreen, setTargetScreen] = useState('');
  const [profileImageURL, setProfileImageURL] = useState('');
  const [profileImageName, setProfileImageName] = useState('');
  const currentUser = auth.currentUser;
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [completedBookings, setCompletedBookings] = useState([]);

  const fetchBookings = async () => {
    try {
      if (!currentUser) {
        return; // Exit early if currentUser is null
      }
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
    const getCategoryList = async () => {
      const categoriesCollectionRef = collection(db, 'categories');
      const data = await getDocs(categoriesCollectionRef);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCategoryList(filteredData);
    };
  
    getCategoryList();
  
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        setIsLoggedIn(true);
  
        // Fetch the user's profile image URL and image name from Firestore
        const imageUrl = await getProfileImage(user.uid);
        setProfileImageURL(imageUrl);
      } else {
        setIsLoggedIn(false);
        setProfileImageURL('');
        setProfileImageName('');
      }
    });
  
    return () => {
      unsubscribe();
    };
  }, [currentUser]); // Add currentUser as a dependency
  
  useEffect(() => {
    fetchBookings();
  }, [currentUser]); // Update the dependency to currentUser
  

  const handleManageBookings = () => {
    if (isLoggedIn) {
      navigation.navigate('BookingManagementScreen');
    } else {
      setTargetScreen('BookingManagementScreen');
      setLoginModalVisible(true);
    }
  };

  const handleNewListing = () => {
    if (isLoggedIn) {
      navigation.navigate('NewListingScreen');
    } else {
      setTargetScreen('NewListingScreen');
      setLoginModalVisible(true);
    }
  };

  const handleInbox = () => {
    if (isLoggedIn) {
      navigation.navigate('InboxScreen');
    } else {
      setTargetScreen('InboxScreen');
      setLoginModalVisible(true);
    }
  };

  const handleProfile = () => {
    navigation.navigate('ProfileScreen');
  };  

  const closeModal = () => {
    setLoginModalVisible(false);
    setTargetScreen('');
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
        <Text style={styles.bookingDuration}>For {formattedDuration}</Text>
      </TouchableOpacity>
    );
  };

  const StickFiguresImage = require('../images/favpng_sport-stick-figure.png');

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.heading}>Sports</Text>
        <TouchableOpacity onPress={handleProfile} style={styles.profileButton}>
          {isLoggedIn && profileImageURL ? (
            <Image source={{ uri: profileImageURL }} style={styles.profileImage} />
          ) : (
            <Icon name="person-circle" size={40} color="#FF385C" />
          )}
        </TouchableOpacity>
      </View>
      <View style={styles.categoryContainer}>
        {categoryList.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryButton}
            onPress={() => navigation.navigate('ListingsScreen', { category: category.title })}
          >
            <Text style={styles.categoryButtonText}>{category.title}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {/* Upcoming Bookings */}
      <Text style={styles.categoryUpcoming}>Upcoming Bookings</Text>
        <FlatList
          data={upcomingBookings}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={
          <View>
            <Text style={styles.subtext}>No upcoming bookings... yet.</Text>
            <Text style={styles.subtext}>Pick a sport above to book a class!</Text>
            <Image source={StickFiguresImage} style={styles.stickFigureImage}/>
          </View>
        }
        />
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleNewListing} style={styles.iconButton}>
          <Icon name="add-circle" size={50} color="#FF385C" />
          <Text style={styles.buttonText}>Be A Coach</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleInbox} style={styles.iconButton}>
          <Icon name="mail" size={50} color="#FF385C" />
          <Text style={styles.buttonText}>Chats</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleManageBookings} style={styles.iconButton}>
          <Icon name="calendar" size={50} color="#FF385C" />
          <Text style={styles.buttonText}>My Bookings</Text>
        </TouchableOpacity>
      </View>
      <Modal visible={isLoginModalVisible} onRequestClose={closeModal} animationType='slide'>
        <LoginScreen closeModal={closeModal} targetScreen={targetScreen} navigation={navigation} />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: 16,
  },
  heading: {
    fontSize: 30,
    fontWeight: 'bold',
    marginLeft: 5,
  },
  profileButton: {
    paddingHorizontal: 10,
  },
  profileImage: {
    width: 50,
    height: 50,
    borderRadius: 50,
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  categoryButton: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginVertical: 10,
    marginRight: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryButtonText: {
    fontSize: 17,
    marginLeft: 0,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    position: 'absolute',
    bottom: 35,
    left: -8,
    right: -8,
  },
  iconButton: {
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 14,
    marginTop: 5,
    textAlign: 'center',
    color: 'black',
    fontWeight: 'bold',
  },
  categoryUpcoming: {
    fontSize: 25,
    fontWeight: 'bold',
    marginLeft: 8,
    marginTop: 40,
    marginBottom: 8,
    color: "#FF385C",
  },
  subtext: {
    fontSize: 18,
    marginLeft: 9,
    marginTop: 5,
    fontWeight: '500',
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
  stickFigureImage: {
    width: 220,
    height: 220,
    tintColor: '#b5b3b3',
    marginTop: 60,
    marginLeft: 38,
  },
});

export default HomeScreen;