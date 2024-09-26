import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  Button, 
  FlatList, 
  StyleSheet, 
  Alert, 
  Image, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView 
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GeneratedOutfitsScreen = ({ route }) => {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const baseUrl = 'https://drip-advisor-backend.vercel.app/';
  
  const [weatherDescription, setWeatherDescription] = useState(''); 
  const [temperature, setTemperature] = useState(''); 
  const [dayDescription, setDayDescription] = useState(''); 
  const { selectedItems } = route.params;

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

  const generateOutfits = async () => {
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
        temperature: parseFloat(temperature),
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
      console.error('Error generating outfits:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Unable to generate outfits. Please try again.');
    } finally {
      setLoading(false);
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
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView>
        <TextInput
          placeholder="Weather Description"
          value={weatherDescription}
          onChangeText={setWeatherDescription}
          style={styles.input}
          blurOnSubmit={false}
        />
        <TextInput
          placeholder="Temperature (°C)"
          value={temperature}
          onChangeText={setTemperature}
          keyboardType="numeric"
          style={styles.input}
          blurOnSubmit={false}
        />
        <TextInput
          placeholder="Day Description"
          value={dayDescription}
          onChangeText={setDayDescription}
          style={styles.input}
          blurOnSubmit={false}
        />
        <Button title="Generate Outfits" onPress={generateOutfits} disabled={loading} />
        
        {loading ? (
          <Text>Loading...</Text>
        ) : (
          <FlatList
            data={outfits}
            keyExtractor={(item) => item._id}
            renderItem={renderOutfit}
            showsVerticalScrollIndicator={false}
          />
        )}
      </ScrollView>
    </KeyboardAvoidingView>
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

export default GeneratedOutfitsScreen;
