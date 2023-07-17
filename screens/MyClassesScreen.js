import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Modal, TouchableOpacity, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ClassCardCoach from '../components/ClassCardCoach';
import CreateClass from '../components/CreateClass';

const MyClassesScreen = ({ route }) => {
  const { listingId, classData, navigation } = route.params;
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);

  const openCreateClassModal = () => {
    setShowCreateClassModal(true);
  };

  const closeCreateClassModal = () => {
    setShowCreateClassModal(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Group Classes</Text>
      <ClassCardCoach classData={classData} listingId={listingId} navigation={navigation}/> 
      <TouchableOpacity style={styles.createButton} onPress={openCreateClassModal}>
        <Text style={styles.createButtonText}> New Group Class</Text>
      </TouchableOpacity>
      <Modal visible={showCreateClassModal} animationType="slide">
        <CreateClass closeModal={closeCreateClassModal} listingId={listingId} />
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  createButton: {
    backgroundColor: '#FF385C',
    borderRadius: 10,
    paddingVertical: 15,
    paddingHorizontal: 30,
    marginBottom: 15,
    alignSelf: 'center',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 0,
    marginLeft: 28,
  },
});

export default MyClassesScreen;
