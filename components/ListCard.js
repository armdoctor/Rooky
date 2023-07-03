import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Card, Icon } from 'react-native-elements';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, storage } from '../firebase/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL, getMetadata } from 'firebase/storage';

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

const fetchListingImage = async (imageName) => {
  try {
    const storagePath = `listingImages/${imageName}`;
    const storageRef = ref(storage, storagePath);
    const imageUrl = await getDownloadURL(storageRef);
    return imageUrl;
  } catch (error) {
    console.error('Error fetching listing image:', error);
    return null;
  }
};

const ListCard = ({
  navigation,
  name,
  rating,
  price,
  description,
  userId,
  listingId,
  imageName,
}) => {
  const [averageRating, setAverageRating] = useState(0);
  const [listingImageUrl, setListingImageUrl] = useState('');

  useEffect(() => {
    fetchAverageRating();
    fetchListingImage(listingId);
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

  const fetchListingImage = async (listingId) => {
    try {
      const listingDocRef = doc(db, 'listings', listingId);
      const listingDocSnapshot = await getDoc(listingDocRef);
      if (listingDocSnapshot.exists()) {
        const listingData = listingDocSnapshot.data();
        const imageName = listingData.image.imageName;
        console.log('Image Name:', imageName);
        const downloadURL = await getListingImageUrl(imageName);
        console.log('Download URL:', downloadURL);
        setListingImageUrl(downloadURL);
      } else {
        // Handle the case when the listing document doesn't exist
      }
    } catch (error) {
      console.error('Error fetching listing image:', error);
    }
  };  
  
  
  const getListingImageUrl = async (imageName) => {
    try {
      const storageRef = ref(storage, `listingImages/${imageName}`);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
    } catch (error) {
      console.error('Error fetching listing image:', error);
      return ''; // Return a default image URL or handle the error as desired
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
        <Card containerStyle={styles.cardContainer}>
          <View style={styles.cardContent}>
            {listingImageUrl ? (
              <Image source={{ uri: listingImageUrl }} style={styles.profileImage} />
            ) : null}
            <View style={styles.cardTextContainer}>
              <Text style={styles.headerStyle}>{name}</Text>
              <CustomRating averageRating={averageRating} />
              <Text style={styles.subheaderStyle}>${price}/hr</Text>
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  cardContainer: {
    borderRadius: 10,
    padding: 10,
    height: 120,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTextContainer: {
    flex: 1,
    marginLeft: 15,
    paddingTop: 7,
  },
  headerStyle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  subheaderStyle: {
    fontSize: 15,
    fontWeight: 'normal',
    color: '#888',
    marginTop: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  starContainer: {
    marginRight: 3,
  },
  profileImage: {
    width: 75,
    height: 75,
    borderRadius: 100,
    marginTop: 5,
    marginLeft: 10,
  },
});

export default ListCard;