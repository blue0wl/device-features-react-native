import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, TouchableOpacity, Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView, Platform, StatusBar } from 'react-native';
import { BlurView } from 'expo-blur';

export default function AddTravelEntryScreen({ navigation }: { navigation: any }) {
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [address, setAddress] = useState<string>('');
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const { isDarkMode } = useTheme();
  
    useEffect(() => {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: false,
          shouldSetBadge: false,
        }),
      });
    }, []);
  
    useEffect(() => {
      const verifyPermissions = async () => {
        const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
        const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
  
        if (locationStatus !== 'granted') {
          Alert.alert(
            'Location Permission Required',
            'This app needs location access to tag your photos properly',
            [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Open Settings', onPress: () => Linking.openSettings() }
            ]
          );
        }
      };
  
      verifyPermissions();
    }, []);
  
    useEffect(() => {
      requestPermissions();
    }, []);
  
    const requestPermissions = async () => {
      const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
      const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
  
      if (cameraStatus !== 'granted' || locationStatus !== 'granted') {
        Alert.alert(
          'Permissions required',
          'Camera and location permissions are needed to create travel entries.'
        );
      }
    };
  
    const takePicture = async () => {
      try {
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.7,
        });
  
        if (!result.canceled) {
          setImageUri(result.assets[0].uri);
  
          try {
            const location = await Location.getCurrentPositionAsync({
              accuracy: Location.Accuracy.High,
            });
            setLocation(location);
  
            const address = await Location.reverseGeocodeAsync({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
  
            if (address[0]) {
              setAddress(`${address[0].street}, ${address[0].city}`);
            }
          } catch (locationError) {
            console.warn("Using fallback location:", locationError);
  
            const lastLocation = await Location.getLastKnownPositionAsync();
            if (lastLocation) {
              const address = await Location.reverseGeocodeAsync({
                latitude: lastLocation.coords.latitude,
                longitude: lastLocation.coords.longitude,
              });
              setAddress(address[0] ? `${address[0].street}, ${address[0].city}` : "Approximate location");
            } else {
              setAddress("Location unavailable");
            }
          }
        }
      } catch (error) {
        console.error('Error taking picture:', error);
        Alert.alert('Error', 'Failed to take picture');
      }
    };
  
    const saveEntry = async () => {
      if (!imageUri || !address) {
        Alert.alert('Error', 'Please take a picture first');
        return;
      }
  
      try {
        const savedEntries = await AsyncStorage.getItem('travelEntries');
        const entries = savedEntries ? JSON.parse(savedEntries) : [];
  
        const newEntry = {
          id: Date.now().toString(),
          imageUri,
          address,
          timestamp: Date.now(),
        };
  
        await AsyncStorage.setItem(
          'travelEntries',
          JSON.stringify([...entries, newEntry])
        );
  
        const { status } = await Notifications.getPermissionsAsync();
        if (status !== 'granted') {
          const { status: newStatus } = await Notifications.requestPermissionsAsync();
          if (newStatus !== 'granted') {
            return;
          }
        }
  
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Travel Entry Saved',
            body: `Your visit to ${address} has been recorded`,
          },
          trigger: null,
        });
  
        navigation.navigate('Home', { refresh: true });
      } catch (error) {
        console.error('Error saving entry:', error);
        Alert.alert('Error', 'Failed to save entry');
      }
    };
  
    useEffect(() => {
      const unsubscribe = navigation.addListener('blur', () => {
        setImageUri(null);
        setAddress('');
        setLocation(null);
      });
  
      return unsubscribe;
    }, [navigation]);
  
    const styles = StyleSheet.create({
      container: {
        flex: 1,
        padding: 16,
        backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
      },
      imageContainer: {
        alignItems: 'center',
        marginVertical: 16,
      },
      image: {
        width: '100%',
        height: 300,
        borderRadius: 8,
      },
      addressContainer: {
        marginVertical: 16,
        padding: 16,
        backgroundColor: isDarkMode ? '#333333' : '#ffffff',
        borderRadius: 8,
      },
      addressText: {
        fontSize: 16,
        color: isDarkMode ? '#ffffff' : '#333333',
      },
      button: {
        marginVertical: 8,
      },
      placeholderText: {
        textAlign: 'center',
        marginVertical: 20,
        color: isDarkMode ? '#aaaaaa' : '#666666',
        //fontWeight: 'bold'
      },
      header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 40,
        marginTop: Platform.OS === 'ios' ? 40 : 80,
      },
      title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: isDarkMode ? '#ffffff' : '#000000',
      },
      actionButton: {
        backgroundColor: '#6600FF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 20,
        alignItems: 'center',
        marginVertical: 8,
        marginTop: 10,
      },
      actionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
      },
      backButton: {
        position: 'relative',
        left: 5,
        marginTop: -5,
        zIndex: 3,
        padding: 8,
        marginBottom: 10,
      },
      backButtonText: {
        fontSize: 16,
        color: isDarkMode ? '#1E90FF' : '#6600FF',
        fontWeight: 'bold',
      },
      headerContainer: {
        position: 'relative',
        marginBottom: 20,
        marginTop: 10,
        overflow: 'hidden',
        borderRadius: 12,
        height: 100,
      },
      headerBackground: {
        ...StyleSheet.absoluteFillObject,
        width: '100%',
        height: '100%',
      },
      headerContent: {
        position: 'relative',
        zIndex: 2,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        height: '100%',
      },
      headerOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: isDarkMode ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.2)',
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
      disabledButton: {
        backgroundColor: '#cccccc',
      },
      disabledButtonText: {
        color: '#888888',
      },
      blurBackground: {
        ...StyleSheet.absoluteFillObject,
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
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>
  
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
                <Text style={styles.title}>Add Travel Memory</Text>
              </View>
            </View>
  
            <TouchableOpacity
              style={styles.actionButton}
              onPress={takePicture}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Take Picture</Text>
            </TouchableOpacity>
  
            <View style={styles.imageContainer}>
              {imageUri ? (
                <Image source={{ uri: imageUri }} style={styles.image} />
              ) : (
                <Text style={styles.placeholderText}>No picture taken yet</Text>
              )}
            </View>
  
            <View style={styles.addressContainer}>
              {address ? (
                <Text style={styles.addressText}>{address}</Text>
              ) : (
                <Text style={styles.placeholderText}>
                  Address will appear here after taking a picture, please wait for a moment...
                </Text>
              )}
            </View>
  
            <TouchableOpacity
              style={[styles.actionButton, (!imageUri || !address) && styles.disabledButton]}
              onPress={saveEntry}
              disabled={!imageUri || !address}
              activeOpacity={0.7}
            >
              <Text style={styles.actionButtonText}>Save Entry</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </>
    );
  }