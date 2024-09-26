import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Alert, 
  Image, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform, 
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

const DailySuggestionScreen = () => {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const baseUrl = 'https://drip-advisor-backend.vercel.app/';
  
  const [weatherDescription, setWeatherDescription] = useState('sunny with moderate humidity');
  const [temperature, setTemperature] = useState('33');
  const [dayDescription, setDayDescription] = useState('');

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
    if (!weatherDescription || !temperature) {
      Alert.alert('Missing Information', 'Please fill in weather description and temperature before generating outfits.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${baseUrl}outfits/generate`,
        {
          weather_description: weatherDescription,
          temperature: parseFloat(temperature),
          day_description: dayDescription || undefined // Make day_description optional
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
    } finally {
      setLoading(false);
    }
  };

  const useOutfit = async (outfitId) => {
    try {
      const response = await axios.post(
        `${baseUrl}outfits/use/${outfitId}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          }
        }
      );

      Alert.alert('Success', 'Outfit used successfully! Items are now unavailable for 48 hours.');
      // Update the local state to reflect the change
      setOutfits(outfits.map(outfit => 
        outfit._id === outfitId ? { ...outfit, isUsed: true } : outfit
      ));
    } catch (error) {
      console.error('Error using outfit:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Unable to use outfit. Please try again.');
    }
  };

  const renderOutfit = (item) => (
    <View key={item._id} style={styles.outfitContainer}>
      <Text style={styles.outfitName}>{item.name}</Text>
      <Text style={styles.outfitDescription}>{item.description}</Text>
      <Text style={styles.stylingTips}>{item.styling_tips}</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clothingItemsScroll}>
        {item.clothing_items_list.map((clothingItem) => (
          <View key={clothingItem._id} style={styles.clothingItemContainer}>
            <Image source={{ uri: clothingItem.path }} style={styles.clothingImage} />
          </View>
        ))}
      </ScrollView>
      
      <TouchableOpacity 
        onPress={() => useOutfit(item._id)} 
        style={[styles.useButton, item.isUsed && styles.usedButton]}
        disabled={item.isUsed}
      >
        <Text style={styles.useButtonText}>
          {item.isUsed ? 'Outfit Used' : 'Use This Outfit'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <Text style={styles.pageTitle}>Daily Suggestions</Text>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.inputContainer}>
            <Ionicons name="cloudy-outline" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              placeholder="Weather Description"
              value={weatherDescription}
              onChangeText={setWeatherDescription}
              style={styles.input}
            />
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="thermometer-outline" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              placeholder="Temperature (°C)"
              value={temperature}
              onChangeText={setTemperature}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
          <View style={styles.inputContainer}>
            <Ionicons name="calendar-outline" size={24} color="#666" style={styles.inputIcon} />
            <TextInput
              placeholder="Describe your day (Optional)"
              value={dayDescription}
              onChangeText={setDayDescription}
              style={styles.input}
            />
          </View>
          <TouchableOpacity style={styles.generateButton} onPress={generateOutfits} disabled={loading}>
            <Text style={styles.generateButtonText}>Generate Outfits</Text>
          </TouchableOpacity>
          
          {loading ? (
            <ActivityIndicator size="large" color="#50C2C9" style={styles.loader} />
          ) : (
            <View style={styles.outfitsContainer}>
              {outfits.map(renderOutfit)}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 10,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  
  
  scrollContent: {
    flexGrow: 1,
    padding: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
  },
  generateButton: {
    backgroundColor: '#50C2C9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 20,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 20,
  },
  outfitsContainer: {
    marginTop: 20,
  },
  outfitContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  outfitName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  outfitDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  stylingTips: {
    fontStyle: 'italic',
    color: '#50C2C9',
    marginBottom: 10,
  },
  clothingItemsScroll: {
    marginBottom: 15,
  },
  clothingItemContainer: {
    marginRight: 15,
    alignItems: 'center',
  },
  clothingImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  useButton: {
    backgroundColor: '#50C2C9',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  usedButton: {
    backgroundColor: '#ccc',
  },
  useButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 16,
  },
});

export default DailySuggestionScreen;
