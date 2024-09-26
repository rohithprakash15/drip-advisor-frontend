import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Checkbox } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native'; // Import the useNavigation hook

const WardrobeScreen = () => {
  const [clothingItems, setClothingItems] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const baseUrl = 'https://drip-advisor-backend.vercel.app/';
  const navigation = useNavigation(); // Initialize navigation

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
    if (item.path && item.path.startsWith('file://')) {
      return item.path;
    } else {
      return `${baseUrl}${item.image}`;
    }
  };

  const handleCheckboxToggle = (id) => {
    setSelectedItems((prevSelectedItems) =>
      prevSelectedItems.includes(id)
        ? prevSelectedItems.filter((itemId) => itemId !== id)
        : [...prevSelectedItems, id]
    );
  };

  const handleBuildPress = () => {
    if (selectedItems.length > 0) {
      // Navigate to the Build screen with selected items
      navigation.navigate('build', { selectedItems });
    } else {
      Alert.alert('No items selected', 'Please select items to build your outfit.');
    }
  };

  const renderClothingItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: getImageUri(item) }} style={styles.image} />
      <Text style={styles.itemText}>{item.description}</Text>
      <View style={styles.checkboxContainer}>
        <Checkbox
          status={selectedItems.includes(item._id) ? 'checked' : 'unchecked'}
          onPress={() => handleCheckboxToggle(item._id)}
        />
        <Text style={styles.checkboxText}>Select</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Wardrobe</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {clothingItems.length > 0 ? (
          <FlatList
            data={clothingItems}
            keyExtractor={(item) => item._id}
            renderItem={renderClothingItem}
          />
        ) : (
          <Text style={styles.noItemsText}>No clothing items found</Text>
        )}

        <TouchableOpacity style={styles.buildButton} onPress={handleBuildPress}>
          <Text style={styles.buildButtonText}>Build</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
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
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  checkboxText: {
    marginLeft: 8,
    fontSize: 16,
  },
  noItemsText: {
    fontSize: 16,
    textAlign: 'center',
  },
  buildButton: {
    backgroundColor: '#007bff',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buildButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WardrobeScreen;