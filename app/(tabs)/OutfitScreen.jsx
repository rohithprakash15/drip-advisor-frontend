import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Image, 
  TextInput, 
  TouchableOpacity, 
  Alert
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const OutfitScreen = () => {
  const [outfits, setOutfits] = useState([]);
  const [weatherDescription, setWeatherDescription] = useState('');
  const [temperature, setTemperature] = useState('');
  const [dayDescription, setDayDescription] = useState('');
  const [accessToken, setAccessToken] = useState(null);
  const baseUrl = 'https://drip-advisor-backend.vercel.app/';

  useEffect(() => {
    const getToken = async () => {
      const token = await AsyncStorage.getItem('access_token');
      setAccessToken(token);
    };
    getToken();
  }, []);

  const generateOutfits = async () => {
    if (!accessToken) {
      Alert.alert('Error', 'No access token found. Please log in.');
      return;
    }

    if (!weatherDescription || !temperature) {
      Alert.alert('Error', 'Weather description and temperature are required.');
      return;
    }

    console.log("Generating outfits with the following data:");
    console.log({
      weather_description: weatherDescription,
      temperature: parseFloat(temperature),
      day_description: dayDescription,
    });

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
      console.log("Outfits generated successfully:", response.data);
      
    } catch (error) {
      console.error('Error generating outfits:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Unable to generate outfits. Please try again.');
    }
  };

  const getImageUri = (item) => {
    // Check if the path is a local file URI or a server-stored image
    if (item.path && item.path.startsWith('file://')) {
      return item.path; // Local file URI
    } else {
      return `${baseUrl}${item.image}`; // Server-stored image
    }
  };

  const renderClothingItem = ({ item }) => (
    <View style={styles.clothingItemContainer}>
      <Image source={{ uri: getImageUri(item) }} style={styles.clothingImage} />
      <Text style={styles.clothingText}>{item.description}</Text>
    </View>
  );

  const renderOutfit = ({ item }) => (
    <View style={styles.outfitContainer}>
      <Text style={styles.outfitName}>{item.name}</Text>
      <Text style={styles.outfitDescription}>{item.description}</Text>
      
      <Text style={styles.clothingSectionTitle}>Clothing Items:</Text>
      <FlatList
        data={item.clothing_items_list}
        keyExtractor={(clothingItem) => clothingItem._id}
        renderItem={renderClothingItem}
        horizontal
        showsHorizontalScrollIndicator={false}
      />
      
      <Text style={styles.stylingTips}>Styling Tips: {item.styling_tips}</Text>
    </View>
  );

  // FlatList with header components for inputs
  return (
    <FlatList
      ListHeaderComponent={
        <>
          <Text style={styles.header}>Outfit Suggestions</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Weather Description"
            value={weatherDescription}
            onChangeText={setWeatherDescription}
          />
          <TextInput
            style={styles.input}
            placeholder="Temperature (°C)"
            value={temperature}
            onChangeText={setTemperature}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Day Description (optional)"
            value={dayDescription}
            onChangeText={setDayDescription}
          />
          
          <TouchableOpacity style={styles.button} onPress={generateOutfits}>
            <Text style={styles.buttonText}>Generate Outfits</Text>
          </TouchableOpacity>
        </>
      }
      data={outfits}
      keyExtractor={(item) => item._id}
      renderItem={renderOutfit}
      contentContainerStyle={styles.container}
      ListEmptyComponent={<Text style={styles.noOutfitsText}>No outfits generated yet</Text>}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    borderRadius: 5,
  },
  button: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  outfitContainer: {
    marginBottom: 30,
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  outfitName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  outfitDescription: {
    fontSize: 16,
    marginBottom: 10,
  },
  clothingSectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  clothingItemContainer: {
    marginRight: 10,
    alignItems: 'center',
  },
  clothingImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  clothingText: {
    marginTop: 8,
    fontSize: 14,
    textAlign: 'center',
  },
  stylingTips: {
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 10,
  },
  noOutfitsText: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
  },
});

export default OutfitScreen;
