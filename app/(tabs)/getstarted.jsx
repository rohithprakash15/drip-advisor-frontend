import React from 'react';
import { View, Text, SafeAreaView, Image, StyleSheet, TouchableOpacity } from 'react-native';

const firstImage = require('./../../media/firstImage.png');

function GetStarted() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={firstImage} style={styles.image} />
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Government of India</Text>
      </View>
      <View style={styles.captionContainer}>
        <Text style={styles.captionText}>Welcome to the Local Body Awareness and Query System</Text>
      </View>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={() => { }}>
          <Text style={styles.buttonText}>Get Started</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    marginBottom: 20, // Increased margin to provide space between the image and the title
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 200,
    resizeMode: 'contain',
  },
  titleContainer: {
    marginBottom: 10, // Space between the title and the caption
  },
  title: {
    fontWeight: 'bold',
    fontSize: 20, // Adjusted font size for better visibility
    textAlign: 'center',
  },
  captionContainer: {
    marginBottom: 20, // Space between the caption and the button
    paddingHorizontal: 10,
  },
  captionText: {
    textAlign: 'center',
    fontSize: 16,
  },
  buttonContainer: {
    marginBottom: 20, // Space below the button if needed
    alignItems: 'center',
  },
  button: {
    width: 200,
    height: 40,
    backgroundColor: '#50C2C9',
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontFamily: 'Poppins',
    color: 'white',
    fontSize: 14,
  },
});

export default GetStarted;