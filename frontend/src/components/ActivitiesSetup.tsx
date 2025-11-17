import React, { useState } from 'react';
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
  const [activityText, setActivityText] = useState('');

  const parseActivities = () => {
    // Parse the text input for activities in markdown checkbox format
    const lines = activityText.split('\n');
    const parsedActivities: Activity[] = [];
    let idCounter = 1;

    lines.forEach(line => {
      // Match patterns like "- [ ] activity" or "* [ ] activity" or just "activity"
      const trimmed = line.trim();
      let activityName = '';
      
      if (trimmed.startsWith('- [ ]') || trimmed.startsWith('* [ ]')) {
        activityName = trimmed.replace(/^[-*]\s*\[\s*\]\s*/, '').trim();
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        activityName = trimmed.replace(/^[-*]\s*/, '').trim();
      } else if (trimmed.startsWith('[ ]')) {
        activityName = trimmed.replace(/^\[\s*\]\s*/, '').trim();
      } else if (trimmed) {
        activityName = trimmed;
      }

      if (activityName) {
        parsedActivities.push({
          id: idCounter++,
          name: activityName,
          category: 'leisure',
        });
      }
    });

    if (parsedActivities.length > 0) {
      setActivities(parsedActivities);
    }
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


  return (
    <div className="screen active">
      <h2>🎯 Leisure Activities</h2>
      <p>Paste or type your activities (one per line):</p>

      <div className="form-group">
        <label>Activity List</label>
        <textarea
          className="activity-textarea"
          placeholder={`Enter activities like:
- [ ] Try a Piña Colada
- [ ] Opt for White Sneakers
- [ ] Experiment with Basil Hummus
- [ ] Try a new coffee blend
- [ ] Plan a virtual movie night

Or just list them:
painting
build dioramas
start a new book series`}
          value={activityText}
          onChange={(e) => setActivityText(e.target.value)}
          rows={10}
        />

        <button type="button" className="btn btn-secondary" onClick={parseActivities}>
          Parse Activities
        </button>
      </div>

      {activities.length > 0 && (
        <>
          <h3>Parsed Activities ({activities.length}):</h3>
          <div className="activity-list">
            {activities.map(activity => (
              <div key={activity.id} className="activity-card">
                <div className="activity-name">{activity.name}</div>
                <div className="activity-controls">
                  <input
                    type="number"
                    placeholder="Duration (AI will detect)"
                    value={activity.duration ?? ''}
                    min="10"
                    max="240"
                    onChange={(e) => updateActivity(activity.id, 'duration', e.target.value)}
                  />
                  <select
                    value={activity.preferredTime ?? 'any'}
                    onChange={(e) => updateActivity(activity.id, 'preferredTime', e.target.value)}
                  >
                    <option value="any">Any time (AI will detect)</option>
                    <option value="morning">Morning</option>
                    <option value="afternoon">Afternoon</option>
                    <option value="evening">Evening</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn-secondary small"
                    onClick={() => removeActivity(activity.id)}
                  >
                    ×
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="form-group">
        <label>How many activities to include per day?</label>
        <select
          value={selectedActivityCount}
          onChange={(e) => setSelectedActivityCount(parseInt(e.target.value))}
        >
          {[...Array(Math.min(10, activities.length || 1))].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1} {i === 0 ? 'activity' : 'activities'}
            </option>
          ))}
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