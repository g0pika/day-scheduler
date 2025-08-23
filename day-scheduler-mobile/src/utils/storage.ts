import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile, DaySchedule, ScheduleTemplate } from '../types';

const STORAGE_KEYS = {
  USER_PROFILE: '@user_profile',
  SCHEDULES: '@schedules',
  TEMPLATES: '@templates',
  CURRENT_SCHEDULE: '@current_schedule',
};

export const StorageService = {
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading user profile:', error);
      return null;
    }
  },

  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  },

  async getSchedules(): Promise<DaySchedule[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SCHEDULES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading schedules:', error);
      return [];
    }
  },

  async saveSchedule(schedule: DaySchedule): Promise<void> {
    try {
      const schedules = await this.getSchedules();
      const existingIndex = schedules.findIndex(s => s.date === schedule.date);
      
      if (existingIndex >= 0) {
        schedules[existingIndex] = schedule;
      } else {
        schedules.push(schedule);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.SCHEDULES, JSON.stringify(schedules));
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  },

  async getTemplates(): Promise<ScheduleTemplate[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.TEMPLATES);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading templates:', error);
      return [];
    }
  },

  async saveTemplate(template: ScheduleTemplate): Promise<void> {
    try {
      const templates = await this.getTemplates();
      const existingIndex = templates.findIndex(t => t.id === template.id);
      
      if (existingIndex >= 0) {
        templates[existingIndex] = template;
      } else {
        templates.push(template);
      }
      
      await AsyncStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    } catch (error) {
      console.error('Error saving template:', error);
    }
  },

  async setFirstLaunchComplete(): Promise<void> {
    const profile = await this.getUserProfile();
    if (profile) {
      profile.isFirstLaunch = false;
      await this.saveUserProfile(profile);
    }
  },

  // Generic storage methods
  async getItem(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting item ${key}:`, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error setting item ${key}:`, error);
    }
  },
};