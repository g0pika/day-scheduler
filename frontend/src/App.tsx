import React, { useState } from 'react';
import './App.css';
import { UserProfile, Activity, SpecialEvent, ScheduleRequest, CalendarEvent } from './types';
import StepIndicator from './components/StepIndicator';
import ProfileSetup from './components/ProfileSetup';
import ActivitiesSetup from './components/ActivitiesSetup';
import SpecialEventsSetup from './components/SpecialEventsSetup';
import CycleInfo from './components/CycleInfo';
import ScheduleDisplay from './components/ScheduleDisplay';
import StudyPlanDrawer from './components/StudyPlanDrawer';
import CalendarView from './components/CalendarView';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    workHours: 6,
    studyHours: 4,
    householdChores: 12,
    sleepHours: 8,
    isFemale: false,
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [selectedActivityCount, setSelectedActivityCount] = useState(1);
  const [specialEvents, setSpecialEvents] = useState<SpecialEvent[]>([]);
  const [scheduleDate, setScheduleDate] = useState(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([]);
  const [energyLevel, setEnergyLevel] = useState('medium');
  const [schedule, setSchedule] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [studyPlan, setStudyPlan] = useState<string>('');
  const [isStudyDrawerOpen, setIsStudyDrawerOpen] = useState(false);

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
      energy_level: energyLevel,
      calendar_events: calendarEvents,
      schedule_date: scheduleDate,
      study_plan: studyPlan,
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
        setPrompt(result.prompt || '');
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

  const handleDateSelect = (date: string) => {
    setScheduleDate(date);
  };

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
    const monthName = date.toLocaleDateString('en-US', { month: 'long' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${dayName}, ${monthName} ${day}, ${year}`;
  };

  return (
    <div className="App">
      {/* Calendar Sidebar - Always visible */}
      <div
        style={{
          position: 'fixed',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 500,
        }}
      >
        <CalendarView selectedDate={scheduleDate} onDateSelect={handleDateSelect} />
        <div style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px', color: 'white', backgroundColor: 'rgba(0,0,0,0.3)', padding: '10px', borderRadius: '8px' }}>
          <strong>Scheduling for:</strong>
          <br />
          {formatDateDisplay(scheduleDate)}
        </div>
      </div>

      <div className="container">
        <div className="header">
          <h1>🗓️ Smart Day Scheduler</h1>
          <p>AI-powered personalized daily planning</p>
        </div>

        {/* Floating Study Plan Button */}
        <button
          onClick={() => setIsStudyDrawerOpen(true)}
          style={{
            position: 'fixed',
            bottom: '30px',
            right: '30px',
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#5469d4',
            color: 'white',
            border: 'none',
            fontSize: '28px',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 998,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s, box-shadow 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
          title="Customize Study Plan"
        >
          📚
        </button>

        <StudyPlanDrawer
          isOpen={isStudyDrawerOpen}
          onClose={() => setIsStudyDrawerOpen(false)}
          studyPlan={studyPlan}
          setStudyPlan={setStudyPlan}
        />

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
            scheduleDate={scheduleDate}
            setScheduleDate={setScheduleDate}
            calendarEvents={calendarEvents}
            setCalendarEvents={setCalendarEvents}
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
            prompt={prompt}
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
