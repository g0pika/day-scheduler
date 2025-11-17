import React, { useState, useEffect } from 'react';
import { SpecialEvent, CalendarEvent } from '../types';
import { initializeGoogleAPI, signInAndFetchEvents } from '../services/googleCalendar';

interface SpecialEventsSetupProps {
  specialEvents: SpecialEvent[];
  setSpecialEvents: React.Dispatch<React.SetStateAction<SpecialEvent[]>>;
  scheduleDate: string;
  setScheduleDate: React.Dispatch<React.SetStateAction<string>>;
  calendarEvents: CalendarEvent[];
  setCalendarEvents: React.Dispatch<React.SetStateAction<CalendarEvent[]>>;
  onNext: () => void;
  onBack: () => void;
}

const SpecialEventsSetup: React.FC<SpecialEventsSetupProps> = ({
  specialEvents,
  setSpecialEvents,
  scheduleDate,
  setScheduleDate,
  calendarEvents,
  setCalendarEvents,
  onNext,
  onBack,
}) => {
  const [hasTravel, setHasTravel] = useState(false);
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false);
  const [calendarError, setCalendarError] = useState<string>('');
  const [googleApiReady, setGoogleApiReady] = useState(false);
  const [travelRoute, setTravelRoute] = useState('');
  const [travelTime, setTravelTime] = useState('');
  const [travelDuration, setTravelDuration] = useState(30);

  const [hasGym, setHasGym] = useState(false);
  const [gymTime, setGymTime] = useState('Morning (preferred)');
  const [gymDuration, setGymDuration] = useState(120);

  const [hasClass, setHasClass] = useState(false);
  const [className, setClassName] = useState('');
  const [classTime, setClassTime] = useState('17:30');
  const [classDuration, setClassDuration] = useState(120);

  useEffect(() => {
    // Initialize Google API when component mounts (optional)
    initializeGoogleAPI()
      .then(() => {
        setGoogleApiReady(true);
      })
      .catch((error) => {
        console.error('Failed to initialize Google API:', error);
        // Don't set error - just silently disable the feature
        setGoogleApiReady(false);
      });
  }, []);

  const handleFetchCalendarEvents = async () => {
    setIsLoadingCalendar(true);
    setCalendarError('');

    try {
      const events = await signInAndFetchEvents(scheduleDate);
      setCalendarEvents(events);
      if (events.length === 0) {
        setCalendarError('No events found for this date');
      }
    } catch (error: any) {
      console.error('Error fetching calendar events:', error);
      setCalendarError(error.message || 'Failed to fetch calendar events. Please try again.');
    } finally {
      setIsLoadingCalendar(false);
    }
  };

  const handleNext = () => {
    const events: SpecialEvent[] = [];

    if (hasTravel) {
      events.push({
        type: 'travel',
        name: travelRoute,
        startTime: travelTime,
        duration: travelDuration,
      });
    }

    if (hasGym) {
      events.push({
        type: 'gym',
        preferredTime: gymTime.toLowerCase(),
        duration: gymDuration,
        prepTime: 30,
      });
    }

    if (hasClass) {
      events.push({
        type: 'class',
        name: className,
        startTime: classTime,
        duration: classDuration,
        prepTime: 30,
      });
    }

    setSpecialEvents(events);
    onNext();
  };

  return (
    <div className="screen active">
      <h2>📅 Schedule Setup</h2>

      <div className="form-group">
        <label>Which day are you scheduling for?</label>
        <input
          type="date"
          value={scheduleDate}
          onChange={(e) => setScheduleDate(e.target.value)}
          min={new Date().toISOString().split('T')[0]}
        />
        <small>Usually for tomorrow or future days</small>
      </div>

      <div className="form-group">
        <label>📅 Google Calendar Integration</label>
        <button
          type="button"
          className="btn"
          onClick={handleFetchCalendarEvents}
          disabled={isLoadingCalendar || !googleApiReady}
        >
          {isLoadingCalendar ? 'Fetching...' : 'Fetch Calendar Events'}
        </button>
        {calendarError && <p className="error-text">{calendarError}</p>}
        {calendarEvents.length > 0 && (
          <div className="calendar-events">
            <h4>Found {calendarEvents.length} calendar event(s):</h4>
            {calendarEvents.map((event) => (
              <div key={event.id} className="calendar-event-item">
                <strong>{event.summary}</strong>
                {event.start.dateTime && (
                  <span> - {new Date(event.start.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} to {new Date(event.end.dateTime!).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                )}
                {event.location && <span> @ {event.location}</span>}
              </div>
            ))}
            <small>✓ These meetings will be avoided when scheduling</small>
          </div>
        )}
      </div>

      <p>Any special activities or constraints for this day?</p>

      <div className="special-events">
        <h3>🚌 Travel/Commute</h3>
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="hasTravel"
            checked={hasTravel}
            onChange={(e) => setHasTravel(e.target.checked)}
          />
          <label htmlFor="hasTravel">Traveling to office/other location</label>
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="From - To (e.g., Home to Office)"
            value={travelRoute}
            onChange={(e) => setTravelRoute(e.target.value)}
            disabled={!hasTravel}
          />
          <input
            type="time"
            value={travelTime}
            onChange={(e) => setTravelTime(e.target.value)}
            disabled={!hasTravel}
          />
          <input
            type="number"
            placeholder="Travel time (minutes)"
            value={travelDuration}
            onChange={(e) => setTravelDuration(parseInt(e.target.value))}
            disabled={!hasTravel}
          />
        </div>
      </div>

      <div className="special-events">
        <h3>💪 Fitness</h3>
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="hasGym"
            checked={hasGym}
            onChange={(e) => setHasGym(e.target.checked)}
          />
          <label htmlFor="hasGym">Going to gym</label>
        </div>
        <div className="form-group">
          <select
            value={gymTime}
            onChange={(e) => setGymTime(e.target.value)}
            disabled={!hasGym}
          >
            <option>Any time</option>
            <option>Morning (preferred)</option>
            <option>Afternoon</option>
            <option>Evening</option>
          </select>
          <input
            type="number"
            placeholder="Duration (minutes)"
            value={gymDuration}
            onChange={(e) => setGymDuration(parseInt(e.target.value))}
            disabled={!hasGym}
          />
        </div>
      </div>

      <div className="special-events">
        <h3>🎓 Classes/Appointments</h3>
        <div className="checkbox-group">
          <input
            type="checkbox"
            id="hasClass"
            checked={hasClass}
            onChange={(e) => setHasClass(e.target.checked)}
          />
          <label htmlFor="hasClass">Scheduled class/appointment</label>
        </div>
        <div className="form-group">
          <input
            type="text"
            placeholder="Class/appointment name"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            disabled={!hasClass}
          />
          <input
            type="time"
            value={classTime}
            onChange={(e) => setClassTime(e.target.value)}
            disabled={!hasClass}
          />
          <input
            type="number"
            placeholder="Duration (minutes)"
            value={classDuration}
            onChange={(e) => setClassDuration(parseInt(e.target.value))}
            disabled={!hasClass}
          />
        </div>
      </div>

      <div className="navigation">
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button type="button" className="btn" onClick={handleNext}>
          Next →
        </button>
      </div>
    </div>
  );
};

export default SpecialEventsSetup;