import React, { useState } from 'react';
import { Button, View, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';  // Assuming you're using AsyncStorage for token storage

function HomeScreen() {
  const navigation = useNavigation();  // Use navigation hook
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);

      // Remove the JWT token from AsyncStorage (or wherever it's stored)
      await AsyncStorage.removeItem('access_token');
      
      // Navigate back to the login screen
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],  // Reset navigation stack to prevent going back
      });

      Alert.alert('Success', 'You have logged out successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        title="Go to Uploader"
        onPress={() => navigation.navigate('Uploader')}  // Navigates to Uploader screen
      />
      <Button
        title="Go to Profile"
        onPress={() => navigation.navigate('Profile')}  // Navigates to Profile screen
        style={{ marginTop: 10 }}  // Optional: Add some margin between the buttons
      />
      <Button
        title="Go to User Suggestions"  // New button for UserSuggestion screen
        onPress={() => navigation.navigate('UserSuggestion')}  // Navigate to UserSuggestion screen
        style={{ marginTop: 10 }}
      />
      <Button
        title="Ask Gemini"  // New button for UserSuggestion screen
        onPress={() => navigation.navigate('Gemini')}  // Navigate to UserSuggestion screen
        style={{ marginTop: 10 }}
      />
      <Button
        title="Main"  // New button for UserSuggestion screen
        onPress={() => navigation.navigate('MainScreen')}  // Navigate to UserSuggestion screen
        style={{ marginTop: 10 }}
      />
      <Button
        title="Logout"
        onPress={handleLogout}  // Call the logout function
        style={{ marginTop: 10 }}
        disabled={loading}  // Disable the button if loading
      />
    </View>
  );
}

export default HomeScreen;
