import { StyleSheet, Text, KeyboardAvoidingView, View, TextInput, TouchableOpacity, Modal, Alert } from 'react-native';
import React, { useEffect, useState } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const LoginScreen = ({ closeModal, targetScreen, navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigation();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        closeModal();
      }
    });

    return unsubscribe;
  }, []);

  const handleLogin = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(userCredential => {
        const user = userCredential.user;
        console.log('Logged in with:', user.email);
        if (targetScreen) {
          console.log('Navigation:', navigation);
          navigate.navigate(targetScreen);
          setTimeout(() => closeModal(), 0); // Close the modal after a delay
        } else {
          closeModal();
        }
      })
      .catch(error => alert(error.message));
  };

  const handleSignUp = () => {
    navigate.navigate('RegisterScreen');
    closeModal(); // Close the modal after signing up
  };

  const handleForgotPassword = () => {
    if (email === '') {
      Alert.alert('Error', 'Please enter your email address.');
      return;
    }

    sendPasswordResetEmail(auth, email)
      .then(() => {
        Alert.alert('Password Reset Email Sent', 'Please check your email to reset your password.');
      })
      .catch(error => {
        Alert.alert('Error', error.message);
      });
  };

  const handleCloseModal = () => {
    closeModal();
  };
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior='padding'
    >
      <TouchableOpacity onPress={handleCloseModal} style={styles.closeButton}>
        <Icon name="close" size={24} color="#FF385C" />
      </TouchableOpacity>
      <Text style={styles.header}>Rooky</Text>
      <View style={styles.inputContainer}>
        <TextInput
          placeholder='Email'
          placeholderTextColor="#999"
          value={email}
          onChangeText={text => setEmail(text)}
          style={styles.input}
        />
        <TextInput
          placeholder='Password'
          placeholderTextColor="#999"
          value={password}
          onChangeText={text => setPassword(text)}
          style={styles.input}
          secureTextEntry
        />
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          onPress={handleLogin}
          style={[styles.button, styles.buttonOutline]}
        >
          <Text style={styles.buttonOutlineText}>Login</Text>
        </TouchableOpacity>
        <Text style={styles.textStyle}>Don't Have An Account?</Text>
        <TouchableOpacity
          onPress={handleSignUp}
          style={[styles.button]}
        >
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <Text style={styles.textStyle}>Or</Text>
        <TouchableOpacity
          onPress={handleForgotPassword}
          style={styles.forgotButton}
        >
          <Text style={styles.buttonOutlineText}>Forgot Password</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  closeButton: {
    position: 'absolute',
    top: 46,
    left: 16,
    padding: 8,
  },
  inputContainer: {
    width: '80%',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f2f2f2',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonContainer: {
    width: '60%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  header: {
    fontSize: 38,
    fontWeight: 'bold',
    top: -35,
    right: 4,
  },
  button: {
    backgroundColor: '#FF385C',
    width: '100%',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonOutline: {
    backgroundColor: '#fff',
    marginTop: 10,
    borderColor: '#FF385C',
    borderWidth: 2,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  buttonOutlineText: {
    color: '#FF385C',
    fontWeight: '700',
    fontSize: 16,
  },
  forgotButton: {
    marginTop: 10,
  },
  textStyle: {
    marginTop: 16,
    marginBottom: 8,
    color: '#999',
    fontSize: 14,
  },
});

export default LoginScreen;
