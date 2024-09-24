import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  SafeAreaView,
  FlatList,
} from 'react-native';

const UserSuggestion = () => {
  const [outfitCombinations, setOutfitCombinations] = useState([]);

  useEffect(() => {
    const fetchOutfits = async () => {
      try {
        const response = await fetch('https://drip-advisor-backend.vercel.app/outfits', {
          method: 'GET',
          headers: {
            Authorization: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTcyNzE0ODgzNywianRpIjoiNzk4NjFlOTktMDU5ZC00NTI2LWI1OTUtNjFjODk4ODIzNmRjIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjIyejIzM0Bwc2d0ZWNoLmFjLmluIiwibmJmIjoxNzI3MTQ4ODM3LCJjc3JmIjoiNzJlMDgxZjQtNWJmNy00MjRhLTljMjgtOGFhMjc5YmNlMGVlIiwiZXhwIjoxNzI3MjM1MjM3fQ.XyG4NkkiMkH6na1eKRAdLjTiFSDSSOamzS2SkXIu2FE',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch outfits');
        }

        const data = await response.json();
        setOutfitCombinations(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchOutfits();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Outfit Suggestions</Text>
      <FlatList
        data={outfitCombinations}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.outfitContainer}>
            <Text style={styles.outfitName}>{item.name}</Text>
            <Text style={styles.outfitDescription}>{item.description}</Text>
            <View style={styles.clothingItems}>
              {item.clothing_item_ids.map((itemId) => (
                <Image
                  key={itemId}
                  source={{ uri: `https://example.com/clothing_items/${itemId}/thumbnail` }} // Replace with actual image URL
                  style={styles.clothingItemImage}
                />
              ))}
            </View>
            <Text style={styles.stylingTips}>Styling Tips: {item.styling_tips}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  outfitContainer: {
    marginVertical: 10,
    paddingHorizontal: 10,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 5,
    width: '100%',
  },
  outfitName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  outfitDescription: {
    marginVertical: 5,
  },
  clothingItems: {
    flexDirection: 'row',
    marginVertical: 5,
    flexWrap: 'wrap',
  },
  clothingItemImage: {
    width: 50,
    height: 50,
    marginRight: 5,
    resizeMode: 'contain',
  },
  stylingTips: {
    marginTop: 5,
    fontStyle: 'italic',
  },
});

export default UserSuggestion;