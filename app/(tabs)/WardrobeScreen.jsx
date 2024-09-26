import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, StyleSheet, Alert, TouchableOpacity, Platform, Modal } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const Dropdown = ({ options, selectedValue, onSelect, label }) => {
  const [visible, setVisible] = useState(false);
  const [dropdownLayout, setDropdownLayout] = useState({});

  const measureDropdown = (event) => {
    setDropdownLayout(event.nativeEvent.layout);
  };

  return (
    <View style={styles.dropdownContainer} onLayout={measureDropdown}>
      <Text style={styles.dropdownLabel}>{label}</Text>
      <TouchableOpacity style={styles.dropdownButton} onPress={() => setVisible(true)}>
        <Text style={styles.dropdownButtonText}>{options.find(opt => opt.value === selectedValue).label}</Text>
        <Ionicons name="chevron-down" size={24} color="#50C2C9" />
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="none">
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setVisible(false)}
        >
          <View style={[
            styles.dropdown, 
            { 
              position: 'absolute',
              top: dropdownLayout.y + dropdownLayout.height,
              left: dropdownLayout.x,
              width: dropdownLayout.width,
            }
          ]}>
            {options.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={styles.dropdownItem}
                onPress={() => {
                  onSelect(item.value);
                  setVisible(false);
                }}
              >
                <Text style={styles.dropdownItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const WardrobeScreen = () => {
  const [clothingItems, setClothingItems] = useState([]);
  const [accessToken, setAccessToken] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [longPressSelectedItems, setLongPressSelectedItems] = useState([]);
  const baseUrl = 'https://drip-advisor-backend.vercel.app/';
  const navigation = useNavigation();
  const [filter, setFilter] = useState('all'); // New state for filter
  const [frequencySort, setFrequencySort] = useState('desc');
  const [dateSort, setDateSort] = useState('desc');

  // Fetch access token from AsyncStorage on component mount
  useEffect(() => {
    const getToken = async () => {
      try {
        const token = await AsyncStorage.getItem('access_token');
        if (token) {
          setAccessToken(token);
        } else {
          console.log('No access token found.');
        }
      } catch (error) {
        console.error('Error retrieving token:', error);
      }
    };
    getToken();
  }, []);

  // Fetch clothing items from the backend API only when token is available
  useEffect(() => {
    if (accessToken) {
      const fetchClothingItems = async () => {
        try {
          const response = await axios.get(
            'https://drip-advisor-backend.vercel.app/wardrobe',
            {
              headers: {
                'Authorization': `Bearer ${accessToken}`,
              },
            }
          );
          setClothingItems(response.data);
        } catch (error) {
          console.error('Error fetching clothing items:', error.response ? error.response.data : error.message);
          Alert.alert('Error', 'Unable to fetch clothing items. Please try again.');
        }
      };

      fetchClothingItems();
    }
  }, [accessToken]);

  const handleItemToggle = (id, available) => {
    if (longPressSelectedItems.length > 0) {
      // If there are long-pressed items, toggle selection regardless of availability
      setLongPressSelectedItems((prevItems) =>
        prevItems.includes(id)
          ? prevItems.filter((itemId) => itemId !== id)
          : [...prevItems, id]
      );
    } else if (available) {
      // If no long-pressed items, only toggle available items for outfit building
      setSelectedItems((prevSelectedItems) =>
        prevSelectedItems.includes(id)
          ? prevSelectedItems.filter((itemId) => itemId !== id)
          : [...prevSelectedItems, id]
      );
    }
  };

  const handleLongPress = (item) => {
    setLongPressSelectedItems((prevItems) => {
      if (prevItems.includes(item._id)) {
        return prevItems.filter((id) => id !== item._id);
      } else {
        // Clear normal selection when starting long-press selection
        setSelectedItems([]);
        return [item._id];
      }
    });
  };

  const handleDelete = async () => {
    if (longPressSelectedItems.length === 0) {
      Alert.alert('No items selected', 'Please select items to delete.');
      return;
    }

    Alert.alert(
      'Confirm Deletion',
      `Are you sure you want to delete ${longPressSelectedItems.length} item(s)?`,
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              const promises = longPressSelectedItems.map(itemId =>
                axios.delete(
                  `${baseUrl}clothing_items/delete`,
                  {
                    headers: {
                      'Authorization': `Bearer ${accessToken}`,
                      'Content-Type': 'application/json',
                    },
                    data: { clothing_item_id: itemId },
                  }
                )
              );

              await Promise.all(promises);

              // Update the local state to remove deleted items
              setClothingItems(prevItems =>
                prevItems.filter(item => !longPressSelectedItems.includes(item._id))
              );

              // Clear the selection
              setLongPressSelectedItems([]);

              Alert.alert('Success', 'Selected items have been deleted.');
            } catch (error) {
              console.error('Error deleting items:', error.response ? error.response.data : error.message);
              Alert.alert('Error', 'Unable to delete items. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleMarkAsAvailable = async () => {
    if (longPressSelectedItems.length === 0) {
      Alert.alert('No items selected', 'Please select items to mark as available.');
      return;
    }

    try {
      const promises = longPressSelectedItems.map(itemId =>
        axios.put(
          `${baseUrl}clothing_items/available`,
          { clothing_item_id: itemId },
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
          }
        )
      );

      await Promise.all(promises);

      // Update the local state to reflect the changes
      setClothingItems(prevItems =>
        prevItems.map(item =>
          longPressSelectedItems.includes(item._id) ? { ...item, available: true } : item
        )
      );

      // Clear the selection
      setLongPressSelectedItems([]);

      Alert.alert('Success', 'Selected items have been marked as available.');
    } catch (error) {
      console.error('Error marking items as available:', error.response ? error.response.data : error.message);
      Alert.alert('Error', 'Unable to mark items as available. Please try again.');
    }
  };

  const getImageUri = (item) => {
    if (item.path && item.path.startsWith('file://')) {
      return item.path;
    } else {
      return `${baseUrl}${item.image}`;
    }
  };

  const handleBuildPress = () => {
    if (selectedItems.length > 0) {
      // Navigate to the Build screen with selected items
      navigation.navigate('build', { selectedItems });
    } else {
      Alert.alert('No items selected', 'Please select items to build your outfit.');
    }
  };

  const handleCancelSelection = () => {
    setLongPressSelectedItems([]);
  };

  const isAnySelectedItemAvailable = () => {
    return longPressSelectedItems.some(id => 
      clothingItems.find(item => item._id === id && item.available)
    );
  };

  const applyFilter = (items) => {
    switch (filter) {
      case 'available':
        return items.filter(item => item.available);
      case 'unavailable':
        return items.filter(item => !item.available);
      default:
        return items;
    }
  };

  const sortClothingItems = (items) => {
    return [...items].sort((a, b) => {
      let comparison = 0;
      // Sort by frequency
      comparison = frequencySort === 'asc' 
        ? (a.frequency || 0) - (b.frequency || 0)
        : (b.frequency || 0) - (a.frequency || 0);
      
      // If frequencies are equal, sort by date
      if (comparison === 0) {
        comparison = dateSort === 'asc'
          ? new Date(a.created_at) - new Date(b.created_at)
          : new Date(b.created_at) - new Date(a.created_at);
      }
      return comparison;
    });
  };

  const renderFilterOption = (option) => (
    <TouchableOpacity
      style={[styles.filterOption, filter === option && styles.filterOptionSelected]}
      onPress={() => setFilter(option)}
    >
      <Text style={[styles.filterOptionText, filter === option && styles.filterOptionTextSelected]}>
        {option.charAt(0).toUpperCase() + option.slice(1)}
      </Text>
    </TouchableOpacity>
  );

  const renderClothingItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.itemContainer, 
        selectedItems.includes(item._id) && styles.itemContainerSelected,
        !item.available && styles.itemContainerUnavailable,
        longPressSelectedItems.includes(item._id) && styles.itemContainerLongPressed
      ]}
      onPress={() => handleItemToggle(item._id, item.available)}
      onLongPress={() => handleLongPress(item)}
      delayLongPress={500}
    >
      <Image 
        source={{ uri: getImageUri(item) }} 
        style={[styles.image, !item.available && styles.imageUnavailable]} 
      />
      {(selectedItems.includes(item._id) || longPressSelectedItems.includes(item._id)) && (
        <View style={[
          styles.checkmarkContainer,
          longPressSelectedItems.length > 0 && styles.longPressCheckmarkContainer
        ]}>
          <Ionicons name="checkmark-circle" size={24} color={longPressSelectedItems.length > 0 ? "#ff6347" : "#fff"} />
        </View>
      )}
      {!item.available && (
        <View style={styles.unavailableOverlay}>
          <Text style={styles.unavailableText}>Unavailable</Text>
        </View>
      )}
      {longPressSelectedItems.includes(item._id) && (
        <View style={styles.longPressCheckmarkContainer}>
          <Ionicons name="checkmark-circle" size={24} color="#ff6347" />
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Your Wardrobe</Text>
        {longPressSelectedItems.length > 0 && (
          <TouchableOpacity style={styles.cancelButton} onPress={handleCancelSelection}>
            <Ionicons name="close" size={24} color="#ff6347" />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.filterAndSortContainer}>
        <View style={styles.filterContainer}>
          {renderFilterOption('all')}
          {renderFilterOption('available')}
          {renderFilterOption('unavailable')}
        </View>
        <View style={styles.sortContainer}>
          <Dropdown
            label="Frequency:"
            options={[
              { label: 'High to Low', value: 'desc' },
              { label: 'Low to High', value: 'asc' },
            ]}
            selectedValue={frequencySort}
            onSelect={setFrequencySort}
          />
          <Dropdown
            label="Date Added:"
            options={[
              { label: 'Newest First', value: 'desc' },
              { label: 'Oldest First', value: 'asc' },
            ]}
            selectedValue={dateSort}
            onSelect={setDateSort}
          />
        </View>
      </View>
      <FlatList
        data={sortClothingItems(applyFilter(clothingItems))}
        keyExtractor={(item) => item._id}
        renderItem={renderClothingItem}
        numColumns={2}
        contentContainerStyle={styles.listContainer}
      />
      {longPressSelectedItems.length > 0 ? (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
            <Text style={styles.actionButtonText}>Delete ({longPressSelectedItems.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              styles.markAvailableButton,
              isAnySelectedItemAvailable() && styles.disabledButton
            ]} 
            onPress={handleMarkAsAvailable}
            disabled={isAnySelectedItemAvailable()}
          >
            <Text style={[styles.actionButtonText, isAnySelectedItemAvailable() && styles.disabledButtonText]}>
              Mark as Available ({longPressSelectedItems.length})
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.buildButton} onPress={handleBuildPress}>
          <Text style={styles.buildButtonText}>Build Outfit ({selectedItems.length})</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    padding: 5,
  },
  listContainer: {
    padding: 10,
  },
  itemContainer: {
    flex: 1,
    margin: 5,
    aspectRatio: 1,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  itemContainerSelected: {
    borderColor: '#50C2C9',
    borderWidth: 2,
  },
  itemContainerUnavailable: {
    opacity: 0.5,
  },
  itemContainerLongPressed: {
    borderColor: '#ff6347',
    borderWidth: 2,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imageUnavailable: {
    opacity: 0.5,
  },
  checkmarkContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#50C2C9',
    borderRadius: 12,
    padding: 2,
  },
  longPressCheckmarkContainer: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'transparent',
    borderRadius: 12,
    padding: 2,
  },
  unavailableOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  unavailableText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    marginTop: 10,
    paddingHorizontal: 10,
  },
  actionButton: {
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#ff6347',
  },
  markAvailableButton: {
    backgroundColor: '#4CAF50',
  },
  disabledButton: {
    backgroundColor: '#A9A9A9',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButtonText: {
    color: '#D3D3D3',
  },
  buildButton: {
    backgroundColor: '#50C2C9',
    padding: 15,
    borderRadius: 10,
    margin: 20,
    alignItems: 'center',
  },
  buildButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  filterAndSortContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  filterOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#50C2C9',
    backgroundColor: '#fff',
  },
  filterOptionSelected: {
    backgroundColor: '#50C2C9',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#50C2C9',
    fontWeight: '600',
  },
  filterOptionTextSelected: {
    color: '#fff',
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  dropdownContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
  dropdownLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#50C2C9',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dropdownButtonText: {
    fontSize: 14,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#333',
  },
});

export default WardrobeScreen;