import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Image,
  SafeAreaView,
  TextInput,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { ref, getDownloadURL } from 'firebase/storage';
import { collection, doc, getDocs, query, where, serverTimestamp, addDoc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth, storage } from '../firebase/firebase';
import LoginScreen from './LoginScreen';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { uploadImageAsync } from '../helpers/ListingImageUploader';
import { Ionicons } from '@expo/vector-icons';
import CreateClass from '../components/CreateClass';
import ClassCard from '../components/ClassCard';

const CustomRating = ({ averageRating }) => {
  return (
    <View style={styles.ratingContainer}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Ionicons
          key={star}
          name={star <= averageRating ? 'star' : 'star-outline'}
          size={20}
          color={star <= averageRating ? '#FFD700' : '#ccc'}
          style={styles.starContainer}
        />
      ))}
    </View>
  );
};

const ListScreen = ({ route, navigation }) => {
  const { name, price: initialPrice, description: initialDescription, userId, listingId } = route.params;
  const [reviews, setReviews] = useState([]);
  const [classesTaught, setClassesTaught] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [reviewsCounter, setReviewsCounter] = useState(0);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [targetScreen, setTargetScreen] = useState('');
  const [averageRating, setAverageRating] = useState(0);
  const [listingImageURL, setListingImageURL] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [price, setPrice] = useState(initialPrice);
  const [description, setDescription] = useState(initialDescription);
  const [editedImage, setEditedImage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showGroupClassModal, setShowGroupClassModal] = useState(false);
  const [classData, setClassData] = useState(null); // State to store class data

  useEffect(() => {
    fetchReviews();
    fetchListingImage();
    if (userId) {
      countClassesTaught();
    }
  }, [userId]);

  useEffect(() => {
    fetchClassData(); // Fetch class data when the component mounts
  }, []);  

  const fetchClassData = async () => {
    try {
      const classQuery = query(collection(db, 'classes'), where('listingId', '==', listingId));
      const classDocsSnapshot = await getDocs(classQuery);
      console.log('Class Docs Snapshot:', classDocsSnapshot.docs);
      if (!classDocsSnapshot.empty) {
        const classData = classDocsSnapshot.docs[0].data();
        console.log('Class Document Snapshot:', classData);
        setClassData(classData); // Set the class data state
      } else {
        console.log('Class Document does not exist');
        setClassData(null); // Set classData to null when the document doesn't exist
      }
    } catch (error) {
      console.error('Error fetching class data:', error);
      setClassData(null); // Set classData to null in case of an error
    }
  };  

  const fetchReviews = async () => {
    try {
      const reviewsQuery = query(collection(db, 'reviews'), where('listingId', '==', listingId));
      const reviewsSnapshot = await getDocs(reviewsQuery);
      const reviewsData = [];

      let totalRating = 0;
      let count = 0; // total review documents
      let counter = 0; // non-empty reviewText review documents

      for (const doc of reviewsSnapshot.docs) {
        const reviewData = doc.data();
        const userId = reviewData.reviewerId;

        // Fetch the user document based on the userId
        const userQuery = query(collection(db, 'users'), where('userId', '==', userId));
        const userSnapshot = await getDocs(userQuery);
        const userDoc = userSnapshot.docs[0];
        const userFullName = userDoc.data().fullName;

        // Format the createdAt date
        const createdAt = new Date(reviewData.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });

        // Add the review text, reviewer's full name, and createdAt date to the reviewsData array
        reviewsData.push({
          reviewText: reviewData.reviewText,
          fullName: userFullName,
          createdAt: createdAt,
          rating: reviewData.rating,
        });

        // Add the rating to the totalRating
        totalRating += reviewData.rating;
        count++;
        if (reviewData.reviewText !== '') {
          counter++;
        }
      }

      setReviewsCounter(counter);
      setReviewsCount(count);
      setReviews(reviewsData);

      // Calculate the average rating
      const averageRating = count > 0 ? totalRating / count : 0;
      // Round the average rating to the nearest one decimal point
      const roundedRating = Math.round(averageRating * 10) / 10;
      setAverageRating(roundedRating); // Set the average rating state
      setLoading(false);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    }
  };

  const countClassesTaught = async () => {
    try {
      const classesTaughtQuery = query(
        collection(db, 'bookingSuggestions'),
        where('createdBy', '==', listingOwner),
        where('completed', '==', true)
      );
      const classesTaughtSnapshot = await getDocs(classesTaughtQuery);
      const classesTaughtCount = classesTaughtSnapshot.size;
      setClassesTaught(classesTaughtCount);
    } catch (error) {
      console.error('Error counting classes taught:', error);
    }
  };

  const fetchListingImage = async () => {
    try {
      const listingDocRef = doc(db, 'listings', listingId);
      const listingDocSnapshot = await getDoc(listingDocRef);
      console.log('Listing Document Snapshot:', listingDocSnapshot);
      if (listingDocSnapshot.exists()) {
        const listingData = listingDocSnapshot.data();
        const imageData = listingData.image;
        if (imageData) {
          const imageName = imageData.imageName;
          const storagePath = `listingImages/${imageName}`;
          const storageRef = ref(storage, storagePath);
          const imageUrl = await getDownloadURL(storageRef);
          console.log('Listing Image URL:', imageUrl);
          setListingImageURL(imageUrl);
        } else {
          console.log('Listing Image Data not available');
          // Set a default image URL if the listing image is not available
          setListingImageURL(''); // Replace with your default image URL
        }
      } else {
        console.log('Listing Document does not exist');
      }
    } catch (error) {
      console.error('Error fetching listing image:', error);
      // Set a default image URL in case of an error
      setListingImageURL(''); // Replace with your default image URL
    }
  };

  const currentUser = auth.currentUser;
  const listingOwner = userId;
  const isListingOwner = currentUser && currentUser.uid === listingOwner;

  const handleBooking = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setShowLoginModal(true);
        return;
      }
      const currentUserID = currentUser.uid;
      const currentUserDocRef = doc(db, 'users', currentUserID);
      const userDocRef = doc(db, 'users', listingOwner);

      const chatQuery = query(
        collection(db, 'chats'),
        where('user_creator', 'in', [currentUserDocRef, userDocRef]),
        where('user_receiver', 'in', [currentUserDocRef, userDocRef])
      );
      const chatSnapshot = await getDocs(chatQuery);
      const existingChat = chatSnapshot.docs[0];

      let chatId;
      if (existingChat) {
        chatId = existingChat.id;
      } else {
        const chatData = {
          user_creator: currentUserDocRef,
          user_receiver: userDocRef,
          messages: [],
          createdAt: serverTimestamp(),
        };

        const newChatRef = await addDoc(collection(db, 'chats'), chatData);
        chatId = newChatRef.id;
      }

      navigation.navigate('Chat', { chatId });
    } catch (error) {
      console.error('Error creating or fetching chat:', error);
    }
  };

  const handleEditListing = () => {
    setShowEditModal(true);
  };

  const handleCancelEdit = () => {
    setShowEditModal(false);
  };

  const handleSaveEdit = async () => {
    try {
      console.log('Saving listing edits...');
      const listingDocRef = doc(db, 'listings', listingId);
      const listingData = {
        price,
        description,
      };
      console.log('Price and description:', listingData);
  
      // Update the price and description in the listings document
      await updateDoc(listingDocRef, listingData);
      console.log('Price and description updated');
  
      // Update the image if edited
      if (editedImage) {
        console.log('Compressing image...');
        const compressedImage = await compressImage(editedImage.uri);
        console.log('Image compressed:', compressedImage);
  
        console.log('Uploading image...');
        try {
          const { downloadURL, imageName } = await uploadImageAsync(compressedImage.uri);
          setEditedImage(null); // Reset the editedImage state to null immediately after upload
          console.log('Image uploaded:', imageName, downloadURL);
          // Update the listing document with the new image URL and name
          const listingDataWithImage = {
            ...listingData,
            image: {
              imageName,
              downloadURL,
            },
          };
          await updateDoc(listingDocRef, listingDataWithImage);
          console.log('Listing image updated:', listingDataWithImage);
          console.log('editedImage state:', editedImage); // Log the value of the editedImage state
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError);
        }
      } else {
        console.log('No image to upload');
      }
  
      // Fetch the updated listing image
      await fetchListingImage();
      console.log('Listing image fetched:', listingImageURL);
  
      setShowEditModal(false); // Close the modal
    } catch (error) {
      console.error('Error saving listing edits:', error);
    }
  };

  const compressImage = async (imageUri) => {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: 800 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      return manipResult;
    } catch (error) {
      console.error('Error compressing image:', error);
      return { uri: imageUri }; // Return the original image URI if compression fails
    }
  };

  const handleSelectImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access media library was denied.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled) {
        setEditedImage(result.assets[0]);
      } else {
        setEditedImage(null); // Reset the editedImage state when the image selection is cancelled
      }
    } catch (error) {
      console.error('ImagePicker error:', error);
    }
  };

  const handleBackButtonPress = () => {
    navigation.goBack();
  };

  const handleDeleteListing = async () => {
    try {
      const listingDocRef = doc(db, 'listings', listingId);
      await deleteDoc(listingDocRef);
      console.log('Listing deleted successfully');
      navigation.goBack(); // Navigate back after deleting the listing
    } catch (error) {
      console.error('Error deleting listing:', error);
    }
  };

  const handleDeleteButtonPress = () => {
    setShowDeleteModal(true);
  };
  
  const handleCancelDelete = () => {
    setShowDeleteModal(false);
  };

  const handleConfirmDelete = () => {
    setShowDeleteModal(false);
    handleDeleteListing();
  };

  const openCreateClassModal = () => {
    setShowCreateClassModal(true);
  };
  
  const closeCreateClassModal = () => {
    setShowCreateClassModal(false);
  };  
  const openGroupClassModal = () => {
    setShowGroupClassModal(true);
  };
  
  const closeGroupClassModal = () => {
    setShowGroupClassModal(false);
  };  

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBackButtonPress}>
        <Ionicons name="arrow-back" size={25} color="#FF385C" marginBottom={-10} marginLeft={10} />
      </TouchableOpacity>
      {isListingOwner && (
      <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteButtonPress}>
        <Ionicons name="trash-bin" size={25} color="#FF385C" />
      </TouchableOpacity>
      )}
      <ScrollView>
        <View style={styles.imageContainer}>
          {listingImageURL ? (
            <Image source={{ uri: listingImageURL }} style={styles.listingImage} />
          ) : null}
        </View>
        <Text style={styles.name}>{name}</Text>
        {loading ? (
          <Text style={styles.loadingText}>Counting classes taught...</Text>
        ) : (
          <Text style={styles.classesTaught}>{classesTaught} Classes Taught</Text>
        )}
        <CustomRating averageRating={averageRating} />
        <Text style={styles.price}>${price}/hr</Text>
        <View>
          <Text style={styles.reviewsHeading}>Description:</Text>
          <Text style={styles.description}>{description}</Text>
        </View>

        <View style={styles.reviewsContainer}>
          <Text style={styles.reviewsHeading}>Reviews: {reviewsCounter}</Text>
          {reviews
            .filter((review) => review.reviewText) // Filter out reviews with empty reviewText
            .map((review, index) => (
              <View key={index} style={styles.reviewCard}>
                <Text style={styles.reviewText}>{review.reviewText}</Text>
                <Text style={styles.reviewerName}>{review.createdAt}</Text>
                <Text style={styles.reviewerName}>{review.fullName}</Text>
              </View>
            ))}

          {reviews.filter((review) => review.reviewText).length === 0 && (
            <Text style={styles.noReviewsText}>This Listing Has No Reviews Yet</Text>
          )}
        </View>
      </ScrollView>
      {!(auth.currentUser && auth.currentUser.uid === userId) && (
        <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={openGroupClassModal}>
          <Text style={styles.buttonText}>Group Class</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleBooking}>
          <Text style={styles.buttonText}>Private Class</Text>
        </TouchableOpacity>
      </View>
      )}
      <Modal visible={showLoginModal} animationType="slide">
        <LoginScreen
          closeModal={() => setShowLoginModal(false)}
          targetScreen={targetScreen}
          navigation={navigation}
        />
      </Modal>
      {isListingOwner && (
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={handleEditListing}>
          <Text style={styles.buttonText}>Edit Listing</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={openCreateClassModal}>
          <Text style={styles.buttonText}>New Class</Text>
        </TouchableOpacity>
      </View>
    )}

      <Modal visible={showEditModal} animationType="slide">
        <KeyboardAvoidingView
          style={styles.editModalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust behavior based on platform
        >
        <SafeAreaView style={styles.editModalContainer}>
        <ScrollView>
          <Text style={styles.editModalTitle}>Edit Listing</Text>

          <Text style={styles.editModalLabel}>Price:</Text>
          <TextInput
            style={styles.editModalInput}
            value={price}
            onChangeText={setPrice}
            keyboardType="numeric"
          />

          <Text style={styles.editModalLabel}>Description:</Text>
          <TextInput
            style={styles.editModalInput}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <Text style={styles.editModalLabel}>Image:</Text>
          <TouchableOpacity style={styles.editModalImageContainer} onPress={handleSelectImage}>
            {editedImage ? (
              <Image source={{ uri: editedImage.uri }} style={styles.editModalImage} />
            ) : (
              <Text style={styles.editModalImagePlaceholder}>Select Image</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={handleSaveEdit}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.editModalCancelButton} onPress={handleCancelEdit}>
            <Text style={styles.buttonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>  
        </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
      {/* Delete Confirmation Modal */}
    <Modal visible={showDeleteModal} animationType="slide">
      <View style={styles.deleteModalContainer}>
        <Text style={styles.deleteModalText}>Are you sure you want to delete this listing?</Text>
        <TouchableOpacity style={styles.deleteModalButton} onPress={handleConfirmDelete}>
          <Text style={styles.deleteModalButtonText}>Delete</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.cancelDeleteModalButton} onPress={handleCancelDelete}>
          <Text style={styles.deleteModalButtonText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </Modal>
    <Modal visible={showCreateClassModal} animationType="slide">
      <CreateClass closeModal={closeCreateClassModal} listingId={listingId} />
    </Modal>
    <Modal visible={showGroupClassModal} animationType="slide">
    <SafeAreaView>
    {classData && (
      <ClassCard 
        closeModal={closeGroupClassModal} 
        listingId={listingId} 
        className={classData.className}
        classPrice={classData.classPrice}
        classDescription={classData.classDescription}
        classStart={classData.startDateTime}
        classEnd={classData.endDateTime}
      />
    )}
    </SafeAreaView>
    </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingRight: 20,
    paddingLeft: 20,
  },
  editModalContainer: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 40 : 0,
    padding: 20,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  editModalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: -5,
    marginBottom: 20,
    marginLeft: 20,
    color: '#333',
  },
  editModalLabel: {
    fontSize: 18,
    marginBottom: 10,
    marginLeft: 22,
    margin: 5,
    color: '#333',
  },
  editModalInput: {
    fontSize: 16,
    marginBottom: 20,
    marginHorizontal: 20,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  editModalImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  editModalImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  editModalImagePlaceholder: {
    fontSize: 18,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  editModalCancelButton: {
    backgroundColor: '#ccc',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 15,
    marginHorizontal: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -10,
    marginTop: 6,
    paddingHorizontal: 0,
  },
  button: {
    flex: 1,
    backgroundColor: '#FF385C',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    marginBottom: 15,
    marginHorizontal: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  imageContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 15,
    paddingTop: 15,
  },
  listingImage: {
    width: 280,
    height: 220,
    borderRadius: 10,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 5,
    marginBottom: 10,
    marginLeft: 15,
  },
  classesTaught: {
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
    marginLeft: 15,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    marginLeft: 15,
  },
  starContainer: {
    marginRight: 5,
  },
  price: {
    fontSize: 18,
    marginBottom: 20,
    marginLeft: 15,
  },
  description: {
    fontSize: 16,
    marginBottom: 0,
    marginTop: 10,
    lineHeight: 24,
    marginLeft: 15,
  },
  reviewsContainer: {
    marginTop: 20,
    paddingBottom: 20,
  },
  reviewsHeading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 0,
    marginLeft: 15,
  },
  reviewCard: {
    marginBottom: 0,
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  reviewText: {
    fontSize: 16,
    marginBottom: 5,
  },
  reviewerName: {
    fontSize: 14,
    color: '#888',
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 10,
  },
  noReviewsText: {
    marginRight: 5,
    marginTop: 40,
    fontSize: 16,
    alignSelf: 'center',
  },
  deleteButton: {
    position: 'absolute',
    top: 46,
    right: 20,
  },
  deleteModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  deleteModalText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  deleteModalButton: {
    backgroundColor: '#1B998B',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 15,
  },
  cancelDeleteModalButton: {
    backgroundColor: '#FF385C',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 15,
  },
  deleteModalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ListScreen;