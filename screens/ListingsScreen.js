import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import ListCard from '../components/ListCard';
import { db } from '../firebase/firebase';
import { collection, query, where, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const fetchListings = async (category, setListings) => {
  try {
    const listingsCollectionRef = collection(db, 'listings');
    const categoriesCollectionRef = collection(db, 'categories');
    const categoryDocRef = doc(categoriesCollectionRef, category);
    const categoryDoc = await getDoc(categoryDocRef);

    if (categoryDoc.exists()) {
      const categoryListingsQuery = query(listingsCollectionRef, where('category', '==', categoryDocRef));
      const unsubscribe = onSnapshot(categoryListingsQuery, (snapshot) => {
        const categoryListingsData = snapshot.docs.map(async (doc) => {
          const listingData = doc.data();
          const userRef = doc.data().user;
          const userDoc = await getDoc(userRef);
          const userData = userDoc.data();
          return {
            ...listingData,
            id: doc.id,
            userId: userData.userId,
            fullName: userData.fullName,
          };
        });

        Promise.all(categoryListingsData).then((listingsData) => {
          setListings(listingsData);
        });
      });

      return unsubscribe;
    }
  } catch (error) {
    console.error('Error fetching listings:', error);
  }
};

const ListingsScreen = ({ route }) => {
  const navigation = useNavigation();
  const { category } = route.params;
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const unsubscribe = fetchListings(category, setListings);
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [category]);

  useEffect(() => {
    // Fetch the listings again whenever the route parameters change
    const unsubscribe = fetchListings(category, setListings);
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [route.params]);

  const getCategoryTitle = (category) => {
    return category.charAt(0).toUpperCase() + category.slice(1) + " Coaches";
  };

  const handleBackButtonPress = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackButtonPress}>
          <Ionicons name="arrow-back" size={25} color="#FF385C" />
        </TouchableOpacity>
        <Text style={styles.heading}>{getCategoryTitle(category)}</Text>
      </View>
      <ScrollView style={styles.listingsContainer}>
        {listings.map((listing) => (
          <ListCard
            key={listing.id}
            name={listing.fullName}
            price={listing.price}
            description={listing.description}
            userId={listing.userId}
            listingId={listing.id}
            navigation={navigation}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
    marginTop: 20,
  },
  backButton: {
    marginRight: 0,
    padding: 8,
  },
  heading: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  listingsContainer: {
    flex: 1,
    marginBottom: 20,
  },
});

export default ListingsScreen;