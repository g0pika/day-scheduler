export interface Activity {
  id: string;
  name: string;
  category: 'work' | 'study' | 'class' | 'travel' | 'personal' | 'health' | 'meal' | 'rest';
  duration: number; // in minutes
  startTime?: string;
  completed: boolean;
  icon: string;
  color: string;
}

export interface DaySchedule {
  id: string;
  date: string;
  activities: Activity[];
  isDefault: boolean;
  createdAt: Date;
}

export interface PeriodCycle {
  id: string;
  startDate: Date;
  endDate?: Date;
  cycleLength?: number;
  flowDays: number;
}

export interface UserProfile {
  name: string;
  wakeTime: string;
  sleepTime: string;
  cycleHistory: PeriodCycle[];
  averageCycleLength?: number;
  nextPredictedPeriod?: Date;
  isFirstLaunch: boolean;
}

export interface ScheduleTemplate {
  id: string;
  name: string;
  activities: Omit<Activity, 'id' | 'completed'>[];
  isDefault: boolean;
}