import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { CommonActions } from '@react-navigation/native';

export const handleTokenExpiration = async (navigation) => {
  await AsyncStorage.removeItem('access_token');
  
  Alert.alert(
    "Session Expired",
    "Your session has expired. Please log in again.",
    [
      { text: "OK", onPress: () => {
        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        );
      }}
    ]
  );
};