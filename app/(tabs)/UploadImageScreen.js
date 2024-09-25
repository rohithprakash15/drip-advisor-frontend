import React, { useState } from "react";
import { View, Button, Image, StyleSheet, Alert } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Camera } from "expo-camera";
import axios from "axios";

const UploadImageScreen = () => {
  const [imageUri, setImageUri] = useState(null);

  const selectImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access gallery is required!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync();
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    const permissionResult = await Camera.requestCameraPermissionsAsync();
    if (permissionResult.granted === false) {
      Alert.alert("Permission to access camera is required!");
      return;
    }
    const result = await ImagePicker.launchCameraAsync();
    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const uploadImage = async () => {
    if (!imageUri) {
      Alert.alert("No image selected", "Please select or take a photo first.");
      return;
    }

    // Create FormData to send to the server
    const formData = new FormData();

    // Append the image file with correct properties
    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg", // Adjust this based on your image type
      name: `clothing_item.jpg`, // You can change this name as necessary
    });

    try {
      const token = "YOUR_ACCESS_TOKEN"; // Replace with the valid token
      const response = await axios.post(
        "https://drip-advisor-backend.vercel.app/add_clothing_item",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      Alert.alert("Image uploaded successfully!", response.data.message);
    } catch (error) {
      console.error(
        "Error uploading image:",
        error.response ? error.response.data : error.message
      );
      Alert.alert("Upload failed", "Unable to upload image. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Select Image from Gallery" onPress={selectImage} />
      <Button title="Take Photo" onPress={takePhoto} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      {imageUri && <Button title="Upload Photo" onPress={uploadImage} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
