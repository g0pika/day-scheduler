import React, { useState, useEffect } from 'react';
import './App.css';
import { UserProfile, Activity, SpecialEvent, CalendarEvent } from './types';
import StepIndicator from './components/StepIndicator';
import ProfileSetup from './components/ProfileSetup';
import ActivitiesSetup from './components/ActivitiesSetup';
import SpecialEventsSetup from './components/SpecialEventsSetup';
import CycleInfo from './components/CycleInfo';
import ScheduleDisplay from './components/ScheduleDisplay';
import StudyPlanDrawer from './components/StudyPlanDrawer';
import CalendarView from './components/CalendarView';

function App() {
  // Initialize dark mode as default, check localStorage for preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('theme');
    // Default to dark mode if no preference is saved
    return savedTheme ? savedTheme === 'dark' : true;
  });

  // Apply theme to body element
  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

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

    // Use user's actual inputs from ProfileSetup
    const requestData = {
      user_profile: {
        work_hours: userProfile.workHours,
        study_hours: userProfile.studyHours,
        household_chores: userProfile.householdChores,
        sleep_hours: userProfile.sleepHours,
        is_female: userProfile.isFemale,
        cycle_phase: userProfile.cyclePhase,
      },
      calendar_events: calendarEvents,
      energy_level: energyLevel,
      schedule_date: scheduleDate,
      study_plan: studyPlan,
    };

    try {
      const response = await fetch('http://localhost:8080/api/auto-generate-schedule', {
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
    if (!dateStr) return 'No date selected';
    try {
      const date = new Date(dateStr + 'T00:00:00'); // Force timezone to avoid date shifts
      if (isNaN(date.getTime())) return 'Invalid date';
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const monthName = date.toLocaleDateString('en-US', { month: 'long' });
      const day = date.getDate();
      const year = date.getFullYear();
      return `${dayName}, ${monthName} ${day}, ${year}`;
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Error formatting date';
    }
  };

  return (
    <div className="App">
      {/* Calendar Sidebar */}
      <div className="sidebar-calendar">
        <CalendarView selectedDate={scheduleDate} onDateSelect={handleDateSelect} />
        <div className="selected-date-display">
          <strong>Scheduling for:</strong>
          <div style={{ marginTop: '8px', fontSize: '13px' }}>
            {formatDateDisplay(scheduleDate)}
          </div>
        </div>
      </div>

      <div className="container">
        <div className="header">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              width: '45px',
              height: '45px',
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              color: 'white',
              border: 'none',
              fontSize: '22px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
              e.currentTarget.style.transform = 'scale(1.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.transform = 'scale(1)';
            }}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>

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
