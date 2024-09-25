import React, { useState, useEffect } from 'react';
import { View, Button, Image, StyleSheet, Alert, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UploadImageScreen = () => {
  const [imageUri, setImageUri] = useState(null);
  const [accessToken, setAccessToken] = useState(null);

  // Retrieve the access token when the component mounts
  useEffect(() => {
    const getToken = async () => {
      const token = await AsyncStorage.getItem('access_token');
      setAccessToken(token);
    };
    getToken();
  }, []);

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
    const fileType = `image/${fileName.split('.').pop()}`; // Dynamically get the file type

    const adjustedUri = Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri;

    // Append the image file to the form data
    formData.append('image', {
      uri: adjustedUri,
      name: fileName,
      type: fileType,
    });

    try {
      const response = await axios.post(
        'https://drip-advisor-backend.vercel.app/add_clothing_item',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`, // Use the access token
            'Content-Type': 'multipart/form-data', // Important to set this for file uploads
          },
        }
      );
      Alert.alert('Image uploaded successfully!', response.data.message);
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
