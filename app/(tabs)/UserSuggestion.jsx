import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  FlatList,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserSuggestion = () => {
  const [outfitCombinations, setOutfitCombinations] = useState([]);
  const [accessToken, setAccessToken] = useState(null);

  // Retrieve the access token when the component mounts
  useEffect(() => {
    const getToken = async () => {
      const token = await AsyncStorage.getItem('access_token');
      setAccessToken(token);
      fetchOutfits(token); // Fetch outfits after setting the token
    };
    getToken();
  }, []);

  const fetchOutfits = async (token) => {
    try {
      const response = await fetch('https://drip-advisor-backend.vercel.app/outfits', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`, // Use the retrieved access token
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch outfits');
      }

      const data = await response.json();
      setOutfitCombinations(data);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to load outfits. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Outfit Suggestions</Text>
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
                  source={{ uri: `https://example.com/clothing_items/${itemId}/thumbnail` }} // Replace with actual image URL
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
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