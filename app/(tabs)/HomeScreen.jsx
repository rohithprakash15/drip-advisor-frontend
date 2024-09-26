import React, { useState } from 'react';
import { Button, View, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Assuming you're using AsyncStorage for token storage

function HomeScreen() {
  const navigation = useNavigation();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await AsyncStorage.removeItem('access_token');
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
      Alert.alert('Success', 'You have logged out successfully.');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button
          title="Go to Uploader"
          onPress={() => navigation.navigate('Uploader')}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Go to Profile"
          onPress={() => navigation.navigate('Profile')}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="WardrobeScreen"
          onPress={() => navigation.navigate('WardrobeScreen')}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="OutfitScreen"
          onPress={() => navigation.navigate('OutfitScreen')}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Logout"
          onPress={handleLogout}
          disabled={loading}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5', // Light background color
  },
  buttonContainer: {
    marginVertical: 10, // Space between each button
  },
});

export default HomeScreen;
