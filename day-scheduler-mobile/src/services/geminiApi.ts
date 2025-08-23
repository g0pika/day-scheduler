import { UserProfile, ScheduleRequest, Activity } from '../types/fullTypes';

// Use your existing Go backend API
// Use your computer's IP so it works on both web and mobile
const API_BASE_URL = 'http://192.168.1.78:8080/api';

export const ScheduleApiService = {
  async generateSchedule(
    userProfile: UserProfile, 
    selectedActivities: string[], 
    dayType: 'work' | 'weekend' | 'holiday' = 'work'
  ): Promise<string> {
    try {
      const scheduleRequest: ScheduleRequest = {
        user_profile: {
          work_hours: userProfile.workHours,
          study_hours: userProfile.studyHours,
          household_chores: userProfile.householdChores,
          sleep_hours: userProfile.sleepHours,
          is_female: userProfile.isFemale,
          cycle_phase: userProfile.cyclePhase,
        },
        activities: this.mapActivitiesToRequest(selectedActivities),
        selected_activity_count: Math.min(selectedActivities.length, 5), // Limit to 5
        special_events: [], // Can be extended later
        day_type: dayType,
        energy_level: this.getEnergyLevel(userProfile.cyclePhase || 'unknown'),
      };

      console.log('API Request:', JSON.stringify(scheduleRequest, null, 2));
      console.log('API URL:', `${API_BASE_URL}/generate-schedule`);

      const response = await fetch(`${API_BASE_URL}/generate-schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scheduleRequest),
      });

      console.log('API Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error response:', errorText);
        throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const result = await response.json();
      console.log('API Response:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to generate schedule');
      }
      
      return result.schedule;
    } catch (error) {
      console.error('Error generating schedule:', error);
      throw error; // Re-throw the original error for better debugging
    }
  },

  mapActivitiesToRequest(selectedActivities: string[]): Activity[] {
    const activityMapping: { [key: string]: { name: string; duration: number; category: string; preferred_time: string } } = {
      work: { name: 'Work tasks', duration: 120, category: 'work', preferred_time: 'morning' },
      study: { name: 'Study session', duration: 90, category: 'study', preferred_time: 'morning' },
      health: { name: 'Exercise/workout', duration: 60, category: 'health', preferred_time: 'morning' },
      meal: { name: 'Cooking/meal prep', duration: 45, category: 'meal', preferred_time: 'any' },
      household: { name: 'Household chores', duration: 30, category: 'household', preferred_time: 'any' },
      personal: { name: 'Self care', duration: 60, category: 'personal', preferred_time: 'evening' },
      social: { name: 'Social time', duration: 90, category: 'social', preferred_time: 'evening' },
      leisure: { name: 'Hobby time', duration: 75, category: 'leisure', preferred_time: 'any' },
      travel: { name: 'Travel/commute', duration: 45, category: 'travel', preferred_time: 'any' },
      shopping: { name: 'Shopping', duration: 60, category: 'leisure', preferred_time: 'afternoon' },
      reading: { name: 'Reading', duration: 45, category: 'leisure', preferred_time: 'evening' },
      music: { name: 'Music/listening', duration: 30, category: 'leisure', preferred_time: 'any' },
      gaming: { name: 'Gaming', duration: 90, category: 'leisure', preferred_time: 'evening' },
      outdoor: { name: 'Outdoor activities', duration: 120, category: 'health', preferred_time: 'afternoon' },
      learning: { name: 'Learning new skills', duration: 60, category: 'study', preferred_time: 'morning' },
      creative: { name: 'Creative projects', duration: 90, category: 'leisure', preferred_time: 'afternoon' },
    };

    return selectedActivities
      .filter(activity => activityMapping[activity])
      .map((activity, index) => {
        const mapped = activityMapping[activity];
        return {
          id: index + 1,
          name: mapped.name,
          duration_minutes: mapped.duration,
          preferred_time: mapped.preferred_time,
          category: mapped.category,
        };
      });
  },

  getEnergyLevel(cyclePhase: string): 'low' | 'medium' | 'high' {
    switch (cyclePhase) {
      case 'menstrual':
        return 'low';
      case 'follicular':
        return 'medium';
      case 'ovulation':
        return 'high';
      case 'luteal':
        return 'medium';
      default:
        return 'medium';
    }
  },

  buildSchedulePrompt(
    userProfile: UserProfile, 
    selectedActivities: string[], 
    dayType: string
  ): string {
    const cyclePhase = userProfile.cyclePhase || 'unknown';
    const energyLevel = this.getEnergyLevel(cyclePhase);
    
    return `
Generate a personalized daily schedule for ${userProfile.name || 'the user'}.

**User Profile:**
- Age: ${userProfile.age}
- Gender: ${userProfile.isFemale ? 'Female' : 'Male'}
- Wake time: ${userProfile.wakeTime}
- Sleep time: ${userProfile.sleepTime}
- Work hours needed: ${userProfile.workHours} hours
- Study hours needed: ${userProfile.studyHours} hours
- Household chores: ${userProfile.householdChores} tasks
- Sleep needed: ${userProfile.sleepHours} hours
- Day type: ${dayType}
- Energy level: ${energyLevel}
${userProfile.isFemale ? `- Menstrual cycle phase: ${cyclePhase}` : ''}

**Selected Activity Categories:**
${selectedActivities.map(activity => `- ${activity}`).join('\n')}

**Instructions:**
1. Create a realistic, balanced daily schedule
2. Include work/study blocks as specified
3. Add household chores throughout the day
4. Include activities from selected categories
5. Consider energy level for activity timing
6. Add meals, breaks, and personal time
7. Respect wake and sleep times
8. Make it practical and achievable

**Format the response as markdown with:**
- Time slots (e.g., "08:00 - 09:00")
- Checkbox format for tasks: "- [ ] Task name"
- Categories: Morning Routine, Work/Study, Activities, Personal Care, etc.
- Brief motivational note

**Example format:**
## Your Daily Schedule for ${new Date().toLocaleDateString()}

**Morning Routine:**
- [ ] 06:00 - 06:30: Wake up and morning stretch
- [ ] 06:30 - 07:00: Breakfast preparation

**Work Block:**
- [ ] 08:00 - 10:00: Focused work session
- [ ] 10:00 - 10:15: Coffee break

(Continue with full day...)

**Evening Wind Down:**
- [ ] 21:00 - 22:00: Relaxation time

**Motivational Note:** Remember to stay hydrated and take breaks!

Generate a complete, personalized schedule now.`;
  },

  getEnergyLevel(cyclePhase: string): 'low' | 'medium' | 'high' {
    switch (cyclePhase) {
      case 'menstrual':
        return 'low';
      case 'follicular':
        return 'medium';
      case 'ovulation':
        return 'high';
      case 'luteal':
        return 'medium';
      default:
        return 'medium';
    }
  },

  // Fallback schedule generator if API fails
  generateFallbackSchedule(userProfile: UserProfile, selectedActivities: string[]): string {
    return `
## Your Daily Schedule for ${new Date().toLocaleDateString()}

**Morning Routine:**
- [ ] ${userProfile.wakeTime}: Wake up and stretch
- [ ] ${this.addMinutes(userProfile.wakeTime, 30)}: Breakfast and morning routine
- [ ] ${this.addMinutes(userProfile.wakeTime, 60)}: Personal preparation

**Work/Study Block:**
- [ ] ${this.addMinutes(userProfile.wakeTime, 90)}: Start work/study session
- [ ] ${this.addMinutes(userProfile.wakeTime, 210)}: Coffee break (15 min)
- [ ] ${this.addMinutes(userProfile.wakeTime, 225)}: Continue work/study

**Midday:**
- [ ] 12:00: Lunch break
- [ ] 13:00: ${selectedActivities.includes('household') ? 'Household chores' : 'Personal time'}

**Afternoon:**
- [ ] 14:00: ${selectedActivities.includes('health') ? 'Exercise/fitness' : 'Leisure activity'}
- [ ] 15:30: ${selectedActivities.includes('social') ? 'Social time' : 'Personal projects'}

**Evening:**
- [ ] 18:00: Dinner preparation and eating
- [ ] 19:30: ${selectedActivities.includes('leisure') ? 'Hobby time' : 'Relaxation'}
- [ ] 21:00: Evening wind down
- [ ] ${userProfile.sleepTime}: Sleep

**Note:** This is a basic schedule. For AI-powered personalization, please add your Gemini API key!
    `;
  },

  addMinutes(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    const newHours = Math.floor(totalMinutes / 60) % 24;
    const newMins = totalMinutes % 60;
    return `${String(newHours).padStart(2, '0')}:${String(newMins).padStart(2, '0')}`;
  },
};