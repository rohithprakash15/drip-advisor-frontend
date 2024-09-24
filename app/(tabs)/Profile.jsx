import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState(new Date());
  const [preferences, setPreferences] = useState([]);
  const [newPreference, setNewPreference] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [accessToken, setAccessToken] = useState(''); // State for storing the token

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token'); // Retrieve token from AsyncStorage
        if (token) {
          setAccessToken(token);
          fetchUserProfile(token); // Fetch profile data using the token
        } else {
          Alert.alert('Error', 'Access token not found');
        }
      } catch (error) {
        Alert.alert('Error', 'Failed to retrieve access token');
      }
    };

    fetchAccessToken();
  }, []);

  const fetchUserProfile = async (token) => {
    setLoading(true);
    try {
      const response = await fetch('https://drip-advisor-backend.vercel.app/users/profile', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`, // Use the token dynamically
        },
      });
      if (!response.ok) throw new Error('Failed to fetch user profile');
      const data = await response.json();
      setName(data.name);
      setEmail(data.email);
      setGender(data.gender);
      setDob(new Date(data.dob));
      if (data.preferences && Array.isArray(data.preferences)) {
        const parsedPreferences = data.preferences.map(pref => pref.split(' on ')[0]);
        setPreferences(parsedPreferences);
      }
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (newPreference.trim() !== '') {
      setPreferences([...preferences, newPreference]);
    }

    setLoading(true);
    try {
      const response = await fetch('https://drip-advisor-backend.vercel.app/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`, // Use the token dynamically
        },
        body: JSON.stringify({
          name,
          gender,
          dob: dob.toISOString().split('T')[0],
          preferences,
        }),
      });
      if (!response.ok) throw new Error('Failed to update profile');
      const result = await response.json();
      Alert.alert('Success', result.message || 'Profile updated successfully');
      setIsEditing(false); // Exit editing mode after successful update
      setNewPreference(''); // Clear the new preference input
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : (
        <View>
          <Text style={styles.title}>Profile</Text>
          {isEditing ? (
            <>
              <TextInput
                style={styles.input}
                placeholder="Name"
                value={name}
                onChangeText={setName}
              />
              <TextInput
                style={styles.input}
                placeholder="Gender"
                value={gender}
                onChangeText={setGender}
              />
              <Text style={styles.dateText}>Date of Birth: {dob.toISOString().split('T')[0]}</Text>
              <TextInput
                style={styles.input}
                placeholder="Add New Preference"
                value={newPreference}
                onChangeText={setNewPreference}
              />
              <Button title="Update Profile" onPress={handleUpdateProfile} />
            </>
          ) : (
            <>
              <Text>Name: {name}</Text>
              <Text>Email: {email}</Text>
              <Text>Gender: {gender}</Text>
              <Text>Date of Birth: {dob.toISOString().split('T')[0]}</Text>
              <Text>User Preferences:</Text>
              {preferences.length > 0 ? (
                preferences.map((pref, index) => <Text key={index}>- {pref}</Text>)
              ) : (
                <Text>No preferences set.</Text>
              )}
            </>
          )}
          {!isEditing && <Button title="Edit" onPress={() => setIsEditing(true)} />}
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginBottom: 15,
  },
  dateText: {
    marginBottom: 15,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default ProfileScreen;
