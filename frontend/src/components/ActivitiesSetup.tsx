import React from 'react';
import { Activity } from '../types';

interface ActivitiesSetupProps {
  activities: Activity[];
  setActivities: React.Dispatch<React.SetStateAction<Activity[]>>;
  selectedActivityCount: number;
  setSelectedActivityCount: React.Dispatch<React.SetStateAction<number>>;
  onNext: () => void;
  onBack: () => void;
}

const ActivitiesSetup: React.FC<ActivitiesSetupProps> = ({
  activities,
  setActivities,
  selectedActivityCount,
  setSelectedActivityCount,
  onNext,
  onBack,
}) => {
  const addActivity = () => {
    const newId = Math.max(...activities.map(a => a.id), 0) + 1;
    setActivities([...activities, {
      id: newId,
      name: '',
      duration: 30,
      preferredTime: 'any',
      category: 'leisure',
    }]);
  };

  const removeActivity = (id: number) => {
    setActivities(activities.filter(a => a.id !== id));
  };

  const updateActivity = (id: number, field: keyof Activity, value: any) => {
    setActivities(activities.map(activity =>
      activity.id === id
        ? { ...activity, [field]: field === 'duration' ? parseInt(value) : value }
        : activity
    ));
  };

  React.useEffect(() => {
    if (activities.length === 0) {
      addActivity();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="screen active">
      <h2>🎯 Leisure Activities</h2>
      <p>Add activities you'd like included in your daily schedule:</p>

      <div className="activity-list">
        {activities.map(activity => (
          <div key={activity.id} className="activity-card">
            <input
              type="text"
              placeholder="Activity name"
              value={activity.name}
              onChange={(e) => updateActivity(activity.id, 'name', e.target.value)}
            />
            <input
              type="number"
              placeholder="Duration (minutes)"
              value={activity.duration}
              min="10"
              max="240"
              onChange={(e) => updateActivity(activity.id, 'duration', e.target.value)}
            />
            <select
              value={activity.preferredTime}
              onChange={(e) => updateActivity(activity.id, 'preferredTime', e.target.value)}
            >
              <option value="any">Any time</option>
              <option value="morning">Morning</option>
              <option value="afternoon">Afternoon</option>
              <option value="evening">Evening</option>
            </select>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => removeActivity(activity.id)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="btn btn-secondary" onClick={addActivity}>
        + Add Activity
      </button>

      <div className="form-group">
        <label>How many activities per day?</label>
        <select
          value={selectedActivityCount}
          onChange={(e) => setSelectedActivityCount(parseInt(e.target.value))}
        >
          <option value="1">1 activity</option>
          <option value="2">2 activities</option>
          <option value="3">3 activities</option>
        </select>
      </div>

      <div className="navigation">
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button type="button" className="btn" onClick={onNext}>
          Next: Special Events →
        </button>
      </div>
    </div>
  );
};

export default ActivitiesSetup;