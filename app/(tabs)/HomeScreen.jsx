import React from 'react';
import { Button, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';

function HomeScreen() {
  const navigation = useNavigation();  // Use navigation hook

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        title="Go to Uploader"
        onPress={() => navigation.navigate('Uploader')}  // Navigates to Uploader screen
      />
    </View>
  );
}

export default HomeScreen;
