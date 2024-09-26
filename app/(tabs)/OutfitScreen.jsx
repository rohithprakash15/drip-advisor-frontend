import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, Image, TextInput } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OutfitScreen = () => {
  const [outfits, setOutfits] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
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

      // Log each outfit and its clothing items
      response.data.forEach(outfit => {
        console.log('Outfit Name:', outfit.name);
        console.log('Outfit Description:', outfit.description);
        console.log('Styling Tips:', outfit.styling_tips);

        // Iterate through clothing items
        outfit.clothing_items_list.forEach((clothingItem, index) => {
          console.log(`Clothing Item ${index + 1}:`);
          console.log('Description:', clothingItem.description);
          console.log('Image Path:', clothingItem.path); // Ensure this exists
          console.log('Other Properties:', clothingItem);
        });
      });

    } catch (error) {
      console.error('Error generating outfits:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Unable to generate outfits. Please try again.');
    }
  };

  const renderOutfit = ({ item }) => (
    <View style={styles.outfitContainer}>
      <Text style={styles.outfitName}>{item.name}</Text>
      <Text>{item.description}</Text>
      <Text style={styles.stylingTips}>{item.styling_tips}</Text>

      <FlatList
        data={item.clothing_items_list}
        keyExtractor={(clothingItem) => clothingItem._id}
        renderItem={({ item }) => (
          <View style={styles.clothingItemContainer}>
            <Image source={{ uri: item.path }} style={styles.clothingImage} />
            {/* <Text>{item.description}</Text> */}
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
});

export default OutfitScreen;
