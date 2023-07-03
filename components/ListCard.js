import { StyleSheet, Text, TouchableOpacity, View, Image, Dimensions } from 'react-native';
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

const screenWidth = Dimensions.get('window').width;

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
          <View style={styles.imageContainer}>
            {listingImageUrl ? (
              <Image source={{ uri: listingImageUrl }} style={styles.profileImage} />
            ) : null}
          </View>
          <View style={styles.detailsContainer}>
            <Text style={styles.headerStyle}>{name}</Text>
            <Text style={styles.subheaderStyle}>${price}/hr</Text>
            <CustomRating averageRating={averageRating} />
          </View>
        </Card>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    width: '90%', // Adjust the width to your desired value
    borderRadius: 10,
    backgroundColor: '#fff', // Adjust the background color to match the color scheme
  },
  imageContainer: {
    marginRight: 10,
    alignItems: 'center',
  },
  detailsContainer: {
    flex: 1,
  },
  headerStyle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 7,
    marginTop: 10,
    color: '#333', // Adjust the text color to match the color scheme
  },
  subheaderStyle: {
    fontSize: 20,
    marginBottom: 3,
    color: '#888', // Adjust the text color to match the color scheme
  },
  ratingContainer: {
    flexDirection: 'row',
    marginTop: 6,
    marginBottom: 5,
  },
  starContainer: {
    marginRight: 5,
  },
  profileImage: {
    width: 300,
    height: 230,
    borderRadius: 15,
  },
});

export default ListCard;
