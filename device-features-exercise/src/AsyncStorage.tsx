// npm install @react-native-async-storage/async-storage
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AsyncStorageTest = () => {
    const [name, setName] = useState('');
    const [storedName, setStoredName] = useState('');

    // Load saved name on app start
    useEffect(() => {
        const loadName = async () => {
            try {
                const value = await AsyncStorage.getItem('name');
                if (value !== null) {
                    setStoredName(value);
                }
            } catch (e) {
                console.log('Failed to load name.');
            }
        };

        loadName();
    }, []);

    // Save name
    const saveName = async () => {
        try {
            await AsyncStorage.setItem('name', name);
            setStoredName(name);
            setName('');
        } catch (e) {
            console.log('Failed to save name.');
        }
    };

    // Clear name
    const clearName = async () => {
        try {
            await AsyncStorage.removeItem('name');
            setStoredName('');
        } catch (e) {
            console.log('Failed to clear name.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome, {storedName || 'Guest'}!</Text>

            <TextInput
                style={styles.input}
                placeholder="Enter your name"
                value={name}
                onChangeText={text => setName(text)}
            />

            <Button title="Save Name" onPress={saveName} />
            <View style={{ marginVertical: 10 }} />
            <Button title="Clear Name" color="red" onPress={clearName} />
        </View>
    );
};

export default AsyncStorageTest;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 22,
        marginBottom: 20,
        textAlign: 'center',
    },
    input: {
        borderWidth: 1,
        borderColor: '#888',
        borderRadius: 5,
        padding: 10,
        marginBottom: 10,
        backgroundColor: 'white',
    },
});