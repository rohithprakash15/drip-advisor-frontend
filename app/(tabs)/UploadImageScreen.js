import React, { useState, useEffect } from 'react';
import { View, Button, Image, StyleSheet, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UploadImageScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // Fetch access token from AsyncStorage on component mount
  useEffect(() => {
    const getToken = async () => {
      const token = await AsyncStorage.getItem('access_token');
      setAccessToken(token);
    };
    getToken();
  }, []);

  // Function to select image from the gallery
  const selectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      console.log('Selected Image URI:', uri);
    }
  };

  // Function to take a photo using the camera
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync();
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setImageUri(uri);
      console.log('Captured Photo URI:', uri);
    }
  };

  // Function to upload the selected image
  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert('No image selected', 'Please select or take a photo first.');
      return;
    }

    if (!accessToken) {
      Alert.alert('Error', 'No access token found. Please log in.');
      return;
    }

    console.log('Uploading image as file');

    const formData = new FormData();
    const fileName = imageUri.split('/').pop();
    const fileType = `image/${fileName.split('.').pop()}`;

    // Adjust the URI to remove "file://" for iOS
    const adjustedUri = Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri;

    formData.append('image', {
      uri: adjustedUri,
      name: fileName,
      type: fileType,
    });

    try {
      const response = await axios.post(
        'https://drip-advisor-backend.vercel.app/add_clothing_item', // Backend URL
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`, // Use access token for authentication
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      Alert.alert('Image uploaded successfully!', response.data.message);
      // Optionally, reset the image URI after successful upload
      setImageUri(null); 
    } catch (error) {
      console.error('Error uploading image:', error.response ? error.response.data : error.message);
      Alert.alert('Upload failed', 'Unable to upload image. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Select Image from Gallery" onPress={selectImage} />
      <Button title="Take Photo" onPress={takePhoto} />
      {imageUri && (
        <Image source={{ uri: imageUri }} style={styles.image} />
      )}
      {imageUri && (
        <Button title="Upload Photo" onPress={uploadImage} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    marginTop: 20,
    width: 200,
    height: 200,
    borderRadius: 10,
  },
});

export default UploadImageScreen;
