import { Activity, DaySchedule, UserProfile, ScheduleTemplate } from '../types';
import { getCurrentPhase, getPhaseEnergyLevel } from './periodTracker';

const DEFAULT_ACTIVITIES: Omit<Activity, 'id' | 'completed'>[] = [
  { name: 'Morning Routine', category: 'personal', duration: 30, icon: '☀️', color: '#FFD700', startTime: '06:00' },
  { name: 'Breakfast', category: 'meal', duration: 30, icon: '🍳', color: '#FF6B6B', startTime: '06:30' },
  { name: 'Work Block 1', category: 'work', duration: 120, icon: '💼', color: '#4ECDC4', startTime: '08:00' },
  { name: 'Break', category: 'rest', duration: 15, icon: '☕', color: '#95E1D3', startTime: '10:00' },
  { name: 'Work Block 2', category: 'work', duration: 90, icon: '💼', color: '#4ECDC4', startTime: '10:15' },
  { name: 'Lunch', category: 'meal', duration: 60, icon: '🍽️', color: '#FF6B6B', startTime: '12:00' },
  { name: 'Study/Learning', category: 'study', duration: 90, icon: '📚', color: '#A8E6CF', startTime: '13:00' },
  { name: 'Class/Meeting', category: 'class', duration: 60, icon: '👥', color: '#FFB6C1', startTime: '14:30' },
  { name: 'Travel/Commute', category: 'travel', duration: 30, icon: '🚗', color: '#DDA0DD', startTime: '15:30' },
  { name: 'Exercise', category: 'health', duration: 45, icon: '🏃', color: '#98FB98', startTime: '16:30' },
  { name: 'Dinner', category: 'meal', duration: 45, icon: '🍽️', color: '#FF6B6B', startTime: '18:00' },
  { name: 'Personal Time', category: 'personal', duration: 120, icon: '🎯', color: '#FFD700', startTime: '19:00' },
  { name: 'Evening Routine', category: 'personal', duration: 30, icon: '🌙', color: '#B19CD9', startTime: '21:00' },
];

export const generateDefaultSchedule = (
  profile: UserProfile,
  date: Date = new Date(),
  template?: ScheduleTemplate,
  calendarEvents?: Activity[]
): DaySchedule => {
  const activities = template?.activities || DEFAULT_ACTIVITIES;
  const phase = getCurrentPhase(profile.cycleHistory, date);
  const energyLevel = getPhaseEnergyLevel(phase);
  
  // Adjust activities based on energy level
  let adjustedActivities = activities.map((activity, index) => {
    const newActivity: Activity = {
      ...activity,
      id: `${date.toISOString()}-${index}`,
      completed: false,
    };
    
    // Adjust intensity based on cycle phase
    if (energyLevel === 'low' && (activity.category === 'work' || activity.category === 'health')) {
      newActivity.duration = Math.round(activity.duration * 0.8); // Reduce by 20%
    } else if (energyLevel === 'high' && activity.category === 'health') {
      newActivity.duration = Math.round(activity.duration * 1.2); // Increase by 20%
    }
    
    return newActivity;
  });
  
  // Merge with calendar events if provided
  if (calendarEvents && calendarEvents.length > 0) {
    adjustedActivities = mergeWithCalendarEvents(adjustedActivities, calendarEvents);
  }
  
  // Recalculate start times if needed
  adjustedActivities = recalculateStartTimes(adjustedActivities, profile.wakeTime);
  
  return {
    id: date.toISOString(),
    date: date.toISOString().split('T')[0],
    activities: adjustedActivities,
    isDefault: true,
    createdAt: new Date(),
  };
};

const mergeWithCalendarEvents = (activities: Activity[], calendarEvents: Activity[]): Activity[] => {
  // Sort calendar events by start time
  const sortedEvents = [...calendarEvents].sort((a, b) => {
    const timeA = parseTime(a.startTime || '00:00');
    const timeB = parseTime(b.startTime || '00:00');
    return (timeA.hours * 60 + timeA.minutes) - (timeB.hours * 60 + timeB.minutes);
  });
  
  // Filter out conflicting default activities and insert calendar events
  let merged: Activity[] = [];
  let eventIndex = 0;
  
  for (const activity of activities) {
    // Check if there's a calendar event that conflicts
    if (eventIndex < sortedEvents.length) {
      const event = sortedEvents[eventIndex];
      const activityTime = parseTime(activity.startTime || '00:00');
      const eventTime = parseTime(event.startTime || '00:00');
      
      // If event should come before this activity, insert it
      if ((eventTime.hours * 60 + eventTime.minutes) <= (activityTime.hours * 60 + activityTime.minutes)) {
        merged.push(event);
        eventIndex++;
        
        // Skip this activity if it conflicts with the event
        const eventEnd = addMinutes(eventTime, event.duration);
        const activityEnd = addMinutes(activityTime, activity.duration);
        if (!((activityTime.hours * 60 + activityTime.minutes) >= (eventEnd.hours * 60 + eventEnd.minutes))) {
          continue; // Skip conflicting activity
        }
      }
    }
    
    // Add the regular activity if not conflicting
    merged.push(activity);
  }
  
  // Add any remaining calendar events
  while (eventIndex < sortedEvents.length) {
    merged.push(sortedEvents[eventIndex]);
    eventIndex++;
  }
  
  return merged;
};

const recalculateStartTimes = (activities: Activity[], wakeTime: string): Activity[] => {
  let currentTime = parseTime(wakeTime);
  
  return activities.map((activity) => {
    const startTime = formatTime(currentTime);
    currentTime = addMinutes(currentTime, activity.duration);
    
    return {
      ...activity,
      startTime,
    };
  });
};

const parseTime = (timeString: string): { hours: number; minutes: number } => {
  const [hours, minutes] = timeString.split(':').map(Number);
  return { hours, minutes };
};

const formatTime = (time: { hours: number; minutes: number }): string => {
  const hours = String(time.hours).padStart(2, '0');
  const minutes = String(time.minutes).padStart(2, '0');
  return `${hours}:${minutes}`;
};

const addMinutes = (time: { hours: number; minutes: number }, minutes: number): { hours: number; minutes: number } => {
  const totalMinutes = time.hours * 60 + time.minutes + minutes;
  return {
    hours: Math.floor(totalMinutes / 60) % 24,
    minutes: totalMinutes % 60,
  };
};