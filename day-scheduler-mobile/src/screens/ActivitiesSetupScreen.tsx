import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Activity } from '../types/fullTypes';

interface Props {
  onNext: (activities: Activity[], selectedCount: number) => void;
  onBack: () => void;
}

export const ActivitiesSetupScreen: React.FC<Props> = ({ onNext, onBack }) => {
  const [activityText, setActivityText] = useState('');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [defaultDuration, setDefaultDuration] = useState('30');
  const [defaultTime, setDefaultTime] = useState<'any' | 'morning' | 'afternoon' | 'evening'>('any');
  const [selectedActivityCount, setSelectedActivityCount] = useState(3);

  const parseActivities = () => {
    const lines = activityText.split('\n');
    const parsedActivities: Activity[] = [];
    let idCounter = 1;

    lines.forEach(line => {
      const trimmed = line.trim();
      let activityName = '';
      
      // Parse markdown checkbox format
      if (trimmed.startsWith('- [ ]') || trimmed.startsWith('* [ ]')) {
        activityName = trimmed.replace(/^[-*]\s*\[\s*\]\s*/, '').trim();
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        activityName = trimmed.replace(/^[-*]\s*/, '').trim();
      } else if (trimmed.startsWith('[ ]')) {
        activityName = trimmed.replace(/^\[\s*\]\s*/, '').trim();
      } else if (trimmed) {
        activityName = trimmed;
      }

      if (activityName) {
        parsedActivities.push({
          id: idCounter++,
          name: activityName,
          duration: parseInt(defaultDuration),
          preferredTime: defaultTime,
          category: 'leisure',
          icon: '🎯',
          color: '#FFD700',
        });
      }
    });

    if (parsedActivities.length > 0) {
      setActivities(parsedActivities);
      Alert.alert('Success', `Parsed ${parsedActivities.length} activities!`);
    } else {
      Alert.alert('No Activities', 'Please enter some activities to parse');
    }
  };

  const removeActivity = (id: number) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const updateActivity = (id: number, field: keyof Activity, value: any) => {
    setActivities(activities.map(activity =>
      activity.id === id
        ? { ...activity, [field]: field === 'duration' ? parseInt(value) : value }
        : activity
    ));
  };

  const handleNext = () => {
    if (activities.length === 0) {
      Alert.alert('No Activities', 'Please add some activities first');
      return;
    }
    onNext(activities, selectedActivityCount);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepIndicator}>Step 2 of 5</Text>
        <Text style={styles.title}>🎯 Leisure Activities</Text>
        <Text style={styles.subtitle}>Paste or type your activities (one per line)</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>Activity List</Text>
        <TextInput
          style={styles.textarea}
          placeholder={`Enter activities like:
- [ ] Try a Piña Colada
- [ ] Opt for White Sneakers
- [ ] Experiment with Basil Hummus
- [ ] Try a new coffee blend
- [ ] Plan a virtual movie night

Or just list them:
painting
build dioramas
start a new book series`}
          value={activityText}
          onChangeText={setActivityText}
          multiline
          numberOfLines={10}
          textAlignVertical="top"
        />

        <View style={styles.defaultsRow}>
          <View style={styles.defaultInput}>
            <Text style={styles.smallLabel}>Default Duration (min)</Text>
            <TextInput
              style={styles.smallInput}
              value={defaultDuration}
              onChangeText={setDefaultDuration}
              keyboardType="numeric"
            />
          </View>
          
          <View style={styles.defaultInput}>
            <Text style={styles.smallLabel}>Default Time</Text>
            <View style={styles.timeButtons}>
              {(['any', 'morning', 'afternoon', 'evening'] as const).map(time => (
                <TouchableOpacity
                  key={time}
                  style={[
                    styles.timeButton,
                    defaultTime === time && styles.timeButtonSelected
                  ]}
                  onPress={() => setDefaultTime(time)}
                >
                  <Text style={[
                    styles.timeButtonText,
                    defaultTime === time && styles.timeButtonTextSelected
                  ]}>
                    {time === 'any' ? 'Any' : time.charAt(0).toUpperCase() + time.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.parseButton} onPress={parseActivities}>
          <Text style={styles.parseButtonText}>Parse Activities</Text>
        </TouchableOpacity>
      </View>

      {activities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Parsed Activities ({activities.length}):</Text>
          <ScrollView style={styles.activityList}>
            {activities.map(activity => (
              <View key={activity.id} style={styles.activityCard}>
                <View style={styles.activityInfo}>
                  <Text style={styles.activityName}>{activity.name}</Text>
                  <View style={styles.activityControls}>
                    <TextInput
                      style={styles.durationInput}
                      value={activity.duration.toString()}
                      onChangeText={(value) => updateActivity(activity.id, 'duration', value)}
                      keyboardType="numeric"
                    />
                    <Text style={styles.minText}>min</Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => removeActivity(activity.id)}
                >
                  <Text style={styles.removeButtonText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </ScrollView>

          <View style={styles.countSelector}>
            <Text style={styles.label}>Activities per day:</Text>
            <View style={styles.countButtons}>
              {[1, 2, 3, 4, 5].map(count => (
                <TouchableOpacity
                  key={count}
                  style={[
                    styles.countButton,
                    selectedActivityCount === count && styles.countButtonSelected
                  ]}
                  onPress={() => setSelectedActivityCount(count)}
                  disabled={count > activities.length}
                >
                  <Text style={[
                    styles.countButtonText,
                    selectedActivityCount === count && styles.countButtonTextSelected
                  ]}>
                    {count}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      )}

      <View style={styles.navigation}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>Next: Special Events →</Text>
        </TouchableOpacity>
      </View>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  smallLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  textarea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 200,
    textAlignVertical: 'top',
  },
  defaultsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
  },
  defaultInput: {
    flex: 1,
    marginHorizontal: 5,
  },
  smallInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 8,
    fontSize: 14,
  },
  timeButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  timeButton: {
    padding: 8,
    marginRight: 5,
    marginBottom: 5,
    borderRadius: 5,
    backgroundColor: '#f0f0f0',
  },
  timeButtonSelected: {
    backgroundColor: '#4ECDC4',
  },
  timeButtonText: {
    fontSize: 12,
    color: '#666',
  },
  timeButtonTextSelected: {
    color: '#fff',
  },
  parseButton: {
    backgroundColor: '#95E1D3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 15,
  },
  parseButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  activityList: {
    maxHeight: 200,
  },
  activityCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  activityInfo: {
    flex: 1,
  },
  activityName: {
    fontSize: 14,
    color: '#333',
    marginBottom: 5,
  },
  activityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    padding: 4,
    width: 50,
    fontSize: 14,
    textAlign: 'center',
  },
  minText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 5,
  },
  removeButton: {
    padding: 5,
  },
  removeButtonText: {
    fontSize: 24,
    color: '#FF6B6B',
  },
  countSelector: {
    marginTop: 15,
  },
  countButtons: {
    flexDirection: 'row',
    marginTop: 10,
  },
  countButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  countButtonSelected: {
    backgroundColor: '#4ECDC4',
  },
  countButtonText: {
    fontSize: 16,
    color: '#666',
  },
  countButtonTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  backButton: {
    backgroundColor: '#ddd',
    padding: 15,
    borderRadius: 10,
    flex: 0.45,
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 16,
    color: '#333',
  },
  nextButton: {
    backgroundColor: '#4ECDC4',
    padding: 15,
    borderRadius: 10,
    flex: 0.45,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});