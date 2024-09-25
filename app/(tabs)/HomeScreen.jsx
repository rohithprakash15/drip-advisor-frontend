import React from 'react';
import { Button, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

function HomeScreen() {
  const navigation = useNavigation();  // Use navigation hook

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
    </View>
  );
}

export default HomeScreen;
