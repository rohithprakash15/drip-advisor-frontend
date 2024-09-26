import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, Image, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RadioButton } from 'react-native-paper';

const OutfitScreen = () => {
  const [outfits, setOutfits] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [selectedOutfitId, setSelectedOutfitId] = useState(null); // Track selected outfit
  const baseUrl = 'https://drip-advisor-backend.vercel.app/';
  
  // New state variables for user input
  const [weatherDescription, setWeatherDescription] = useState(''); // User input for weather description
  const [temperature, setTemperature] = useState(''); // User input for temperature
  const [dayDescription, setDayDescription] = useState(''); // User input for day description

  // Fetch access token from AsyncStorage on component mount
  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          setAccessToken(token);
        } else {
          console.log('No access token found.');
        }
      } catch (error) {
        console.error('Error retrieving token:', error);
      }
    };
    getToken();
  }, []);

  // Function to generate outfits
  const generateOutfits = async () => {
    if (!accessToken) {
      Alert.alert('Error', 'No access token found. Please log in.');
      return;
    }

    if (!weatherDescription || !temperature || !dayDescription) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}outfits/generate`,
        {
          weather_description: weatherDescription,
          temperature: parseFloat(temperature),
          day_description: dayDescription
        },
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setOutfits(response.data);

    } catch (error) {
      console.error('Error generating outfits:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Unable to generate outfits. Please try again.');
    }
  };

  // Function to use a selected outfit
  const useOutfit = async () => {
    if (!selectedOutfitId) {
      Alert.alert('Error', 'Please select an outfit.');
      return;
    }

    try {
      const response = await axios.post(
        `${baseUrl}outfits/use/${selectedOutfitId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      );

      Alert.alert('Success', 'Outfit used successfully! Items are now unavailable for 48 hours.');
    } catch (error) {
      console.error('Error using outfit:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Unable to use outfit. Please try again.');
    }
  };

  const renderOutfit = ({ item }) => (
    <View style={styles.outfitContainer}>
      <View style={styles.radioContainer}>
        {/* Radio button for selecting an outfit */}
        <RadioButton
          value={item._id}
          status={selectedOutfitId === item._id ? 'checked' : 'unchecked'}
          onPress={() => setSelectedOutfitId(item._id)} // Set the selected outfit ID
        />
        <Text style={styles.outfitName}>{item.name}</Text>
      </View>
      <Text>{item.description}</Text>
      <Text style={styles.stylingTips}>{item.styling_tips}</Text>

      <FlatList
        data={item.clothing_items_list}
        keyExtractor={(clothingItem) => clothingItem._id}
        renderItem={({ item }) => (
          <View style={styles.clothingItemContainer}>
            <Image source={{ uri: item.path }} style={styles.clothingImage} />
          </View>
        )}
        horizontal
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Weather Description"
        value={weatherDescription}
        onChangeText={setWeatherDescription}
        style={styles.input}
      />
      <TextInput
        placeholder="Temperature (°C)"
        value={temperature}
        onChangeText={setTemperature}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Day Description"
        value={dayDescription}
        onChangeText={setDayDescription}
        style={styles.input}
      />
      <Button title="Generate Outfits" onPress={generateOutfits} />
      
      <FlatList
        data={outfits}
        keyExtractor={(item) => item._id}
        renderItem={renderOutfit}
        showsVerticalScrollIndicator={false}
      />

      {/* Button to use the selected outfit */}
      <TouchableOpacity onPress={useOutfit} style={styles.useOutfitButton}>
        <Text style={styles.useOutfitButtonText}>Use This Outfit</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  outfitContainer: {
    marginBottom: 20,
  },
  outfitName: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  stylingTips: {
    fontStyle: 'italic',
    marginVertical: 5,
  },
  clothingItemContainer: {
    marginRight: 10,
    alignItems: 'center',
  },
  clothingImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  useOutfitButton: {
    marginTop: 20,
    backgroundColor: '#007BFF',
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  useOutfitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  radioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default OutfitScreen;
