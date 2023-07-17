import React from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native';

const ClassCard = ({ classData, navigation, closeModal, listingId }) => {
  const renderItem = ({ item }) => {
    const formattedStartDateTime = item.startDateTime
      ? item.startDateTime.toDate().toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : '';
    const formattedEndDateTime = item.endDateTime
      ? item.endDateTime.toDate().toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : '';

      const handleClassDetails = () => {
        navigation.navigate('ClassDetailsScreen', { classData: item, listingId, classId: item.classId });
        closeModal();
      }

    return (
      <TouchableOpacity style={styles.classItem} onPress={handleClassDetails}>
        <Text style={styles.className}>{item.className}</Text>
        <Text style={styles.price}>${item.classPrice}</Text>
        <Text style={styles.date}>{formattedStartDateTime}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
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
  listContainer: {
    flexGrow: 1,
  },
  classItem: {
    backgroundColor: '#ededed',
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  className: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  date: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 0,
  },
  price: {
    fontSize: 18,
    fontWeight: '400',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#555555',
  },
});

export default ClassCard;
