import React from 'react';
import { UserProfile } from '../types';

interface CycleInfoProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  energyLevel: string;
  setEnergyLevel: React.Dispatch<React.SetStateAction<string>>;
  onNext: () => void;
  onBack: () => void;
}

const CycleInfo: React.FC<CycleInfoProps> = ({
  userProfile,
  setUserProfile,
  energyLevel,
  setEnergyLevel,
  onNext,
  onBack,
}) => {
  const handleCyclePhaseChange = (phase: string) => {
    setUserProfile(prev => ({ ...prev, cyclePhase: phase }));
  };

  return (
    <div className="screen active">
      <h2>🌸 Cycle Information</h2>
      <p>Help us optimize your schedule based on your natural rhythms:</p>

      <div className="cycle-info">
        <div className="form-group">
          <label>Current Cycle Phase</label>
          <select
            value={userProfile.cyclePhase || ''}
            onChange={(e) => handleCyclePhaseChange(e.target.value)}
          >
            <option value="">-- Select --</option>
            <option value="menstrual">Menstrual</option>
            <option value="follicular">Follicular</option>
            <option value="ovulatory">Ovulation</option>
            <option value="luteal">Luteal</option>
          </select>
          <small>Select the phase you are currently in</small>
        </div>

        <div className="form-group">
          <label>How are you feeling today?</label>
          <select value={energyLevel} onChange={(e) => setEnergyLevel(e.target.value)}>
            <option value="high">High energy - ready for challenges</option>
            <option value="medium">Medium energy - normal day</option>
            <option value="low">Low energy - need gentle activities</option>
            <option value="pms">PMS symptoms - self-care focus</option>
          </select>
        </div>
      </div>

      <div className="navigation">
        <button type="button" className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <button type="button" className="btn" onClick={onNext}>
          Generate Schedule →
        </button>
      </div>
    </div>
  );
};

export default CycleInfo;