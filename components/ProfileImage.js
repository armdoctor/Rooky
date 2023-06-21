import { doc, getDoc } from 'firebase/firestore';
import { ref, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/firebase';

const getProfileImage = async (userId) => {
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

        return imageUrl;
      } else {
        return null;
      }
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
};

export default getProfileImage;