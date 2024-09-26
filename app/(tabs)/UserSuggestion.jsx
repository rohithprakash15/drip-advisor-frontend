import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  FlatList,
  Alert,
  TextInput,
  Button
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserSuggestion = () => {
  const [outfitCombinations, setOutfitCombinations] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [dayDescription, setDayDescription] = useState(''); // State for user input
  const weatherDescription = "sunny with moderate humidity"; // Static weather description
  const temperature = 33; // Static temperature

  // Retrieve the access token when the component mounts
  useEffect(() => {
    const getToken = async () => {
      const token = await AsyncStorage.getItem('access_token');
      setAccessToken(token);
    };
    getToken();
  }, []);

  const generateOutfits = async (token) => {
    try {
      const response = await fetch('https://drip-advisor-backend.vercel.app/outfits/generate', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`, // Use the retrieved access token
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weather_description: weatherDescription,
          day_description: dayDescription,
          temperature: temperature,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate outfits');
      }

      const data = await response.json();
      setOutfitCombinations(data.slice(0, 3)); // Display only the top 3 outfits
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load outfit suggestions. Please try again.');
    }
  };

  const handleGenerateOutfits = () => {
    if (!dayDescription.trim()) {
      Alert.alert('Input Required', 'Please enter a description of your day.');
      return;
    }
    if (accessToken) {
      generateOutfits(accessToken);
    } else {
      Alert.alert('Error', 'No access token found. Please log in.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Outfit Suggestions</Text>
      
      {/* Display static weather and temperature */}
      <Text style={styles.weatherInfo}>Weather: {weatherDescription}</Text>
      <Text style={styles.weatherInfo}>Temperature: {temperature}°C</Text>

      {/* Input for day description */}
      <TextInput
        style={styles.input}
        placeholder="Describe your day"
        value={dayDescription}
        onChangeText={setDayDescription}
      />
      
      <Button title="Get Outfit Suggestions" onPress={handleGenerateOutfits} />

      <FlatList
        data={outfitCombinations}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.outfitContainer}>
            <Text style={styles.outfitName}>{item.name}</Text>
            <Text style={styles.outfitDescription}>{item.description}</Text>
            <View style={styles.clothingItems}>
              {item.clothing_item_ids.map((itemId) => (
                <Image
                  key={itemId}
                  source={{ uri: `https://example.com/clothing_items/${itemId}/thumbnail` }} // Replace with actual image URL or local path
                  style={styles.clothingItemImage}
                />
              ))}
            </View>
            <Text style={styles.stylingTips}>Styling Tips: {item.styling_tips}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'flex-start',
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  weatherInfo: {
    fontSize: 16,
    marginBottom: 10,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: '#ccc',
    borderWidth: 1,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  outfitContainer: {
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    width: '100%',
  },
  outfitName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  outfitDescription: {
    marginVertical: 5,
  },
  clothingItems: {
    flexDirection: 'row',
    marginVertical: 5,
    flexWrap: 'wrap',
  },
  clothingItemImage: {
    width: 50,
    height: 50,
    marginRight: 5,
    resizeMode: 'contain',
  },
  stylingTips: {
    marginTop: 5,
    fontStyle: 'italic',
  },
});

export default UserSuggestion;



