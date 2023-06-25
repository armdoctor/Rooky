import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Card, Icon } from 'react-native-elements';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, storage } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';

const CustomRating = ({ averageRating }) => {
  return (
    <View style={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Icon
          key={star}
          name={star <= averageRating ? 'star' : 'star-o'}
          type="font-awesome"
          color={star <= averageRating ? '#FFD700' : '#ccc'}
          size={20}
          containerStyle={styles.starContainer}
        />
      ))}
    </View>
  );
};

const ListCard = ({
  navigation,
  name,
  rating,
  price,
  description,
  userId,
  listingId,
}) => {
  const [averageRating, setAverageRating] = useState(0);
  const [profileImageURL, setProfileImageURL] = useState('');

  useEffect(() => {
    fetchAverageRating();
    fetchProfileImage(userId);
  }, []);

  const fetchAverageRating = async () => {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('listingId', '==', listingId)
      );
      const reviewsSnapshot = await getDocs(reviewsQuery);

      let totalRating = 0;
      let count = 0;

      for (const doc of reviewsSnapshot.docs) {
        const reviewData = doc.data();
        totalRating += reviewData.rating;
        count++;
      }

      const averageRating = count > 0 ? totalRating / count : 0;
      const roundedRating = Math.round(averageRating * 10) / 10;
      setAverageRating(roundedRating);
    } catch (error) {
      console.error('Error fetching average rating:', error);
    }
  };

  const fetchProfileImage = async (userId) => {
    try {
      const userDocRef = doc(db, 'users', userId);
      const userDocSnapshot = await getDoc(userDocRef);
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        const profileImageData = userData.profileImageURL;
        if (profileImageData) {
          const downloadURL = profileImageData.downloadURL;
          const imageName = profileImageData.imageName;
          const storagePath = `profileImages/${imageName}`;
          const storageRef = ref(storage, storagePath);
          const imageUrl = await getDownloadURL(storageRef);
  
          setProfileImageURL(imageUrl);
        } else {
          // Set a default image URL if the profile image is not available
          setProfileImageURL(''); // Replace with your default image URL
        }
      }
    } catch (error) {
      // Set a default image URL in case of an error
      setProfileImageURL(''); // Replace with your default image URL
    }
  };
  

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('ListScreen', {
            name,
            rating,
            price,
            description,
            userId,
            listingId,
            averageRating,
          })
        }
      >
       <Card containerStyle={{ borderRadius: 10, height: 107 }}>
  {profileImageURL ? (
    <Image
      source={{ uri: profileImageURL }}
      style={styles.profileImage}
    />
  ) : null}
  <Text style={styles.headerStyle}>{name}</Text>
  <CustomRating averageRating={averageRating} />
  <Text style={styles.subheaderStyle}>${price}/hr</Text>
</Card>

      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  headerStyle: {
    marginLeft: 100,
    marginTop: -75,
    fontSize: 20,
    fontWeight: 'bold',
  },
  subheaderStyle: {
    marginLeft: 100,
    marginTop: 5,
    fontSize: 16,
    fontWeight: 'normal',
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 6,
    marginLeft: 100,
    marginBottom: 5,
  },
  starContainer: {
    marginRight: 5,
  },
  profileImage: {
    width: 75,
    height: 75,
    borderRadius: 100,
    marginTop: 0,
    marginLeft: 8,
  },
});

export default ListCard;