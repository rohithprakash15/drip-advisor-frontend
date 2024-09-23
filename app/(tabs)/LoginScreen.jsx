import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, SafeAreaView, Image, Alert } from 'react-native';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Function to handle login process
  const handleLogin = async () => {
    console.log("Login button pressed!");

    // Basic validation for required fields
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      console.log('Email or password is missing');  // Log for debugging
      return;
    }

    try {
      console.log('Sending login request to API...');

      // Make the POST request to the /users/login endpoint
      const response = await fetch('https://drip-advisor-backend.vercel.app/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      // Handle success or error
      if (response.ok) {
        Alert.alert('Success', 'Login successful');
        console.log('User logged in successfully');  // Log success
        // Handle successful login (e.g., navigate to another screen, save token, etc.)
      } else {
        Alert.alert('Error', data.message || 'Login failed');
        console.error('Login failed:', data);  // Log error message
      }
    } catch (error) {
      console.error('Network error during login:', error);
      Alert.alert('Error', 'Network error. Please try again later.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome Back!</Text>
      </View>
      
      <View style={styles.illustrationContainer}>
        <Image 
          source={require('./../../media/LoginImage.png')} 
          style={styles.illustration}
        />
      </View>
      
      <View style={styles.inputContainer}>
        {/* Email Input Field */}
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
        />
        {/* Password Input Field */}
        <TextInput
          style={styles.input}
          placeholder="Enter password"
          placeholderTextColor="#999"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        {/* Forgot Password Link */}
        <TouchableOpacity>
          <Text style={styles.forgotPassword}>Forgot Password?</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.signInContainer}>
        {/* Sign In Button */}
        <TouchableOpacity style={styles.signInButton} onPress={handleLogin}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.signUpContainer}>
        <Text style={styles.signUpText}>Don't have an account? </Text>
        <TouchableOpacity>
          <Text style={styles.signUpLink}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Styling for the component
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginTop: 20,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  illustrationContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  illustration: {
    width: 200,
    height: 200,
    resizeMode: 'contain',
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    width: '100%', 
    height: 40, 
    backgroundColor: 'white',
    borderColor: 'white', 
    borderWidth: 1, 
    borderRadius: 20, 
    paddingHorizontal: 10, 
    marginBottom: 15, 
  },
  forgotPassword: {
    color: '#50C2C9',
    textAlign: 'right',
    marginBottom: 20,
  },
  signInButton: {
    backgroundColor: '#50C2C9',
    width: 300,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
  },
  signInText: {
    color: 'white',
    fontWeight: 'bold',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signUpText: {
    color: '#333',
  },
  signInContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  signUpLink: {
    color: '#50C2C9',
    fontWeight: 'bold',
  },
});

export default LoginScreen;