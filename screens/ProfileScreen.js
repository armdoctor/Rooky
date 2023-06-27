import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Image, FlatList } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { onAuthStateChanged, signOut, deleteUser } from 'firebase/auth';
import { auth, storage, db } from '../firebase/firebase';
import { doc, getDoc, query, collection, where, getDocs, onSnapshot } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import Icon from 'react-native-vector-icons/Ionicons';
import LoginScreen from './LoginScreen';
import { Card, Avatar } from 'react-native-elements';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoginModalVisible, setLoginModalVisible] = useState(false);
  const [targetScreen, setTargetScreen] = useState('');
  const [profileImageURL, setProfileImageURL] = useState('');
  const [profileImageName, setProfileImageName] = useState('');
  const [fullName, setFullName] = useState('');
  const [listingsData, setListingsData] = useState([]);
  const [listings, setListings] = useState([]);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsLoggedIn(true);
        fetchProfileImage(user.uid);
        fetchUserListings(user.uid);
      } else {
        setIsLoggedIn(false);
        setProfileImageURL('');
        setListings([]);
      }
    });

    return unsubscribe;
  }, []);

  const fetchProfileImage = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnapshot = await getDoc(userDocRef);

      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        const profileImageData = userData.profileImageURL;
        const fullName = userData.fullName; // Fetch the full name

        if (profileImageData) {
          const downloadURL = profileImageData.downloadURL;
          const imageName = profileImageData.imageName;
          const storagePath = `profileImages/${imageName}`;
          const storageRef = ref(storage, storagePath);
          const imageUrl = await getDownloadURL(storageRef);

          setProfileImageURL(imageUrl);
          setProfileImageName(imageName);
        } else {
          setProfileImageURL('');
          setProfileImageName('');
        }

        setFullName(fullName); // Set the full name in state
      }
    } catch (error) {
      setProfileImageURL('');
    }
  };

  const fetchUserListings = (userId) => {
    const listingsQuery = query(collection(db, 'listings'), where('user', '==', doc(db, 'users', userId)));
    
    const unsubscribe = onSnapshot(listingsQuery, (querySnapshot) => {
      const updatedListingsData = [];
      querySnapshot.forEach((doc) => {
        const listingData = doc.data();
        updatedListingsData.push(listingData);
      });
      setListingsData(updatedListingsData);
    });
  
    return unsubscribe;
  };
  
  useEffect(() => {
    const fetchData = async () => {
      const categoryPromises = listingsData.map(async (listingData) => {
        const categoryDocRef = listingData.category;
  
        let categoryTitle = '';
  
        if (categoryDocRef) {
          const categoryDocSnapshot = await getDoc(categoryDocRef);
          if (categoryDocSnapshot.exists()) {
            const categoryData = categoryDocSnapshot.data();
            categoryTitle = categoryData.title;
          }
        }
  
        return {
          ...listingData,
          categoryTitle,
        };
      });
  
      const updatedListings = await Promise.all(categoryPromises);
      setListings(updatedListings);
    };
  
    fetchData();
  }, [listingsData]);
  

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log('Logged out successfully');
        setIsLoggedIn(false);
        navigation.navigate('HomeScreen');
      })
      .catch((error) => {
        console.log('Logout error:', error);
      });
  };

  const handleLogin = () => {
    if (isLoggedIn) {
      handleLogout();
    } else {
      setTargetScreen('HomeScreen');
      setLoginModalVisible(true);
    }
  };

  const handleDeleteAccount = () => {
    setDeleteModalVisible(true);
  };  

  const handleConfirmDeletion = () => {
    setDeleteConfirmation(true);
    setDeleteModalVisible(false);
  };
  
  useEffect(() => {
    if (deleteConfirmation) {
      const user = auth.currentUser;
  
      deleteUser(user)
        .then(() => {
          console.log('Account deleted successfully');
          setIsLoggedIn(false);
          navigation.navigate('HomeScreen');
        })
        .catch((error) => {
          console.log('Account deletion error:', error);
        });
    }
  }, [deleteConfirmation]);
  
  const handleCancelDeletion = () => {
    setDeleteConfirmation(false);
    setDeleteModalVisible(false);
  };
  

  const closeModal = () => {
    setLoginModalVisible(false);
    setTargetScreen('');
  };

  const renderListing = ({ item }) => {
    const handleListingPress = () => {
      // Navigate to the ListScreen with the listing item
      navigation.navigate('ListScreen', { 
        name: item.name,
        price: item.price,
        description: item.description,
        userId: auth.currentUser.uid,
        listingId: item.listingId,
      });
    };
  
    return (
      <TouchableOpacity onPress={handleListingPress}>
        <View style={styles.listingContainer}>
          <Card containerStyle={styles.cardContainer}>
            <View style={styles.listingDetails}>
              {item.categoryTitle ? (
                <Text style={styles.listingPrice}>{item.categoryTitle}</Text>
              ) : null}
              <Text style={styles.listingPrice}>${item.price}/hr</Text>
            </View>
            <Text style={styles.category}>{item.description}</Text>
          </Card>
        </View>
      </TouchableOpacity>
    );
  };    

  const handleBackButtonPress = () => {
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity style={styles.backButton} onPress={handleBackButtonPress}>
        <Icon name="arrow-back" size={25} color="#FF385C" />
      </TouchableOpacity>
      {isLoggedIn ? (
        <>
          <View style={styles.profileContainer}>
          <Text style={styles.fullName}>{fullName}</Text>
            {profileImageURL ? (
              <Avatar rounded source={{ uri: profileImageURL }} size={120} />
            ) : (
              <Icon name="person-circle" size={100} color="#FF385C" />
            )}
          </View>
          <Text style={styles.listingsHeader}>Listings</Text>
          {listings.length > 0 ? (
            <FlatList
              data={listings}
              keyExtractor={(item) => item.listingId}
              renderItem={renderListing}
              contentContainerStyle={styles.listingsContainer}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <Text style={styles.noListingsText}>No listings available.</Text>
          )}
          <View style={styles.logoutContainer}>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleDeleteAccount} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Delete Account</Text>
          </TouchableOpacity>
          </View>
        </>
      ) : (
        <TouchableOpacity onPress={handleLogin} style={styles.loginButton}>
          <Text style={styles.loginText}>Sign In</Text>
        </TouchableOpacity>
      )}
      <Modal visible={isDeleteModalVisible} onRequestClose={handleCancelDeletion} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalText}>Are you sure you want to delete your account?</Text>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity onPress={handleConfirmDeletion} style={[styles.modalButton, styles.confirmButton]}>
              <Text style={styles.modalButtonText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleCancelDeletion} style={[styles.modalButton, styles.cancelButton]}>
              <Text style={styles.modalButtonText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={isLoginModalVisible} onRequestClose={closeModal} animationType="slide">
        <LoginScreen closeModal={closeModal} targetScreen={targetScreen} navigation={navigation} />
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backButton: {
    position: 'absolute',
    top: 56,
    left: 16,
    zIndex: 1,
  },
  profileContainer: {
    alignItems: 'center',
    paddingTop: 70,
    marginBottom: 20,
  },
  fullName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: -30,
    marginBottom: 20
  },
  listingsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginLeft: 32,
  },
  listingsContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listingContainer: {
    marginBottom: 16,
  },
  cardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  listingImage: {
    height: 200,
    resizeMode: 'cover',
  },
  listingDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  category: {
    color: 'gray',
  },
  listingPrice: {
    fontWeight: 'bold',
    marginBottom: 10,
    fontSize: 18,
  },
  listingTitle: {
    marginTop: 8,
    fontWeight: 'bold',
    fontSize: 16,
  },
  noListingsText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: 'gray',
  },
  logoutButton: {
    backgroundColor: '#FF385C',
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  logoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  logoutContainer: {
    paddingBottom: 30,
    alignItems: 'center',
  },
  loginButton: {
    backgroundColor: '#FF385C',
    padding: 12,
    borderRadius: 8,
    marginTop: 60,
    marginHorizontal: 16,
    alignItems: 'center',
  },
  loginText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    color: 'black',
  },
  modalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginHorizontal: 10,
  },
  confirmButton: {
    backgroundColor: '#FF385C',
  },
  cancelButton: {
    backgroundColor: 'gray',
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },  
});

export default ProfileScreen;