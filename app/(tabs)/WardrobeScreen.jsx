import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Alert } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const WardrobeScreen = () => {
  const [clothingItems, setClothingItems] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const baseUrl = 'https://drip-advisor-backend.vercel.app/';

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

  // Fetch clothing items from the backend API only when token is available
  useEffect(() => {
    if (accessToken) {
      const fetchClothingItems = async () => {
        try {
          const response = await axios.get(
            'https://drip-advisor-backend.vercel.app/wardrobe',
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          );
          setClothingItems(response.data);
        } catch (error) {
          console.error('Error fetching clothing items:', error.response ? error.response.data : error.message);
          Alert.alert('Error', 'Unable to fetch clothing items. Please try again.');
        }
      };

      fetchClothingItems();
    }
  }, [accessToken]);

  const getImageUri = (item) => {
    // Check if the path is a local file URI or a server-stored image
    if (item.path && item.path.startsWith('file://')) {
      return item.path; // Local file URI
    } else {
      return `${baseUrl}${item.image}`; // Server-stored image
    }
  };

  const renderClothingItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: getImageUri(item) }} style={styles.image} />
      <Text style={styles.itemText}>{item.description}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Wardrobe</Text>
      {clothingItems.length > 0 ? (
        <FlatList
          data={clothingItems}
          keyExtractor={(item) => item._id}
          renderItem={renderClothingItem}
        />
      ) : (
        <Text style={styles.noItemsText}>No clothing items found</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  itemContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
  },
  itemText: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  noItemsText: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default WardrobeScreen;
