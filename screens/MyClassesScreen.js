import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import ClassCard from '../components/ClassCard'

const MyClassesScreen = ({ route }) => {
    const { listingId, classData, closeGroupClassModal } = route.params;
  
    return (
      <SafeAreaView>
        <View>
          {classData && (
            <ClassCard 
              closeModal={closeGroupClassModal} 
              listingId={listingId} 
              className={classData.className}
              classPrice={classData.classPrice}
              classDescription={classData.classDescription}
              classStart={classData.startDateTime}
              classEnd={classData.endDateTime}
            />
          )}
        </View>
      </SafeAreaView>
    );
  };
  

export default MyClassesScreen

const styles = StyleSheet.create({})