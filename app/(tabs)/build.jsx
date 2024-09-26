import React, { useState } from 'react';
import { View, Text, Image, FlatList, StyleSheet, ActivityIndicator, Alert, TextInput, Button } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Component to render individual clothing items with image and description
const ClothingItem = ({ item, baseUrl }) => {
  return (
    <View style={styles.clothingItemContainer}>
      <Image source={{ uri: `${baseUrl}${item.image}` }} style={styles.itemImage} />
      <Text style={styles.itemDescription}>{item.description}</Text>
    </View>
  );
};

// Main Component to render generated outfits
const GeneratedOutfitsScreen = ({ route }) => {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [weatherDescription, setWeatherDescription] = useState('');
  const [temperature, setTemperature] = useState('');
  const [dayDescription, setDayDescription] = useState('');
  const { selectedItems } = route.params;

  const baseUrl = 'https://drip-advisor-backend.vercel.app/';

  const fetchOutfits = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'No access token found.');
        setLoading(false);
        return;
      }

      const requestData = {
        weather_description: weatherDescription,
        temperature: temperature,
        day_description: dayDescription,
        base_items_ids: selectedItems,
      };

      console.log('Request Payload:', requestData);

      const response = await axios.post(
        `${baseUrl}outfits/build`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log('API Response:', response.data);
      setOutfits(response.data);
    } catch (error) {
      console.error('Error fetching outfits:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Unable to generate outfits. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render each outfit along with its clothing items
  const renderOutfit = ({ item: outfit }) => (
    <View style={styles.outfitContainer}>
      <Text style={styles.outfitTitle}>{outfit.name}</Text>
      <Text style={styles.outfitDescription}>{outfit.description}</Text>

      {/* Render Clothing Items */}
      <FlatList
        data={outfit.clothing_items_list}
        renderItem={({ item }) => <ClothingItem item={item} baseUrl={baseUrl} />}
        keyExtractor={(item) => item._id}
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      />

      <Text style={styles.stylingTips}>Styling Tips: {outfit.styling_tips}</Text>
    </View>
  );

  return (
    <FlatList
      data={outfits}
      renderItem={renderOutfit}
      keyExtractor={(item) => item._id}
      ListHeaderComponent={() => (
        <View style={styles.headerContainer}>
          <Text style={styles.header}>Generate Outfits</Text>
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
          <Button title="Generate Outfits" onPress={fetchOutfits} />
        </View>
      )}
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator size="large" color="#007bff" />
        ) : (
          <Text style={styles.noOutfitText}>No outfits generated</Text>
        )
      }
    />
  );
};

// Styles for the components
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  headerContainer: {
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
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  outfitContainer: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingBottom: 20,
  },
  outfitTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  outfitDescription: {
    fontSize: 16,
    marginBottom: 8,
  },
  stylingTips: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 10,
  },
  clothingItemContainer: {
    marginRight: 10,
    alignItems: 'center',
  },
  itemImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  itemDescription: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 5,
    width: 100,
  },
  noOutfitText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default GeneratedOutfitsScreen;
