import React, { useState } from 'react';
import { View, Button, Image, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'expo-camera';
import axios from 'axios';

const UploadImageScreen = () => {
  const [imageUri, setImageUri] = useState(null);

  const selectImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission to access gallery is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ base64: true });
    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setImageUri(imageUri);
      await uploadImage(imageUri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await Camera.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert('Permission to access camera is required!');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({ base64: true });
    if (!result.canceled) {
      const imageUri = result.assets[0].uri;
      setImageUri(imageUri);
      await uploadImage(imageUri);
    }
  };

  const uploadImage = async (uri) => {
    // Extract file extension to determine MIME type
    const fileType = uri.split('.').pop();
    const mimeType = fileType === 'jpg' || fileType === 'jpeg' ? 'image/jpeg' : `image/${fileType}`;

    const formData = new FormData();
    formData.append('image', {
      uri: uri.startsWith('file://') ? uri : `file://${uri}`,  // Ensure proper URI format for Android
      type: mimeType,  // Correct MIME type, e.g., 'image/jpeg'
      name: `clothing_item.${fileType}`  // Use file extension from the URI
    });

    try {
      const token = 'YOUR_ACCESS_TOKEN';  // Replace with the valid access token
      const response = await axios.post(
        'https://drip-advisor-backend.vercel.app/add_clothing_item',
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
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
