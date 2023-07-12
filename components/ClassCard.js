import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';

const ClassCard = ({ classData }) => {
  const renderItem = ({ item }) => {
    const formattedStartDateTime = item.startDateTime ? item.startDateTime.toDate().toLocaleString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }) : '';
    const formattedEndDateTime = item.endDateTime ? item.endDateTime.toDate().toLocaleString('en-US', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }) : '';    

    return (
      <TouchableOpacity style={styles.classItem}>
        <Text>Name: {item.className}</Text>
        <Text>Price: {item.classPrice}</Text>
        <Text>Start: {formattedStartDateTime}</Text>
        <Text>End: {formattedEndDateTime}</Text>
        <Text>Description: {item.classDescription}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Group Classes</Text>
      <FlatList
        data={classData}
        renderItem={renderItem}
        keyExtractor={(item) => item.classId}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  listContainer: {
    flexGrow: 1,
  },
  classItem: {
    backgroundColor: '#F5F5F5',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  closeButton: {
    backgroundColor: '#FF385C',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ClassCard;
