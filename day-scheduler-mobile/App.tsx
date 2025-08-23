import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, Text, Button } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { FirstLaunchScreen } from './src/screens/FirstLaunchScreen';
import { TodayScheduleScreen } from './src/screens/TodayScheduleScreen';
import { StorageService } from './src/utils/storage';

export default function App() {
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Skip AsyncStorage for now and just show first launch
    setTimeout(() => {
      setIsFirstLaunch(true);
    }, 100);
  }, []);

  const handleFirstLaunchComplete = () => {
    setIsFirstLaunch(false);
  };

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Error: {error}</Text>
        <Button title="Try First Launch" onPress={() => setIsFirstLaunch(true)} />
      </View>
    );
  }

  if (isFirstLaunch === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4ECDC4" />
        <Text style={{ marginTop: 10 }}>Loading Day Scheduler...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="auto" />
      {isFirstLaunch ? (
        <FirstLaunchScreen onComplete={handleFirstLaunchComplete} />
      ) : (
        <TodayScheduleScreen />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
