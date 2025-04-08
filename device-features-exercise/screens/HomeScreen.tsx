import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, Image, StyleSheet, TouchableOpacity, Button, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView, Platform, StatusBar } from 'react-native';
import { BlurView } from 'expo-blur';

interface TravelEntry {
  id: string;
  imageUri: string;
  address: string;
  timestamp: number;
}

export default function HomeScreen({ navigation }: { navigation: any }) {
  const [entries, setEntries] = useState<TravelEntry[]>([]);
  const { theme, toggleTheme, isDarkMode } = useTheme();

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      if (navigation.getState().routes[navigation.getState().index]?.params?.refresh) {
        loadEntries();
        // Clear the refresh flag
        navigation.setParams({ refresh: false });
      }
    });
    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      const savedEntries = await AsyncStorage.getItem('travelEntries');
      if (savedEntries) {
        setEntries(JSON.parse(savedEntries));
      }
    } catch (e) {
      console.error('Failed to load entries', e);
    }
  };

  const removeEntry = async (id: string) => {
    Alert.alert(
      "Delete Entry",
      "Are you sure you want to delete this travel memory?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedEntries = entries.filter(entry => entry.id !== id);
            setEntries(updatedEntries);
            try {
              await AsyncStorage.setItem('travelEntries', JSON.stringify(updatedEntries));
            } catch (e) {
              console.error('Failed to remove entry', e);
              Alert.alert("Error", "Failed to delete entry");
            }
          },
        },
      ]
    );
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: 'transparent',
    },
    emptyText: {
      textAlign: 'center',
      marginTop: 250,
      fontSize: 16,
      color: isDarkMode ? '#ffffff' : '#000000',
      fontWeight: 'bold'
    },
    entryContainer: {
      marginBottom: 16,
      backgroundColor: isDarkMode ? 'rgba(51, 51, 51, 0.7)' : 'rgba(255, 255, 255, 0.7)',
      borderRadius: 8,
      padding: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
      overflow: 'hidden',
    },
    image: {
      width: '100%',
      height: 200,
      borderRadius: 4,
      marginBottom: 8,
    },
    addressText: {
      fontSize: 14,
      color: isDarkMode ? '#ffffff' : '#333333',
      marginBottom: 8,
    },
    dateText: {
      fontSize: 12,
      color: isDarkMode ? '#aaaaaa' : '#666666',
    },
    removeButton: {
      backgroundColor: '#ff4444',
      padding: 8,
      borderRadius: 4,
      marginTop: 8,
    },
    removeButtonText: {
      color: '#ffffff',
      textAlign: 'center',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: isDarkMode ? '#ffffff' : '#000000',
    },
    themeToggleContainer: {
      padding: 10,
      borderRadius: 50,
      backgroundColor: theme === 'dark' ? 'rgba(68, 68, 68, 0.7)' : 'rgba(221, 221, 221, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex:2
    },
    themeImage: {
      width: 24, 
      height: 24, 
      resizeMode: 'contain',
      tintColor: theme === 'dark' ? '#fff' : '#333', 
    },
    addEntryButton: {
      backgroundColor: isDarkMode ? 'rgba(68, 68, 68, 0.7)' : 'rgba(221, 221, 221, 0.7)',
      padding: 10,
      borderRadius: 20,
      marginRight: 10,
      zIndex:3
    },
    addEntryText: {
      color: isDarkMode ? '#fff' : '#333',
      fontSize: 14,
      fontWeight: 'bold',
    },
    headerRightContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    screenBackground: {
      flex: 1,
      width: '100%',
      height: '100%',
      position: 'absolute',
    },
    screenContainer: {
      flex: 1,
      backgroundColor: 'transparent',
      paddingHorizontal: 16,
    },
    contentOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDarkMode ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.05)',
    },
    contentWrapper: {
      flex: 1,
      position: 'relative',
    },
    blurBackground: {
      ...StyleSheet.absoluteFillObject,
    },
    headerContainer: {
        position: 'relative',
        marginBottom: 10,
        marginTop: -10,
        overflow: 'hidden',
        borderRadius: 12,
        height: 100,
        width: '100%', // Ensure full width
        alignSelf: 'center', // Center alignment
      },
    headerBackground: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        marginBottom: 50
    },
    headerContent: {
      position: 'relative',
      zIndex: 2,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      height: '100%',
      width: '100%'
    },
    headerOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.2)',
    },
  });

  return (
    <>
      {Platform.OS === 'android' && (
        <View style={{ height: StatusBar.currentHeight, backgroundColor: isDarkMode ? '#121212' : 'transparent' }} />
      )}

      <Image
        source={
          isDarkMode
            ? require('../assets/bghome.jpg')
            : require('../assets/homebg2.jpg')
        }
        style={styles.screenBackground}
        resizeMode="cover"
      />
      <BlurView
        intensity={50}
        tint={isDarkMode ? 'dark' : 'light'}
        style={styles.blurBackground}
      />
      <View style={styles.contentOverlay} />

      <SafeAreaView style={styles.screenContainer}>
        <View style={styles.contentWrapper}>
          <View style={styles.headerContainer}>
            <Image
              source={
                isDarkMode
                  ? require('../assets/bghomehead.jpg')
                  : require('../assets/hombghead.png')
              }
              style={styles.headerBackground}
            />
            <View style={styles.headerOverlay} />
            <View style={styles.headerContent}>
              <Text style={styles.title}>Travel Diary</Text>
              <View style={styles.headerRightContainer}>
                <TouchableOpacity
                  style={styles.addEntryButton}
                  onPress={() => navigation.navigate('AddTravelEntry')}
                  activeOpacity={0.7}
                >
                  <Text style={styles.addEntryText}>+ New Memory</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={toggleTheme}
                  style={styles.themeToggleContainer}
                  activeOpacity={0.7}
                >
                  <Image
                    source={theme === 'dark' 
                      ? require('../assets/newlight.png') 
                      : require('../assets/dark.png')}
                    style={styles.themeImage}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {entries.length === 0 ? (
            <Text style={styles.emptyText}>No memories yet</Text>
          ) : (
            <FlatList
              data={entries}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <View style={styles.entryContainer}>
                  <Image source={{ uri: item.imageUri }} style={styles.image} />
                  <Text style={styles.addressText}>{item.address}</Text>
                  <Text style={styles.dateText}>
                    {new Date(item.timestamp).toLocaleString()}
                  </Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeEntry(item.id)}
                  >
                    <Text style={styles.removeButtonText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              )}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>
      </SafeAreaView>
    </>
  );
}