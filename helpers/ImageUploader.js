import { storage } from '../firebase/firebase';
import { uploadBytes, ref, getDownloadURL } from 'firebase/storage';
import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';

const uploadImageAsync = async (uri) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
  
      const imageName = uuidv4(); // Generate a random string for the image name
      const storageRef = ref(storage, 'profileImages/' + imageName);
      await uploadBytes(storageRef, blob, 'data_url');
  
      const downloadURL = await getDownloadURL(storageRef);
      return { downloadURL, imageName };
    } catch (error) {
      console.error('Image upload error:', error);
      throw error;
    }
  };  

export { storage, uploadImageAsync };