import React, { useState } from 'react';
import { View, Alert, Image, StyleSheet, TouchableOpacity, Text, SafeAreaView, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

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

  const menuItems = [
    { name: 'Uploader', icon: 'cloud-upload-outline', screen: 'Uploader' },
    { name: 'Profile', icon: 'person-outline', screen: 'Profile' },
    { name: 'Wardrobe', icon: 'shirt-outline', screen: 'WardrobeScreen' },
    { name: 'Daily Suggestion', icon: 'today-outline', screen: 'DailySuggestion' },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/images/image-light-mode.png')} style={styles.logo} />
        </View>
        <View style={styles.bentoGrid}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.bentoItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <Ionicons name={item.icon} size={40} color="#fff" />
              <Text style={styles.bentoItemText}>{item.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.logoutButtonContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loading}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: StatusBar.currentHeight, // Add this line
  },
  container: {
    flex: 1,
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: 'contain',
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  bentoItem: {
    width: '48%',
    aspectRatio: 1,
    backgroundColor: '#50C2C9',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bentoItemText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  logoutButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  logoutButton: {
    backgroundColor: '#ff6b6b',
    flexDirection: 'row',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default HomeScreen;
