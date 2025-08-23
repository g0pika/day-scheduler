import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { UserProfile, ParsedTask } from '../types/fullTypes';
import { StorageService } from '../utils/storage';
import { ScheduleApiService } from '../services/geminiApi';
import { getCurrentPhase, predictNextPeriod } from '../utils/periodTracker';

export const TodayScheduleScreen: React.FC = () => {
  const [scheduleText, setScheduleText] = useState<string>('');
  const [tasks, setTasks] = useState<ParsedTask[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [nextPeriod, setNextPeriod] = useState<Date | null>(null);

  useEffect(() => {
    loadTodaySchedule();
  }, []);

  const loadTodaySchedule = async () => {
    try {
      const userProfile = await StorageService.getUserProfile();
      if (!userProfile) return;
      
      setProfile(userProfile);
      
      // Calculate period info
      if (userProfile.isFemale && userProfile.cycleHistory.length > 0) {
        const phase = getCurrentPhase(userProfile.cycleHistory);
        setCurrentPhase(phase);
        userProfile.cyclePhase = phase as any; // Update profile with current phase
        const predicted = predictNextPeriod(userProfile.cycleHistory);
        setNextPeriod(predicted);
      }
      
      // Check if we already have today's schedule
      const today = new Date().toISOString().split('T')[0];
      const savedSchedule = await StorageService.getItem(`schedule_${today}`);
      
      if (savedSchedule) {
        const schedule = JSON.parse(savedSchedule);
        setScheduleText(schedule.text);
        setTasks(schedule.tasks || []);
      } else {
        // Generate new schedule using your Go backend
        await generateNewSchedule();
      }
    } catch (error) {
      console.error('Error loading schedule:', error);
      Alert.alert('Error', 'Failed to load schedule');
    }
  };

  const generateNewSchedule = async () => {
    if (!profile || !profile.selectedActivities) return;
    
    setIsLoading(true);
    try {
      console.log('Generating schedule with backend API...');
      const scheduleText = await ScheduleApiService.generateSchedule(
        profile,
        profile.selectedActivities,
        'work' // Default to work day, can be enhanced
      );
      
      setScheduleText(scheduleText);
      
      // Parse tasks from the schedule
      const parsedTasks = parseScheduleToTasks(scheduleText);
      setTasks(parsedTasks);
      
      // Save to storage
      const today = new Date().toISOString().split('T')[0];
      await StorageService.setItem(`schedule_${today}`, JSON.stringify({
        text: scheduleText,
        tasks: parsedTasks,
        date: today,
      }));
      
    } catch (error) {
      console.error('Error generating schedule:', error);
      Alert.alert('Error', 'Failed to generate schedule. Please check if the backend server is running.');
    } finally {
      setIsLoading(false);
    }
  };

  const parseScheduleToTasks = (scheduleText: string): ParsedTask[] => {
    const lines = scheduleText.split('\n');
    const tasks: ParsedTask[] = [];
    let taskId = 1;

    lines.forEach(line => {
      // Look for checkbox format: - [ ] or time format
      if (line.includes('- [ ]') || line.includes('□')) {
        const content = line
          .replace(/^- \[ \]/, '')
          .replace(/□/, '')
          .replace(/^\s*\*\s*/, '')
          .trim();
        
        if (content) {
          // Extract time if present (e.g., "7:00 AM: Task")
          const timeMatch = content.match(/^(\d{1,2}:\d{2}\s*(AM|PM)?):?\s*/i);
          const startTime = timeMatch ? timeMatch[0].replace(':', '').trim() : undefined;
          const taskContent = timeMatch ? content.replace(timeMatch[0], '') : content;
          
          tasks.push({
            id: taskId++,
            content: taskContent,
            completed: false,
            startTime,
          });
        }
      }
    });

    return tasks;
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTodaySchedule();
    setRefreshing(false);
  };

  const toggleTask = async (taskId: number) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    
    setTasks(updatedTasks);
    
    // Save updated tasks
    const today = new Date().toISOString().split('T')[0];
    await StorageService.setItem(`schedule_${today}`, JSON.stringify({
      text: scheduleText,
      tasks: updatedTasks,
      date: today,
    }));
  };

  const regenerateSchedule = () => {
    Alert.alert(
      'Regenerate Schedule',
      'This will create a new AI-powered schedule for today. Your progress will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          onPress: generateNewSchedule,
        },
      ]
    );
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'menstrual': return '#FF6B6B';
      case 'follicular': return '#4ECDC4';
      case 'ovulation': return '#FFD700';
      case 'luteal': return '#DDA0DD';
      default: return '#999';
    }
  };

  const formatTime = (time?: string) => {
    if (!time) return '';
    return time;
  };

  const getCompletionRate = () => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.completed).length;
    return Math.round((completed / tasks.length) * 100);
  };

  if (!profile) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello, {profile.name}!</Text>
        <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</Text>
      </View>

      {currentPhase && (
        <View style={[styles.cycleInfo, { backgroundColor: getPhaseColor(currentPhase) + '20' }]}>
          <Text style={[styles.cyclePhase, { color: getPhaseColor(currentPhase) }]}>
            Current Phase: {currentPhase.charAt(0).toUpperCase() + currentPhase.slice(1)}
          </Text>
          {nextPeriod && (
            <Text style={styles.nextPeriod}>
              Next period in {Math.ceil((nextPeriod.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days
            </Text>
          )}
        </View>
      )}

      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>Today's Progress: {getCompletionRate()}%</Text>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${getCompletionRate()}%` }]} />
        </View>
      </View>

      <View style={styles.scheduleHeader}>
        <Text style={styles.scheduleTitle}>AI-Powered Schedule</Text>
        <TouchableOpacity onPress={regenerateSchedule}>
          <Text style={styles.regenerateButton}>🔄 New Schedule</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>🤖 AI is creating your perfect schedule...</Text>
        </View>
      ) : (
        <View style={styles.activitiesList}>
          {tasks.map((task) => (
            <TouchableOpacity
              key={task.id}
              style={[
                styles.taskCard,
                task.completed && styles.taskCompleted,
              ]}
              onPress={() => toggleTask(task.id)}
            >
              <View style={styles.taskContent}>
                {task.startTime && (
                  <Text style={styles.taskTime}>{task.startTime}</Text>
                )}
                <Text style={[
                  styles.taskText,
                  task.completed && styles.taskTextCompleted,
                ]}>
                  {task.content}
                </Text>
              </View>
              <View style={[
                styles.checkbox,
                task.completed && styles.checkboxCompleted
              ]}>
                {task.completed && <Text style={styles.checkmark}>✓</Text>}
              </View>
            </TouchableOpacity>
          ))}
          
          {tasks.length === 0 && !isLoading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No schedule yet!</Text>
              <TouchableOpacity style={styles.generateButton} onPress={generateNewSchedule}>
                <Text style={styles.generateButtonText}>🚀 Generate My Schedule</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  date: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  cycleInfo: {
    margin: 15,
    padding: 15,
    borderRadius: 10,
  },
  cyclePhase: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextPeriod: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  progressContainer: {
    backgroundColor: '#fff',
    margin: 15,
    padding: 15,
    borderRadius: 10,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  progressBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4ECDC4',
  },
  scheduleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 15,
    marginTop: 10,
  },
  scheduleTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  regenerateButton: {
    fontSize: 14,
    color: '#4ECDC4',
  },
  activitiesList: {
    padding: 15,
  },
  activityCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityCompleted: {
    opacity: 0.7,
  },
  activityLeft: {
    alignItems: 'center',
    marginRight: 15,
  },
  activityTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activityContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  activityDetails: {
    flex: 1,
  },
  activityName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  activityNameCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  activityDuration: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: '#4ECDC4',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#4ECDC4',
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
  },
  taskCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  taskCompleted: {
    opacity: 0.7,
    backgroundColor: '#f8f8f8',
  },
  taskContent: {
    flex: 1,
    marginRight: 15,
  },
  taskTime: {
    fontSize: 12,
    color: '#4ECDC4',
    fontWeight: '600',
    marginBottom: 4,
  },
  taskText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  taskTextCompleted: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  checkboxCompleted: {
    backgroundColor: '#4ECDC4',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    marginBottom: 20,
  },
  generateButton: {
    backgroundColor: '#4ECDC4',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});