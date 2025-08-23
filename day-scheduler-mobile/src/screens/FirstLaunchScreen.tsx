import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
} from 'react-native';
import { UserProfile } from '../types/fullTypes';
import { StorageService } from '../utils/storage';

interface Props {
  onComplete: () => void;
}

// Most popular 8 categories shown first
const POPULAR_CATEGORIES = [
  { id: 'work', label: 'Work', icon: '💼', color: '#4ECDC4' },
  { id: 'study', label: 'Study', icon: '📚', color: '#A8E6CF' },
  { id: 'health', label: 'Exercise', icon: '🏃', color: '#98FB98' },
  { id: 'meal', label: 'Cooking', icon: '🍳', color: '#FF6B6B' },
  { id: 'household', label: 'Chores', icon: '🧹', color: '#DDA0DD' },
  { id: 'personal', label: 'Self Care', icon: '🧘', color: '#FFD700' },
  { id: 'social', label: 'Friends', icon: '👥', color: '#FFB6C1' },
  { id: 'leisure', label: 'Hobbies', icon: '🎯', color: '#95E1D3' },
];

// Additional categories
const MORE_CATEGORIES = [
  { id: 'travel', label: 'Travel', icon: '🚗', color: '#87CEEB' },
  { id: 'shopping', label: 'Shopping', icon: '🛒', color: '#F0E68C' },
  { id: 'reading', label: 'Reading', icon: '📖', color: '#DEB887' },
  { id: 'music', label: 'Music', icon: '🎵', color: '#DA70D6' },
  { id: 'gaming', label: 'Gaming', icon: '🎮', color: '#FF7F50' },
  { id: 'outdoor', label: 'Outdoor', icon: '🌲', color: '#90EE90' },
  { id: 'learning', label: 'Learning', icon: '🎓', color: '#ADD8E6' },
  { id: 'creative', label: 'Creative', icon: '🎨', color: '#F5DEB3' },
];

export const FirstLaunchScreen: React.FC<Props> = ({ onComplete }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [isFemale, setIsFemale] = useState(false);
  const [wakeTime, setWakeTime] = useState('06:00');
  const [sleepTime, setSleepTime] = useState('22:00');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [customActivity, setCustomActivity] = useState('');

  const toggleActivity = (id: string) => {
    setSelectedActivities(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const addCustomActivity = () => {
    if (customActivity.trim()) {
      const customId = `custom_${Date.now()}`;
      // Add to selected activities
      setSelectedActivities(prev => [...prev, customId]);
      // You could also add it to a custom categories array if needed
      setCustomActivity('');
      Alert.alert('Added!', `"${customActivity}" added to your activities`);
    }
  };

  const handleComplete = async () => {
    if (!name || !age || selectedActivities.length === 0) {
      Alert.alert('Missing Information', 'Please fill in your name, age and select at least one activity');
      return;
    }

    try {
      const userProfile: UserProfile = {
        name,
        age: parseInt(age),
        isFemale,
        wakeTime,
        sleepTime,
        workHours: 8, // Default values
        studyHours: 2,
        householdChores: 3,
        sleepHours: 8,
        cycleHistory: [],
        isFirstLaunch: false,
        selectedActivities, // Store selected activity categories
      };

      await StorageService.saveUserProfile(userProfile);
      onComplete();
    } catch (error) {
      console.error('Error in handleComplete:', error);
      Alert.alert('Error', 'Failed to save profile. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Welcome to Day Scheduler</Text>
        <Text style={styles.subtitle}>Just a few quick details to get started</Text>
      </View>

      <View style={styles.section}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Your Name</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter your name"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="25"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.switchGroup}>
          <Text style={styles.label}>I am female</Text>
          <Switch
            value={isFemale}
            onValueChange={setIsFemale}
            trackColor={{ false: '#ddd', true: '#FFB6C1' }}
            thumbColor={isFemale ? '#FF69B4' : '#f4f3f4'}
          />
        </View>

        <View style={styles.timeRow}>
          <View style={styles.timeInput}>
            <Text style={styles.label}>Wake up at</Text>
            <TextInput
              style={styles.input}
              placeholder="06:00"
              value={wakeTime}
              onChangeText={setWakeTime}
            />
          </View>
          <View style={styles.timeInput}>
            <Text style={styles.label}>Sleep at</Text>
            <TextInput
              style={styles.input}
              placeholder="22:00"
              value={sleepTime}
              onChangeText={setSleepTime}
            />
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What activities do you do? 🎯</Text>
        <Text style={styles.hint}>Select activities you want included in your daily schedule</Text>
        
        <View style={styles.activityGrid}>
          {POPULAR_CATEGORIES.map(category => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.activityButton,
                selectedActivities.includes(category.id) && {
                  backgroundColor: category.color,
                  borderColor: category.color,
                },
              ]}
              onPress={() => toggleActivity(category.id)}
            >
              <Text style={styles.activityIcon}>{category.icon}</Text>
              <Text style={[
                styles.activityLabel,
                selectedActivities.includes(category.id) && styles.activityLabelSelected
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity 
          style={styles.showMoreButton} 
          onPress={() => setShowMoreCategories(!showMoreCategories)}
        >
          <Text style={styles.showMoreText}>
            {showMoreCategories ? '↑ Show Less' : '↓ More Activities'}
          </Text>
        </TouchableOpacity>

        {showMoreCategories && (
          <View style={styles.activityGrid}>
            {MORE_CATEGORIES.map(category => (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.activityButton,
                  selectedActivities.includes(category.id) && {
                    backgroundColor: category.color,
                    borderColor: category.color,
                  },
                ]}
                onPress={() => toggleActivity(category.id)}
              >
                <Text style={styles.activityIcon}>{category.icon}</Text>
                <Text style={[
                  styles.activityLabel,
                  selectedActivities.includes(category.id) && styles.activityLabelSelected
                ]}>
                  {category.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.customActivityRow}>
          <TextInput
            style={styles.customInput}
            placeholder="Add custom activity..."
            value={customActivity}
            onChangeText={setCustomActivity}
          />
          <TouchableOpacity style={styles.addButton} onPress={addCustomActivity}>
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.selectedCount}>
          {selectedActivities.length} activities selected
        </Text>
      </View>

      <TouchableOpacity style={styles.continueButton} onPress={handleComplete}>
        <Text style={styles.continueButtonText}>Get Started 🚀</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 20,
    padding: 25,
    borderRadius: 15,
  },
  inputGroup: {
    marginBottom: 20,
  },
  switchGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  continueButton: {
    backgroundColor: '#4ECDC4',
    marginHorizontal: 20,
    marginVertical: 30,
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  activityButton: {
    width: '48%',
    padding: 15,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
  },
  activityIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  activityLabel: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  activityLabelSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  showMoreButton: {
    alignItems: 'center',
    padding: 12,
    marginVertical: 15,
  },
  showMoreText: {
    fontSize: 16,
    color: '#4ECDC4',
    fontWeight: '600',
  },
  customActivityRow: {
    flexDirection: 'row',
    marginTop: 15,
    marginBottom: 10,
  },
  customInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginRight: 10,
  },
  addButton: {
    backgroundColor: '#4ECDC4',
    width: 45,
    height: 45,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  selectedCount: {
    fontSize: 14,
    color: '#4ECDC4',
    textAlign: 'center',
    fontWeight: '600',
  },
});