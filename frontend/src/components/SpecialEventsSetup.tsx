import React, { useState } from 'react';
import { SpecialEvent } from '../types';

interface SpecialEventsSetupProps {
  specialEvents: SpecialEvent[];
  setSpecialEvents: React.Dispatch<React.SetStateAction<SpecialEvent[]>>;
  dayType: string;
  setDayType: React.Dispatch<React.SetStateAction<string>>;
  onNext: () => void;
  onBack: () => void;
}

const SpecialEventsSetup: React.FC<SpecialEventsSetupProps> = ({
  specialEvents,
  setSpecialEvents,
  dayType,
  setDayType,
  onNext,
  onBack,
}) => {
  const [hasTravel, setHasTravel] = useState(false);
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
      <h2>📅 Today's Special Events</h2>
      <p>Any special activities or constraints for today?</p>

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

      <div className="form-group">
        <label>Day Type</label>
        <select value={dayType} onChange={(e) => setDayType(e.target.value)}>
          <option value="weekday">Regular Weekday</option>
          <option value="weekend">Weekend</option>
          <option value="sunday">Sunday (study priority)</option>
        </select>
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