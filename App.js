import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import NewListingScreen from './screens/NewListingScreen';
import ChatScreen from './screens/ChatScreen';
import InboxScreen from './screens/InboxScreen';
import BookingManagementScreen from './screens/BookingManagementScreen';
import BookingDetailsScreen from './screens/BookingDetailsScreen';
import ProfileScreen from './screens/ProfileScreen';
import ListingsScreen from './screens/ListingsScreen';
import ListScreen from './screens/ListScreen';
import MyClassesScreen from './screens/MyClassesScreen';
import ClassDetailsScreen from './screens/ClassDetailsScreen';
import ClassManagementScreen from './screens/ClassManagementScreen';
import BookedClassScreen from './screens/BookedClassScreen';

const Stack = createNativeStackNavigator();

// test comment for first commit (to be removed)

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen 
          name='HomeScreen' 
          component={HomeScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name='ProfileScreen' 
          component={ProfileScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name = 'LoginScreen'
          component = {LoginScreen}
        />
        <Stack.Screen 
          name='RegisterScreen'
          component={RegisterScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
        name='InboxScreen'
        component={InboxScreen}
        options={{ headerShown: false }}
        />
        <Stack.Screen 
          name='NewListingScreen'
          component={NewListingScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='BookingManagementScreen'
          component={BookingManagementScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='BookedClassesScreen'
          component={BookedClassScreen}
        />
        <Stack.Screen
          name='BookingDetailsScreen'
          component={BookingDetailsScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name='ListingsScreen' 
          component={ListingsScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='ListScreen'
          component={ListScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='ClassDetailsScreen'
          component={ClassDetailsScreen}
        />
        <Stack.Screen
          name='MyClassesScreen'
          component={MyClassesScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name='ClassManagementScreen'
          component={ClassManagementScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
        name='Chat'
        component={ChatScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;