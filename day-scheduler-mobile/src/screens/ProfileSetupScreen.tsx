import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { UserProfile } from '../types/fullTypes';

interface Props {
  onNext: (profile: Partial<UserProfile>) => void;
}

export const ProfileSetupScreen: React.FC<Props> = ({ onNext }) => {
  const [workHours, setWorkHours] = useState('8');
  const [studyHours, setStudyHours] = useState('2');
  const [householdChores, setHouseholdChores] = useState('3');
  const [sleepHours, setSleepHours] = useState('8');
  const [isFemale, setIsFemale] = useState(false);
  const [wakeTime, setWakeTime] = useState('06:00');
  const [sleepTime, setSleepTime] = useState('22:00');
  const [name, setName] = useState('');

  const handleNext = () => {
    const profile: Partial<UserProfile> = {
      name,
      workHours: parseInt(workHours),
      studyHours: parseInt(studyHours),
      householdChores: parseInt(householdChores),
      sleepHours: parseInt(sleepHours),
      isFemale,
      wakeTime,
      sleepTime,
    };
    onNext(profile);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepIndicator}>Step 1 of 5</Text>
        <Text style={styles.title}>📝 Basic Profile Setup</Text>
        <Text style={styles.subtitle}>Let's understand your daily routine</Text>
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
          <Text style={styles.label}>Work Hours per Day</Text>
          <TextInput
            style={styles.input}
            placeholder="8"
            value={workHours}
            onChangeText={setWorkHours}
            keyboardType="numeric"
          />
          <Text style={styles.hint}>Remote work hours</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Study Hours per Day</Text>
          <TextInput
            style={styles.input}
            placeholder="2"
            value={studyHours}
            onChangeText={setStudyHours}
            keyboardType="numeric"
          />
          <Text style={styles.hint}>Personal study/exam preparation</Text>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Number of Household Chores</Text>
          <TextInput
            style={styles.input}
            placeholder="3"
            value={householdChores}
            onChangeText={setHouseholdChores}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Sleep Hours Needed</Text>
          <View style={styles.pickerContainer}>
            {['7', '8', '9'].map(hours => (
              <TouchableOpacity
                key={hours}
                style={[
                  styles.pickerOption,
                  sleepHours === hours && styles.pickerOptionSelected
                ]}
                onPress={() => setSleepHours(hours)}
              >
                <Text style={[
                  styles.pickerText,
                  sleepHours === hours && styles.pickerTextSelected
                ]}>
                  {hours} hours
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.timeRow}>
          <View style={styles.timeInput}>
            <Text style={styles.label}>Wake Time</Text>
            <TextInput
              style={styles.input}
              placeholder="06:00"
              value={wakeTime}
              onChangeText={setWakeTime}
            />
          </View>
          <View style={styles.timeInput}>
            <Text style={styles.label}>Sleep Time</Text>
            <TextInput
              style={styles.input}
              placeholder="22:00"
              value={sleepTime}
              onChangeText={setSleepTime}
            />
          </View>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>I am female (for cycle-based planning)</Text>
          <Switch
            value={isFemale}
            onValueChange={setIsFemale}
            trackColor={{ false: '#ddd', true: '#FFB6C1' }}
            thumbColor={isFemale ? '#FF69B4' : '#f4f3f4'}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
        <Text style={styles.nextButtonText}>Next: Activities →</Text>
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
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
  },
  stepIndicator: {
    fontSize: 14,
    color: '#999',
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 10,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  hint: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  pickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  pickerOption: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginHorizontal: 5,
    alignItems: 'center',
  },
  pickerOptionSelected: {
    backgroundColor: '#4ECDC4',
    borderColor: '#4ECDC4',
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  pickerTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  nextButton: {
    backgroundColor: '#4ECDC4',
    margin: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});