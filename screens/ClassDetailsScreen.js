import { StyleSheet, Text, TouchableOpacity } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

const ClassDetailsScreen = ({ route }) => {
    const { classData } = route.params;  
    const formattedStartDateTime = classData.startDateTime
      ? classData.startDateTime.toDate().toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : '';
    const formattedEndDateTime = classData.endDateTime
      ? classData.endDateTime.toDate().toLocaleString('en-US', {
          hour: 'numeric',
          minute: 'numeric',
          hour12: true,
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        })
      : '';
  
    return (
      <SafeAreaView>
        <Text>{classData.className}</Text>
        <Text>${classData.classPrice}</Text>
        <Text>Description:</Text>
        <Text>{classData.classDescription}</Text>
        <Text>{formattedStartDateTime}</Text>
        <Text>{formattedEndDateTime}</Text>
      </SafeAreaView>
    );
  };  

export default ClassDetailsScreen

const styles = StyleSheet.create({})