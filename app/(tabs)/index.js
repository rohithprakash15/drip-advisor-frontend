import React, { useEffect, useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Login from "./LoginScreen";
import Register from "./Register";
import HomeScreen from "./HomeScreen";
import Uploader from './UploadImageScreen';  // Ensure the correct path
import Profile from './Profile';
import Gemini from './Gemini';
import UserSuggestion from "./UserSuggestion";
import WardrobeScreen from './WardrobeScreen';
const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    const checkAccessToken = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        setInitialRoute(token ? 'Home' : 'Register');
      } catch (e) {
        console.error("Failed to fetch the access token", e);
      }
    };
    checkAccessToken();
  }, []);

  if (!initialRoute) {
    return null;  // Show splash screen or loader here if needed
  }

  return (
    <NavigationContainer independent={true}>
      <Stack.Navigator initialRouteName={initialRoute}>
        <Stack.Screen name="Login" component={Login} options={{ title: 'Login' }} />
        <Stack.Screen name="Register" component={Register} options={{ title: 'Register' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
        <Stack.Screen name="Uploader" component={Uploader} options={{ title: 'Uploader' }} />
        <Stack.Screen name="Profile" component={Profile} options={{ title: 'Profile' }} />
        <Stack.Screen name="UserSuggestion" component={UserSuggestion} options={{ title: 'UserSuggestion' }} />
        <Stack.Screen name="Gemini" component={Gemini} options={{ title: 'Gemini' }} />
        <Stack.Screen name="WardrobeScreen" component={WardrobeScreen} options={{ title: 'WardrobeScreen' }} />
  
      </Stack.Navigator>
    </NavigationContainer>
  );
}
