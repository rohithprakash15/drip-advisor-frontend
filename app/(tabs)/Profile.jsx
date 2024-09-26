import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import axios from 'axios'; // Make sure to import axios

const ProfileScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('');
  const [dob, setDob] = useState(new Date());
  const [preferences, setPreferences] = useState([]);
  const [newPreference, setNewPreference] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [accessToken, setAccessToken] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [addingPreference, setAddingPreference] = useState(false);

  useEffect(() => {
    const fetchAccessToken = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          setAccessToken(token);
          fetchUserProfile(token);
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
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch user profile');
      const data = await response.json();
      setName(data.name);
      setEmail(data.email);
      setGender(data.gender);
      setDob(new Date(data.dob));
      if (data.preferences && Array.isArray(data.preferences)) {
        console.log('Fetched preferences:', data.preferences);
        const parsedPreferences = data.preferences.map(pref => pref.split(' on ')[0]);
        setPreferences(parsedPreferences);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      // Update profile
      const profileResponse = await fetch('https://drip-advisor-backend.vercel.app/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name,
          gender,
          dob: dob.toISOString().split('T')[0],
        }),
      });
      if (!profileResponse.ok) throw new Error('Failed to update profile');

      // Update preferences
      const preferencesResponse = await fetch('https://drip-advisor-backend.vercel.app/users/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ preferences }),
      });
      if (!preferencesResponse.ok) throw new Error('Failed to update preferences');

      const result = await profileResponse.json();
      Alert.alert('Success', result.message || 'Profile and preferences updated successfully');
      setIsEditing(false);
      setNewPreference('');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const addPreference = async () => {
    if (newPreference.trim() === '') {
      Alert.alert('Error', 'Please enter a preference');
      return;
    }

    setAddingPreference(true);
    try {
      const updatedPreferences = [...preferences, newPreference.trim()];
      const response = await axios.post(
        'https://drip-advisor-backend.vercel.app/users/preferences',
        { preferences: updatedPreferences },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.message) {
        setPreferences(updatedPreferences);
        setNewPreference('');
        Alert.alert('Success', response.data.message);
      }
    } catch (error) {
      console.error('Error adding preference:', error);
      Alert.alert('Error', 'Failed to add preference. Please try again.');
    } finally {
      setAddingPreference(false);
    }
  };

  const deletePreference = async (indexToRemove) => {
    try {
      const updatedPreferences = preferences.filter((_, index) => index !== indexToRemove);
      const response = await axios.post(
        'https://drip-advisor-backend.vercel.app/users/preferences',
        { preferences: updatedPreferences },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data && response.data.message) {
        setPreferences(updatedPreferences);
        Alert.alert('Success', 'Preference deleted successfully');
      }
    } catch (error) {
      console.error('Error deleting preference:', error);
      Alert.alert('Error', 'Failed to delete preference. Please try again.');
    }
  };

  const renderPreferences = () => (
    <View style={styles.preferencesContainer}>
      <Text style={styles.sectionTitle}>Preferences</Text>
      {preferences.map((pref, index) => (
        <View key={index} style={styles.preferenceItem}>
          <Text style={styles.preferenceText}>{pref}</Text>
          {isEditing && (
            <TouchableOpacity onPress={() => deletePreference(index)} style={styles.deletePreferenceButton}>
              <Ionicons name="close-circle" size={24} color="#ff6b6b" />
            </TouchableOpacity>
          )}
        </View>
      ))}
      {isEditing && (
        <View style={styles.addPreferenceContainer}>
          <TextInput
            style={styles.preferenceInput}
            value={newPreference}
            onChangeText={setNewPreference}
            placeholder="Add new preference"
          />
          <TouchableOpacity
            style={styles.addButton}
            onPress={addPreference}
            disabled={addingPreference}
          >
            {addingPreference ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="add" size={24} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  const onChangeDob = (event, selectedDate) => {
    const currentDate = selectedDate || dob;
    setShowDatePicker(false);
    setDob(currentDate);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {loading ? (
          <ActivityIndicator size="large" color="#50C2C9" />
        ) : (
          <>
            <View style={styles.header}>
              <Image
                source={require('../../assets/profile-placeholder.png')}
                style={styles.profileImage}
              />
              <Text style={styles.title}>{isEditing ? 'Edit Profile' : 'My Profile'}</Text>
            </View>

            <View style={styles.infoContainer}>
              <View style={styles.infoItem}>
                <Ionicons name="person-outline" size={24} color="#50C2C9" />
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                    placeholder="Name"
                  />
                ) : (
                  <Text style={styles.infoText}>{name}</Text>
                )}
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="mail-outline" size={24} color="#50C2C9" />
                <Text style={styles.infoText}>{email}</Text>
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="transgender-outline" size={24} color="#50C2C9" />
                {isEditing ? (
                  <TextInput
                    style={styles.input}
                    value={gender}
                    onChangeText={setGender}
                    placeholder="Gender"
                  />
                ) : (
                  <Text style={styles.infoText}>{gender}</Text>
                )}
              </View>

              <View style={styles.infoItem}>
                <Ionicons name="calendar-outline" size={24} color="#50C2C9" />
                {isEditing ? (
                  <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                    <Text style={styles.datePickerText}>
                      {dob.toISOString().split('T')[0]}
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <Text style={styles.infoText}>{dob.toISOString().split('T')[0]}</Text>
                )}
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={dob}
                  mode="date"
                  display="default"
                  onChange={onChangeDob}
                />
              )}
            </View>

            {renderPreferences()}

            {isEditing ? (
              <TouchableOpacity style={styles.saveButton} onPress={handleUpdateProfile}>
                <Text style={styles.buttonText}>Save Changes</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
                <Text style={styles.buttonText}>Edit Profile</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  infoContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#333',
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#50C2C9',
    paddingVertical: 5,
  },
  datePickerText: {
    fontSize: 16,
    marginLeft: 10,
    color: '#50C2C9',
  },
  preferencesContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  preferenceText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  deletePreferenceButton: {
    padding: 5,
  },
  addPreferenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  preferenceInput: {
    flex: 1,
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#50C2C9',
    borderRadius: 5,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
  },
  editButton: {
    backgroundColor: '#50C2C9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default ProfileScreen;