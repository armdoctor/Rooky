import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, ScrollView, Image, SafeAreaView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { collection, doc, addDoc, getDocs, updateDoc, query, where } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { uploadImageAsync } from '../helpers/ListingImageUploader';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';

const NewListingScreen = () => {
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [listingImageURL, setListingImageURL] = useState('');
  const [userListings, setUserListings] = useState([]);

  const navigation = useNavigation();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const categoriesCollectionRef = collection(db, 'categories');
      const categoriesSnapshot = await getDocs(categoriesCollectionRef);
      const categoriesData = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCategories(categoriesData);

      const user = auth.currentUser;
      const userListingCollectionRef = collection(db, 'listings');
      const userListingSnapshot = await getDocs(query(userListingCollectionRef, where('user', '==', doc(db, 'users', user.uid))));
      const userListingsData = userListingSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setUserListings(userListingsData);
    } catch (error) {
      console.error('Error fetching categories and user listings:', error);
    }
  };

  const handlePublishListing = async () => {
    try {
      const user = auth.currentUser;
      const userListingInCategory = userListings.find((listing) => listing.category.id === selectedCategory);

      if (userListingInCategory) {
        console.log('User already has a listing in the selected category');
        return;
      }

      const categoryRef = doc(db, 'categories', selectedCategory);
      let imageURL = listingImageURL; // Use the existing URL if available

      if (selectedImage) {
        const compressedImage = await compressImage(selectedImage.uri);
        imageURL = await uploadImageAsync(compressedImage.uri);
        console.log('Listing image uploaded successfully. URL:', imageURL);
      }

      const listingData = {
        price: parseFloat(price),
        description,
        category: categoryRef,
        user: doc(db, 'users', user.uid),
        image: imageURL,
      };

      const listingRef = await addDoc(collection(db, 'listings'), listingData);
      const listingId = listingRef.id;

      await updateDoc(doc(db, 'listings', listingId), { listingId });

      console.log('Listing published with ID:', listingId);

      navigation.navigate('HomeScreen');
    } catch (error) {
      console.error('Error publishing listing:', error);
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
        const selectedAsset = result.assets[0];
        setSelectedImage(selectedAsset);
      }
    } catch (error) {
      console.error('ImagePicker error:', error);
    }
  };

  const handleBackButtonPress = () => {
    navigation.goBack();
  };

  const compressImage = async (uri) => {
    const manipulatorResult = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 500, height: 500 } }],
      { compress: 0.5, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipulatorResult;
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding" keyboardVerticalOffset={50}>
      <SafeAreaView>
        <TouchableOpacity style={styles.backButton} onPress={handleBackButtonPress}>
          <Ionicons name="arrow-back" size={25} color="#FF385C" marginBottom={-30} marginLeft={8} />
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Text style={styles.heading}>Create a New Listing</Text>
          <TouchableOpacity onPress={handleSelectImage} style={styles.imagePicker}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage.uri }} style={styles.selectedImage} />
            ) : (
              <View style={styles.buttonSelect}>
              <Text style={styles.imagePickerText}>Select Listing Image</Text>
              </View>
            )}
          </TouchableOpacity>
          <View style={styles.formContainer}>
            <Picker
              selectedValue={selectedCategory}
              onValueChange={(itemValue) => setSelectedCategory(itemValue)}
              style={styles.picker}
            >
              <Picker.Item label="Select Category" value="" />
              {categories.map((category) => (
                <Picker.Item key={category.id} label={category.title} value={category.title} />
              ))}
            </Picker>
            <TextInput
              placeholder="Price"
              value={price}
              onChangeText={(text) => setPrice(text)}
              style={styles.input}
              keyboardType="decimal-pad"
            />
            <TextInput
              placeholder="Description"
              value={description}
              onChangeText={(text) => setDescription(text)}
              style={[styles.input, styles.descriptionInput]}
              multiline
            />
          </View>
          <TouchableOpacity onPress={handlePublishListing} style={styles.button}>
            <Text style={styles.buttonText}>Publish Listing</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  backButton: {
    position: 'absolute',
    top: 25,
    left: -8,
    zIndex: 1,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
    textAlign: 'center',
  },
  imagePicker: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  imagePickerText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 0,
  },
  selectedImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  formContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  picker: {
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 15,
    paddingVertical: 0,
    borderRadius: 10,
    marginTop: 0,
    width: '100%',
  },
  input: {
    backgroundColor: '#F2F2F2',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginTop: 20,
    width: '100%',
  },
  descriptionInput: {
    height: 200,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: '#FF385C',
    borderRadius: 10,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 60,
    marginBottom: 0,
  },
  buttonSelect: {
    backgroundColor: '#FF385C',
    borderRadius: 10,
    paddingVertical: 5,
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 15,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
});

export default NewListingScreen;
