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
  ActivityIndicator,
  Animated
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
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

const WEATHER_FETCH_TASK = 'WEATHER_FETCH_TASK';

TaskManager.defineTask(WEATHER_FETCH_TASK, async () => {
  try {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      await fetchWeatherData(token);
    }
    return BackgroundFetch.Result.NewData;
  } catch (error) {
    console.error('Background fetch failed:', error);
    return BackgroundFetch.Result.Failed;
  }
});

const DailySuggestionScreen = () => {
  const navigation = useNavigation();
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [accessToken, setAccessToken] = useState(null);
  const baseUrl = 'https://drip-advisor-backend.vercel.app/';
  
  const [weatherDescription, setWeatherDescription] = useState('');
  const [temperature, setTemperature] = useState('');
  const [loadingWeather, setLoadingWeather] = useState(true);
  const [dayDescription, setDayDescription] = useState('');
  const [outfitsGenerated, setOutfitsGenerated] = useState(false);

  useEffect(() => {
    const setupBackgroundFetch = async () => {
      try {
        await BackgroundFetch.registerTaskAsync(WEATHER_FETCH_TASK, {
          minimumInterval: 60 * 60 * 24, // 24 hours
          stopOnTerminate: false,
          startOnBoot: true,
        });

        // Schedule the task to run at 7 AM
        const now = new Date();
        const scheduledTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 7, 0, 0, 0);
        if (now > scheduledTime) {
          scheduledTime.setDate(scheduledTime.getDate() + 1);
        }
        const msUntil7AM = scheduledTime.getTime() - now.getTime();

        setTimeout(() => {
          BackgroundFetch.scheduleTaskAsync(WEATHER_FETCH_TASK, {
            minimumInterval: 60 * 60 * 24, // 24 hours
            startOnBoot: true,
          });
        }, msUntil7AM);

      } catch (error) {
        console.error('Failed to register background fetch:', error);
      }
    };

    setupBackgroundFetch();

    const getTokenAndWeather = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          setAccessToken(token);
          await fetchWeatherData(token);
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
      console.log('City:', city);

      const response = await axios.post(
        `${baseUrl}get_weather`,
        { location: city },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        }
      );
      console.log('Weather response:', response);
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

  const generateOutfits = async () => {
    if (!weatherDescription || !temperature) {
      Alert.alert('Missing Information', 'Please fill in weather description and temperature before generating outfits.');
      return;
    }

    setLoading(true);
    setOutfitsGenerated(true);
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
      if (error.response && error.response.data.msg === "Token has expired") {
        handleTokenExpiration(navigation);
      } else {
        Alert.alert('Error', 'Unable to generate outfits. Please try again.');
      }
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
      {loading ? (
        <ShimmerPlaceholder width={100} height={100} />
      ) : (
        <>
          <Text style={styles.outfitName}>{item.name}</Text>
          <Text style={styles.outfitDescription}>{item.description}</Text>
          <Text style={styles.stylingTips}>{item.styling_tips}</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.clothingItemsScroll}>
            {item.clothing_items_list.map((clothingItem) => (
              <View key={clothingItem._id} style={styles.clothingItemContainer}>
                <Image 
                  source={{ uri: clothingItem.path }} 
                  style={styles.clothingImage}
                  onLoad={() => console.log('Image loaded:', clothingItem.path)}
                  onError={(error) => console.error('Image load error:', error)}
                />
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
        </>
      )}
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
                    outfits[index] && renderOutfit(outfits[index])
                  )}
                </View>
              ))}
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

export default DailySuggestionScreen;