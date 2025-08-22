import React, { useState } from 'react';
import './App.css';
import { UserProfile, Activity, SpecialEvent, ScheduleRequest } from './types';
import StepIndicator from './components/StepIndicator';
import ProfileSetup from './components/ProfileSetup';
import ActivitiesSetup from './components/ActivitiesSetup';
import SpecialEventsSetup from './components/SpecialEventsSetup';
import CycleInfo from './components/CycleInfo';
import ScheduleDisplay from './components/ScheduleDisplay';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    workHours: 6,
    studyHours: 4,
    householdChores: 12,
    sleepHours: 8,
    isFemale: false,
  });
  const [activities, setActivities] = useState<Activity[]>([
    { id: 1, name: '', duration: 30, preferredTime: 'any', category: 'leisure' }
  ]);
  const [selectedActivityCount, setSelectedActivityCount] = useState(1);
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([]);
  const [dayType, setDayType] = useState('weekday');
  const [energyLevel, setEnergyLevel] = useState('medium');
  const [schedule, setSchedule] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const handleNext = () => {
    if (currentStep === 3 && !userProfile.isFemale) {
      // Skip cycle screen if not female
      setCurrentStep(5);
      generateSchedule();
    } else if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generateSchedule = async () => {
    setIsLoading(true);
    setError('');
    setSchedule('');
    
    if (currentStep !== 5) {
      setCurrentStep(5);
    }

    const requestData: ScheduleRequest = {
      user_profile: {
        work_hours: userProfile.workHours,
        study_hours: userProfile.studyHours,
        household_chores: userProfile.householdChores,
        sleep_hours: userProfile.sleepHours,
        is_female: userProfile.isFemale,
        cycle_phase: userProfile.cyclePhase,
      },
      activities: activities
        .filter(a => a.name.trim() !== '')
        .map(a => ({
          id: a.id,
          name: a.name,
          duration_minutes: a.duration,
          preferred_time: a.preferredTime,
          category: a.category,
        })),
      selected_activity_count: selectedActivityCount,
      special_events: specialEvents,
      day_type: dayType,
      energy_level: energyLevel,
    };

    try {
      const response = await fetch('http://localhost:8080/api/generate-schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      
      if (result.success) {
        setSchedule(result.schedule);
      } else {
        setError(result.message || 'Failed to generate schedule');
      }
    } catch (err: any) {
      setError('Network error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resetApp = () => {
    setCurrentStep(1);
    setSchedule('');
    setError('');
  };

  return (
    <div className="App">
      <div className="container">
        <div className="header">
          <h1>🗓️ Smart Day Scheduler</h1>
          <p>AI-powered personalized daily planning</p>
        </div>

        <StepIndicator currentStep={currentStep} totalSteps={5} />

        {currentStep === 1 && (
          <ProfileSetup
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            onNext={handleNext}
          />
        )}

        {currentStep === 2 && (
          <ActivitiesSetup
            activities={activities}
            setActivities={setActivities}
            selectedActivityCount={selectedActivityCount}
            setSelectedActivityCount={setSelectedActivityCount}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 3 && (
          <SpecialEventsSetup
            specialEvents={specialEvents}
            setSpecialEvents={setSpecialEvents}
            dayType={dayType}
            setDayType={setDayType}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}

        {currentStep === 4 && userProfile.isFemale && (
          <CycleInfo
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            energyLevel={energyLevel}
            setEnergyLevel={setEnergyLevel}
            onNext={() => {
              setCurrentStep(5);
              generateSchedule();
            }}
            onBack={handleBack}
          />
        )}

        {currentStep === 5 && (
          <ScheduleDisplay
            schedule={schedule}
            isLoading={isLoading}
            error={error}
            onRegenerate={generateSchedule}
            onReset={resetApp}
          />
        )}
      </div>
    </div>
  );
}

export default App;
