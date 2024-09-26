import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StatusBar } from 'react-native';
import Login from "./LoginScreen";
import Register from "./Register";
import HomeScreen from "./HomeScreen";
import Uploader from './UploadImageScreen';
import Profile from './Profile';
import WardrobeScreen from './WardrobeScreen';
import DailySuggestionScreen from './DailySuggestionScreen';
import build from './build';

const Stack = createStackNavigator();

export default function App() {
  const [initialRoute, setInitialRoute] = React.useState(null);

  React.useEffect(() => {
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
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent={true}
      />
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: '#f0f0f0' }
        }}
      >
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Uploader" component={Uploader} />
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="WardrobeScreen" component={WardrobeScreen} />
        <Stack.Screen name="DailySuggestion" component={DailySuggestionScreen} />
        <Stack.Screen name="build" component={build} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
