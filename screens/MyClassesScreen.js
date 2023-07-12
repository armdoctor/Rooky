import { StyleSheet, Text, View, Modal, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ClassCard from '../components/ClassCard';
import CreateClass from '../components/CreateClass';

const MyClassesScreen = ({ route }) => {
  const { listingId, classData } = route.params;
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);

  const openCreateClassModal = () => {
    setShowCreateClassModal(true);
  };

  const closeCreateClassModal = () => {
    setShowCreateClassModal(false);
  };

  return (
    <SafeAreaView>
      <View>
        {classData && (
          <ClassCard
            listingId={listingId}
            className={classData.className}
            classPrice={classData.classPrice}
            classDescription={classData.classDescription}
            classStart={classData.startDateTime}
            classEnd={classData.endDateTime}
          />
        )}
      </View>
      <TouchableOpacity style={styles.cancelDeleteModalButton} onPress={openCreateClassModal}>
        <Text style={styles.deleteModalButtonText}>Create New Class</Text>
      </TouchableOpacity>
      <Modal visible={showCreateClassModal} animationType="slide">
        <CreateClass closeModal={closeCreateClassModal} />
      </Modal>
    </SafeAreaView>
  );
};

export default MyClassesScreen;

const styles = StyleSheet.create({
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
