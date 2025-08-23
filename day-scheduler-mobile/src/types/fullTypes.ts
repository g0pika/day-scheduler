// Complete types from the original app
export interface UserProfile {
  // Basic profile
  name?: string;
  age?: number;
  workHours: number;
  studyHours: number;
  householdChores: number;
  sleepHours: number;
  isFemale: boolean;
  
  // Time preferences
  wakeTime: string;
  sleepTime: string;
  
  // Cycle tracking
  cyclePhase?: 'menstrual' | 'follicular' | 'ovulation' | 'luteal';
  cycleHistory: PeriodCycle[];
  averageCycleLength?: number;
  nextPredictedPeriod?: Date;
  
  // App state
  isFirstLaunch?: boolean;
  selectedActivities?: string[];
}

export interface Activity {
  id: number;
  name: string;
  duration: number; // minutes
  preferredTime: 'any' | 'morning' | 'afternoon' | 'evening';
  category: 'work' | 'study' | 'household' | 'leisure' | 'health' | 'meal' | 'personal';
  completed?: boolean;
  icon?: string;
  color?: string;
}

export interface SpecialEvent {
  type: 'doctor' | 'interview' | 'family' | 'social' | 'custom';
  name?: string;
  startTime?: string;
  duration: number;
  prepTime?: number;
  preferredTime?: string;
}

export interface PeriodCycle {
  id: string;
  startDate: Date;
  endDate?: Date;
  cycleLength?: number;
  flowDays: number;
}

export interface ParsedTask {
  id: number;
  content: string;
  completed: boolean;
  startTime?: string;
}

export interface DaySchedule {
  id: string;
  date: string;
  dayType: 'work' | 'weekend' | 'holiday';
  energyLevel: 'low' | 'medium' | 'high';
  activities: Activity[];
  specialEvents: SpecialEvent[];
  tasks: ParsedTask[];
  scheduleText?: string; // AI generated schedule
  isDefault: boolean;
  createdAt: Date;
}

export interface ScheduleRequest {
  user_profile: {
    work_hours: number;
    study_hours: number;
    household_chores: number;
    sleep_hours: number;
    is_female: boolean;
    cycle_phase?: string;
  };
  activities: Array<{
    id: number;
    name: string;
    duration_minutes: number;
    preferred_time: string;
    category: string;
  }>;
  selected_activity_count: number;
  special_events: SpecialEvent[];
  day_type: string;
  energy_level?: string;
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  activities: Activity[];
  isDefault: boolean;
}