import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, Alert, ScrollView, Platform, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Ionicons } from '@expo/vector-icons';

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

  // Function to take a photo using the camera and save it to a specific folder
  const takePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert('Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync();
    if (!result.canceled) {
      const uri = result.assets[0].uri;
      // Move the file to a specific folder on the device
      const newPath = `${FileSystem.documentDirectory}photos/${Date.now()}.jpg`;
      await FileSystem.moveAsync({
        from: uri,
        to: newPath,
      });
      setImageUri(newPath);
      console.log('Saved Photo Path:', newPath);
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

    const formData = new FormData();
    const fileName = imageUri.split('/').pop();
    const fileType = 'image/jpeg'; // Assuming JPEG format, adjust if needed

    // Append the file
    formData.append('image', {
      uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
      type: fileType,
      name: fileName,
    });

    // Append other necessary fields
    formData.append('path', imageUri);

    try {
      const response = await axios.post(
        'https://drip-advisor-backend.vercel.app/add_clothing_item',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data',
            'Accept': 'application/json',
          },
        }
      );

      console.log('Upload Response:', response.data);
      Alert.alert('Success', 'Image uploaded successfully!');
      setImageUri(null);
    } catch (error) {
      console.error('Error uploading image:', error.response ? error.response.data : error.message);
      Alert.alert('Upload failed', 'Unable to upload image. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Ionicons name="cloud-upload-outline" size={80} color="#50C2C9" />
          <Text style={styles.headerText}>Add to Your Wardrobe</Text>
        </View>

        <Text style={styles.descriptionText}>
          Capture or select images of your clothing items to expand your digital wardrobe. 
          This helps us provide better outfit recommendations tailored to your style! Don't worry! These images are not shared with anyone. They are stored securely on your device.
        </Text>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={takePhoto}>
            <Ionicons name="camera-outline" size={24} color="#fff" />
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button} onPress={selectImage}>
            <Ionicons name="images-outline" size={24} color="#fff" />
            <Text style={styles.buttonText}>Select Image</Text>
          </TouchableOpacity>
        </View>
        
        {imageUri ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            <TouchableOpacity style={styles.uploadButton} onPress={uploadImage}>
              <Text style={styles.uploadButtonText}>Upload to Wardrobe</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.placeholderContainer}>
            <Ionicons name="shirt-outline" size={100} color="#ccc" />
            <Text style={styles.placeholderText}>No image selected</Text>
          </View>
        )}

        <View style={styles.tipsContainer}>
          <Text style={styles.tipsHeader}>Tips for Great Wardrobe Photos:</Text>
          <Text style={styles.tipText}>• Use good lighting for accurate colors</Text>
          <Text style={styles.tipText}>• Capture items against a plain background</Text>
          <Text style={styles.tipText}>• Include the full item in the frame</Text>
          <Text style={styles.tipText}>• Take photos of individual items separately</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  descriptionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#50C2C9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '45%',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginTop: 5,
  },
  previewContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  previewImage: {
    width: 250,
    height: 250,
    borderRadius: 10,
    marginBottom: 20,
  },
  uploadButton: {
    backgroundColor: '#50C2C9',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    width: '100%',
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholderContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 250,
    borderWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dashed',
    borderRadius: 10,
    marginTop: 20,
  },
  placeholderText: {
    color: '#999',
    fontSize: 16,
    marginTop: 10,
  },
  tipsContainer: {
    marginTop: 30,
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
  },
  tipsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
});

export default UploadImageScreen;