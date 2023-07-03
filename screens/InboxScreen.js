import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, SafeAreaView } from 'react-native';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import Icon from 'react-native-vector-icons/Ionicons';

const InboxScreen = ({ navigation }) => {
  const currentUser = auth.currentUser;
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, 'chats')),
      async (snapshot) => {
        const chatsData = [];
        const currentUserID = currentUser.uid;

        for (const docRef of snapshot.docs) {
          const docData = docRef.data();
          const userCurrentRef = docData.user_creator;
          const userReceiverRef = docData.user_receiver;

          if (userCurrentRef && userReceiverRef) {
            const userCurrentSnapshot = await getDoc(userCurrentRef);
            const userReceiverSnapshot = await getDoc(userReceiverRef);

            if (
              (userCurrentSnapshot.exists() &&
                userCurrentSnapshot.data().userId === currentUserID) ||
              (userReceiverSnapshot.exists() &&
                userReceiverSnapshot.data().userId === currentUserID)
            ) {
              const userCurrentData = userCurrentSnapshot.data();
              const userReceiverData = userReceiverSnapshot.data();

              const chat = {
                id: docRef.id,
                createdAt: docData.createdAt,
                messages: docData.messages,
                userCurrent: userCurrentData,
                userReceiver: userReceiverData,
              };

              // Check if the chat has more than 0 messages
              if (chat.messages.length > 0) {
                chatsData.push(chat);
              }
            }
          }
        }

        console.log('Unsorted chatsData:', chatsData);

        // Sort chatsData array based on the most recent message timestamp
        const sortedChatsData = chatsData.sort((a, b) => {
          const aDate = new Date(a.messages[a.messages.length - 1].createdAt);
          const bDate = new Date(b.messages[b.messages.length - 1].createdAt);
          return bDate.getTime() - aDate.getTime();
        });

        console.log('Sorted chatsData:', sortedChatsData);

        setChats(sortedChatsData);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);
  

  const handleChatPress = (chatId) => {
    navigation.navigate('Chat', { chatId });
  };

  const handleBackButtonPress = () => {
    navigation.goBack();
  };

  const renderChatItem = ({ item }) => {
    const currentUserID = currentUser.uid;
    const otherUser = currentUserID === item.userCurrent.userId ? item.userReceiver : item.userCurrent;
  
    const hasUnreadMessages = item.messages.some(
      (message) => !message.read && message.sender !== currentUserID
    );
  
    return (
      <TouchableOpacity style={styles.chatItem} onPress={() => handleChatPress(item.id)}>
        <Text style={styles.chatItemTitle}>{otherUser.fullName}</Text>
        {hasUnreadMessages && <Icon name="ellipse" size={16} color="#FF385C" />}
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <SafeAreaView>
        <Text style={styles.loadingText}>Loading Chats...</Text>
        </SafeAreaView>
      </View>
    );
  }

  if (chats.length === 0) {
    return (
      <View style={styles.container}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackButtonPress}>
        <Icon name="arrow-back" size={25} color="#FF385C" marginBottom={-30} marginLeft={8} />
      </TouchableOpacity>
        <SafeAreaView>
        <Text style={styles.emptyText}>No chats available</Text>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView>
      <TouchableOpacity style={styles.backButton} onPress={handleBackButtonPress}>
        <Icon name="arrow-back" size={25} color="#FF385C" marginBottom={-30} marginLeft={8} />
      </TouchableOpacity>
      <Text style={styles.heading}>Chats</Text>
      <FlatList
        data={chats}
        keyExtractor={(item) => item.id}
        renderItem={renderChatItem}
        contentContainerStyle={styles.chatList}
      />
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 38,
    left: 0,
    zIndex: 1,
  },
  loadingText: {
    fontSize: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 18,
    paddingTop: 20,
    textAlign: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 8,
    marginBottom: 0,
    textAlign: 'center',
  },
  chatList: {
    paddingTop: 20,
  },
  chatItem: {
    backgroundColor: '#f7f7f7',
    padding: 20,
    marginBottom: 10,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  chatItemTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    flex: 1,
  },
});

export default InboxScreen;