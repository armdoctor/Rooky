import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Modal, SafeAreaView, ScrollView } from 'react-native';
import { collection, doc, onSnapshot, updateDoc, addDoc, query, where, getDocs, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';


const ChatScreen = ({ route }) => {
  const { chatId } = route.params;
  const currentUser = auth.currentUser;
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [bookingDetails, setBookingDetails] = useState({
    numberOfStudents: '',
    location: '',
    classStart: new Date(),
    classEnd: new Date(),
    selectedCategory: '' // New state for selected category
  });
  const [categories, setCategories] = useState([]); // State for categories
  const [unsubscribe, setUnsubscribe] = useState(() => () => {}); // Initialize with an empty function
  
  // Fetch the categories associated with the coach's listings
  useEffect(() => {
    const fetchCategories = async () => {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDocSnapshot = await getDoc(userDocRef);
          console.log('User Document Snapshot:', userDocSnapshot);
          console.log('User Document Reference:', userDocSnapshot.ref);
      
          const listingsRef = collection(db, 'listings');
          const q = query(listingsRef, where('user', '==', userDocSnapshot.ref));
          const listingsSnapshot = await getDocs(q);
          console.log('Listings Snapshot:', listingsSnapshot);
      
          const categoryPromises = listingsSnapshot.docs.map(async (doc) => {
            const categoryRef = doc.data().category;
            console.log('Category Reference:', categoryRef);
            const categoryDocSnapshot = await getDoc(categoryRef);
            console.log('Category Document Snapshot:', categoryDocSnapshot);
            return categoryDocSnapshot.data().title;
          });
      
          const categoryTitles = await Promise.all(categoryPromises);
          console.log('Fetched categories:', categoryTitles);
      
          setCategories(categoryTitles);
        } catch (error) {
          console.error('Error fetching categories:', error);
        }
      };            
    fetchCategories();

    const markMessageAsRead = async () => {
      const chatDocRef = doc(db, 'chats', chatId);
      const chatSnapshot = await getDoc(chatDocRef);
      const chatData = chatSnapshot.data();
  
      const updatedMessages = chatData.messages.map((message) => {
        if (message.sender !== currentUser.uid && !message.read) {
          return { ...message, read: true };
        }
        return message;
      });
  
      await updateDoc(chatDocRef, { messages: updatedMessages });
    };
  
    markMessageAsRead();
  
    return () => {
      unsubscribe();
    };
  }, [chatId, currentUser.uid]);

  useEffect(() => {
    console.log('Categories:', categories); // Console log the categories state
    console.log('Selected Category:', bookingDetails.selectedCategory); // Console log the selected category
  }, [categories, bookingDetails.selectedCategory]);
  
  const handleStartDateChange = (event, date) => {
    if (date) {
      setSelectedStartDate(date);
    }
  };

  const handleEndDateChange = (event, date) => {
      if (date) {
          setSelectedEndDate(date);
      }
  };

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker ] = useState(false);
  const [selectedStartDate, setSelectedStartDate] = useState(new Date());
  const [selectedEndDate, setSelectedEndDate] = useState(new Date());

  useEffect(() => {
    const chatDocRef = doc(db, 'chats', chatId);
    const unsubscribe = onSnapshot(chatDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const chatData = docSnapshot.data();
        setMessages(chatData.messages);
      }
    });

    setUnsubscribe(() => unsubscribe); // Set the unsubscribe function

    return () => {
      unsubscribe(); // Call the unsubscribe function
    };
  }, [chatId, currentUser.uid]);

  const handleSendMessage = async () => {
    if (messageText.trim() === '') {
      return;
    }
  
    try {
      const message = {
        text: messageText.trim(),
        sender: currentUser.uid,
        createdAt: new Date().toISOString(),
        read: false, // Add the "read" field with a default value of false
      };
  
      const chatDocRef = doc(db, 'chats', chatId);
      await updateDoc(chatDocRef, {
        messages: [...messages, message],
      });
  
      setMessageText('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };
  

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.toLocaleString('default', { month: 'short' });
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const period = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${day} ${month}, ${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };
  

  const openBookingModal = () => {
    setSelectedStartDate(new Date());
    setSelectedEndDate(new Date());
    setShowModal(true);
  };

  const closeBookingModal = () => {
    setShowModal(false);
    setBookingDetails({
      numberOfStudents: '',
    });
  };

  const handleConfirmSuggestion = async () => {
    // Check if all booking details are filled
    if (bookingDetails.numberOfStudents.trim() === '')
     {
      return;
    }
  
    const durationInMs = selectedEndDate.getTime() - selectedStartDate.getTime(); // Duration calculated in milliseconds
    const durationInHours = durationInMs / 3600000; // Duration converted to hours
    const roundedDuration = Math.round(durationInHours * 100) / 100; // Hours rounded to 2 decimal places


    try {
      const bookingData = {
        ...bookingDetails,
        classStart: selectedStartDate,
        classEnd: selectedEndDate,
        durationHours: roundedDuration,
        confirmed: false,
        completed: false,
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString(),
        selectedCategory: bookingDetails.selectedCategory, 
      };
  
      // Create a new booking document in the 'bookingSuggestions' collection
      const bookingDocRef = await addDoc(collection(db, 'bookingSuggestions'), bookingData);
  
      console.log('Booking created with ID:', bookingDocRef.id);
  
      const bookingId = bookingDocRef.id;
  
      // Create a message with the booking suggestion data and the booking ID
      const suggestionMessage = `Booking Suggestion: ${bookingDetails.selectedCategory}\n\nStudents: ${
        bookingDetails.numberOfStudents
      }\nClass Start: ${selectedStartDate.toLocaleString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      })}\nClass End: ${selectedEndDate.toLocaleString('en-US', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      })}\nLocation: ${bookingDetails.location}`;      
  
      // Create a new message with the booking suggestion data and the booking ID
      const suggestion = {
        text: suggestionMessage,
        sender: currentUser.uid,
        createdAt: new Date().toISOString(),
        confirmed: false,
        bookingId: bookingId, // Include the booking ID
      };
  
      // Add the booking suggestion message to the chat messages
      const chatDocRef = doc(db, 'chats', chatId);
      await updateDoc(chatDocRef, {
        messages: [...messages, suggestion],
      });
  
      closeBookingModal();
    } catch (error) {
      console.error('Error creating booking:', error);
    }
  };
  

    const handleConfirmBooking = async (bookingMessage) => {
        if (bookingMessage.confirmed) {
          return; // Return early if booking is already confirmed
        }
      
        const bookingData = extractBookingData(bookingMessage.text);
      
        try {
          const bookingDocRef = doc(db, 'bookingSuggestions', bookingMessage.bookingId);
      
          await updateDoc(bookingDocRef, {
            confirmedBy: currentUser.uid,
            confirmedAt: new Date().toISOString(),
            confirmed: true,
          });
      
          // Update the confirmed field of the booking message
          const updatedMessages = messages.map((message) => {
            if (message.bookingId === bookingMessage.bookingId) {
              return { ...message, confirmed: true };
            }
            return message;
          });
      
          // Update the messages state
          setMessages(updatedMessages);
      
          // Update the messages array in the 'chats' collection document
          const chatDocRef = doc(db, 'chats', chatId);
          await updateDoc(chatDocRef, {
            messages: updatedMessages,
          });
      
          console.log('Booking confirmed with ID:', bookingMessage.bookingId);
        } catch (error) {
          console.error('Error confirming booking:', error);
        }
      };
        
  

  const extractBookingData = (bookingText) => {
    console.log('Booking Text:', bookingText);
    
    if (!bookingText) {
      console.log('Booking Text is empty or undefined');
      return {};
    }
  
    // Extract the booking details from the message text
    const bookingLines = bookingText.split('\n').filter((line) => line.trim() !== '');
    console.log('Booking Lines:', bookingLines);
    console.log('Number of Lines:', bookingLines.length);
    const { location } = bookingDetails; // Retrieve the location from bookingDetails

    
    if (bookingLines.length < 4) {
      console.log('Booking Text is not in the expected format');
      return {};
    }
  
    const numberOfStudentsLine = bookingLines[1];
    const classStartLine = bookingLines[2];
    const classDurationLine = bookingLines[3];
  
    const numberOfStudents = numberOfStudentsLine.split(': ')[1];
    const classStart = classStartLine.split(': ')[1];
    const classDuration = classDurationLine.split(': ')[1];
  
    return {
      numberOfStudents,
      classStart,
      classDuration,
      location,
    };
  };
  
  

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : null}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <FlatList
        data={messages.slice().reverse()}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={[
              styles.messageContainer,
              item.sender === currentUser.uid ? styles.currentUserMessageContainer : styles.otherUserMessageContainer,
            ]}
          >
            <View style={styles.messageTextContainer}>
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
            <View style={styles.timestampContainer}>
              <Text style={styles.timestampText}>{formatTimestamp(item.createdAt)}</Text>
            </View>
            <View style={styles.confirmButtonContainer}>
              {item.sender !== currentUser.uid && item.text.startsWith('Booking Suggestion:') && !item.confirmed && (
                <TouchableOpacity style={styles.confirmButton} onPress={() => handleConfirmBooking(item)}>
                  <Text style={styles.confirmButtonText}>Confirm Booking</Text>
                  </TouchableOpacity>
              )}

              {item.sender !== currentUser.uid && item.text.startsWith('Booking Suggestion:') && item.confirmed && (
                <View style={styles.confirmedButton}>
                  <Text style={styles.confirmedButtonText}>Booking Confirmed!</Text>
                </View>
              )}
            </View>
          </View>
        )}
        inverted
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type your message"
          value={messageText}
          onChangeText={setMessageText}
          autoCorrect={false}
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSendMessage}>
          <Icon name="paper-plane-outline" size={18} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.bookingButton} onPress={openBookingModal}>
        <Icon name="ellipsis-horizontal-outline" size={18} color="white" />
        </TouchableOpacity>
      </View>

      <Modal visible={showModal} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <SafeAreaView>
              <ScrollView>
                <Text style={styles.modalTitle}>Booking Suggestion</Text>
                <Text style={styles.modalSubTitle}>
                  Only make a Booking Suggestion if you're a Coach! If you're a Rookie, send a message to your coach telling them when and where you'd like to have a class. They'll get back to you with a BookingSuggestion as soon as possible.
                </Text>
                <Picker
                selectedValue={bookingDetails.selectedCategory}
                onValueChange={(itemValue) => setBookingDetails({ ...bookingDetails, selectedCategory: itemValue })}
                >
                <Picker.Item label="Select Listing" value="" />
                {categories.map((category, index) => (
                    <Picker.Item key={index} label={category} value={category} />
                ))}
                </Picker>
                <TextInput
                style={styles.modalInput}
                keyboardType="numeric"
                placeholder="Number of Students"
                placeholderTextColor="#999"
                value={bookingDetails.numberOfStudents}
                onChangeText={(text) => setBookingDetails({ ...bookingDetails, numberOfStudents: text })}
                />
                <TextInput
                style={styles.modalInput}
                placeholder="Location"
                placeholderTextColor="#999"
                value={bookingDetails.location}
                onChangeText={(text) => setBookingDetails({ ...bookingDetails, location: text })}
                />
                <TouchableOpacity style={styles.modalPicker} onPress={() => setShowStartDatePicker(true)}>
                <Text>Class Start</Text>
                </TouchableOpacity>
                {showStartDatePicker && (
                <DateTimePicker value={selectedStartDate} mode="datetime" display="default" onChange={handleStartDateChange} />
                )}
                <TouchableOpacity style={styles.modalPicker} onPress={() => setShowEndDatePicker(true)}>
                <Text>Class End</Text>
                </TouchableOpacity>
                {showEndDatePicker && (
                <DateTimePicker value={selectedEndDate} mode="datetime" display="default" onChange={handleEndDateChange} />
                )}
                <View style={styles.modalButtonContainer}>
                <TouchableOpacity style={styles.modalCancelButton} onPress={closeBookingModal}>
                    <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirmButton} onPress={handleConfirmSuggestion}>
                    <Text style={styles.modalButtonText}>Confirm</Text>
                </TouchableOpacity>
                </View>
              </ScrollView>
          </SafeAreaView>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingLeft: 20,
    paddingRight: 20,

  },
  messageContainer: {
    borderRadius: 8,
    marginBottom: 2,
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingLeft: 10,
    paddingRight: 10,
  },
  currentUserMessageContainer: {
    alignSelf: 'flex-end', // Align right for the current user's messages
    backgroundColor: '#FF385C',
  },
  otherUserMessageContainer: {
    backgroundColor: '#AFAFAF',
  },
  messageText: {
    fontSize: 16,
    color: '#fff',
  },
  timestampContainer: {
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  timestampText: {
    fontSize: 12,
    color: '#fff',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingBottom: 30,
  },
  input: {
    flex: 1,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 10,
    marginRight:    10,
},
sendButton: {
  backgroundColor: '#FF385C',
  borderRadius: 8,
  paddingVertical: 10,
  paddingHorizontal: 12,
  marginLeft: -2,
},
sendButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
bookingButton: {
  backgroundColor: '#FF385C',
  borderRadius: 8,
  paddingVertical: 10,
  paddingHorizontal: 12,
  marginLeft: 6,
  marginRight: -12,
},
bookingButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
modalContainer: {
  flex: 1,
  backgroundColor: '#fff',
  marginTop: 40,
  padding: 20,
},
modalTitle: {
  fontSize: 24,
  fontWeight: 'bold',
  marginBottom: 20,
},
modalSubTitle: {
  fontSize: 16,
  fontWeight: 400,
  marginBottom: -35,
  color: '#FF385C',
},
modalInput: {
  backgroundColor: '#f2f2f2',
  borderRadius: 8,
  padding: 10,
  marginBottom: 10,
},
modalButtonContainer: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
},
modalCancelButton: {
  backgroundColor: '#FF385C',
  borderRadius: 8,
  paddingVertical: 10,
  paddingHorizontal: 20,
  marginRight: 10,
  marginTop: 10,
},
modalConfirmButton: {
  backgroundColor: '#FF385C',
  borderRadius: 8,
  paddingVertical: 10,
  paddingHorizontal: 20,
  marginTop: 10,
},
modalButtonText: {
  color: '#fff',
  fontSize: 16,
  fontWeight: 'bold',
},
modalInput: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
  },
modalPicker: {
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    padding: 10,
    marginBottom:10,
    marginTop: 10,
  },
  confirmButton: {
    backgroundColor: '#FF385C',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
},
  confirmButtonText: {
      color:'#fff',
      fontSize: 16,
      fontWeight: 'bold',
      alignItems: 'center',
      justifyContent: 'center',
  },
  confirmedButton: {
    backgroundColor: '#AFAFAF',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  confirmedButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default ChatScreen;