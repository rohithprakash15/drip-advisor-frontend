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
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StatusBar,
  Animated
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { handleTokenExpiration } from '../../app/tokenUtils';
import { useNavigation } from '@react-navigation/native';

const ShimmerPlaceholder = ({ width, height }) => {
  const [fadeAnim] = useState(new Animated.Value(0.3));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.shimmer,
        {
          width,
          height,
          opacity: fadeAnim,
        },
      ]}
    />
  );
};

const GeneratedOutfitsScreen = ({ route }) => {
  const navigation = useNavigation();
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const baseUrl = 'https://drip-advisor-backend.vercel.app/';
  
  const [weatherDescription, setWeatherDescription] = useState('');
  const [temperature, setTemperature] = useState('');
  const [loadingWeather, setLoadingWeather] = useState(true);

  const [dayDescription, setDayDescription] = useState('');
  const selectedItems = route?.params?.selectedItems || []; // Use optional chaining and provide a default value

  const [outfitsGenerated, setOutfitsGenerated] = useState(false);

  useEffect(() => {
    const getTokenAndWeather = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          setAccessToken(token);
          const storedWeatherDescription = await AsyncStorage.getItem('weatherDescription');
          const storedTemperature = await AsyncStorage.getItem('temperature');
          
          if (storedWeatherDescription && storedTemperature) {
            setWeatherDescription(storedWeatherDescription);
            setTemperature(storedTemperature);
            setLoadingWeather(false);
          } else {
            await fetchWeatherData(token);
          }
        } else {
          console.log('No access token found.');
        }
      } catch (error) {
        console.error('Error retrieving token or weather:', error);
      }
    };
    getTokenAndWeather();
  }, []);

  const fetchWeatherData = async (token) => {
    setLoadingWeather(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      let geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      let city = geocode[0]?.city || 'Unknown';

      const response = await axios.get(
        `${baseUrl}get_weather`,
        { location: city },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );

      await AsyncStorage.setItem('weatherDescription', response.data.weather_description);
      await AsyncStorage.setItem('temperature', response.data.temperature.toString());

      setWeatherDescription(response.data.weather_description);
      setTemperature(response.data.temperature.toString());
    } catch (error) {
      console.error('Error fetching weather:', error);
      if (error.response && error.response.data.msg === "Token has expired") {
        handleTokenExpiration(navigation);
      } else {
        Alert.alert('Error', 'Unable to fetch weather data. Please try again.');
      }
    } finally {
      setLoadingWeather(false);
    }
  };

  const generateOutfits = async () => {
    if (!weatherDescription || !temperature) {
      Alert.alert('Missing Information', 'Please fill in weather description and temperature before generating outfits.');
      return;
    }

    setLoading(true);
    setOutfitsGenerated(true);
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
        day_description: dayDescription || undefined, // Day description is already optional
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
      // Filter out outfits with only one clothing item
      const filteredOutfits = response.data.filter(outfit => outfit.clothing_items_list.length > 1);
      setOutfits(filteredOutfits);
    } catch (error) {
      console.error('Error generating outfits:', error.response ? error.response.data : error.message);
      if (error.response && error.response.data.msg === "Token has expired") {
        handleTokenExpiration(navigation);
      } else {
        Alert.alert('Error', 'Unable to generate outfits. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const markOutfitAsUsed = async (outfitId) => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'No access token found.');
        return;
      }

      const response = await axios.post(
        `${baseUrl}outfits/use/${outfitId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Alert.alert('Success', response.data.message || 'Outfit marked as used!');
      // Refresh the outfits list or update the local state to reflect the change
      setOutfits(outfits.map(outfit => 
        outfit._id === outfitId ? { ...outfit, isUsed: true } : outfit
      ));
    } catch (error) {
      console.error('Error marking outfit as used:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Unable to mark outfit as used. Please try again.');
    }
  };

  const renderOutfit = ({ item }) => (
    <View style={styles.outfitContainer}>
      {loading ? (
        <ShimmerPlaceholder width={300} height={400} />
      ) : (
        <>
          <Text style={styles.outfitName}>{item.name}</Text>
          <Text style={styles.outfitDescription}>{item.description}</Text>
          <Text style={styles.stylingTips}>{item.styling_tips}</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clothingItemsScroll}>
            {item.clothing_items_list.map((clothingItem) => (
              <View key={clothingItem._id} style={styles.clothingItemContainer}>
                {loading ? (
                  <ShimmerPlaceholder width={100} height={100} />
                ) : (
                  <Image 
                    source={{ uri: clothingItem.path }} 
                    style={styles.clothingImage}
                    onLoad={() => console.log('Image loaded:', clothingItem.path)}
                    onError={(error) => console.error('Image load error:', error)}
                  />
                )}
              </View>
            ))}
          </ScrollView>
          
          <TouchableOpacity 
            onPress={() => markOutfitAsUsed(item._id)} 
            style={[styles.useButton, item.isUsed && styles.usedButton]}
            disabled={item.isUsed}
          >
            <Text style={styles.useButtonText}>
              {item.isUsed ? 'Outfit Used' : 'Use This Outfit'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );

  const refreshWeather = async () => {
    setLoadingWeather(true);
    try {
      const token = await AsyncStorage.getItem('access_token');
      if (!token) {
        Alert.alert('Error', 'No access token found.');
        return;
      }
      await fetchWeatherData(token);
    } catch (error) {
      console.error('Error refreshing weather:', error);
      Alert.alert('Error', 'Unable to refresh weather data. Please try again.');
    } finally {
      setLoadingWeather(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <Text style={styles.pageTitle}>Daily Suggestions</Text>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.weatherContainer}>
          <View style={styles.weatherInputs}>
            <View style={styles.inputContainer}>
              <Ionicons name="cloudy-outline" size={24} color="#666" style={styles.inputIcon} />
              <TextInput
                placeholder="Weather Description"
                value={weatherDescription}
                onChangeText={setWeatherDescription}
                style={styles.input}
                editable={!loadingWeather}
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
                editable={!loadingWeather}
              />
            </View>
          </View>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={refreshWeather}
            disabled={loadingWeather}
          >
            {loadingWeather ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Ionicons name="refresh" size={24} color="#fff" />
            )}
          </TouchableOpacity>
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
        
        {outfitsGenerated && (
          <View style={styles.outfitsContainer}>
            {[0, 1, 2].map((index) => (
              <View key={index} style={styles.outfitContainer}>
                {loading ? (
                  <ShimmerPlaceholder width="100%" height={400} />
                ) : (
                  outfits[index] && renderOutfit({ item: outfits[index] })
                )}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  scrollContent: {
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
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
    paddingHorizontal: 16,
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
  shimmer: {
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
  },
  weatherContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  weatherInputs: {
    flex: 1,
  },
  refreshButton: {
    backgroundColor: '#50C2C9',
    padding: 10,
    borderRadius: 5,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
  },
});

export default GeneratedOutfitsScreen;