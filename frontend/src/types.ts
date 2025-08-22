export interface UserProfile {
  workHours: number;
  studyHours: number;
  householdChores: number;
  sleepHours: number;
  isFemale: boolean;
  cyclePhase?: string;
}

export interface Activity {
  id: number;
  name: string;
  duration: number;
  preferredTime: 'any' | 'morning' | 'afternoon' | 'evening';
  category: string;
}

export interface SpecialEvent {
  type: string;
  name?: string;
  startTime?: string;
  duration: number;
  prepTime?: number;
  preferredTime?: string;
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

export interface ScheduleResponse {
  schedule: string;
  success: boolean;
  message?: string;
}