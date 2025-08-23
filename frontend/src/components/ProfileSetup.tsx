import React from 'react';
import { UserProfile } from '../types';

interface ProfileSetupProps {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  onNext: () => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ userProfile, setUserProfile, onNext }) => {
  const handleInputChange = (field: keyof UserProfile, value: string | boolean | number) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="screen active">
      <h2>📝 Basic Profile Setup</h2>
      <form onSubmit={(e) => { e.preventDefault(); onNext(); }}>
        <div className="form-group">
          <label>Work Hours per Day</label>
          <input
            type="number"
            value={userProfile.workHours}
            onChange={(e) => handleInputChange('workHours', parseInt(e.target.value))}
            min="0"
            required
          />
          <small>Remote work hours</small>
        </div>

        <div className="form-group">
          <label>Study Hours per Day</label>
          <input
            type="number"
            value={userProfile.studyHours}
            onChange={(e) => handleInputChange('studyHours', parseInt(e.target.value))}
            min="0"
            required
          />
          <small>Personal study/exam preparation</small>
        </div>

        <div className="form-group">
          <label>Number of Household Chores</label>
          <input
            type="number"
            value={userProfile.householdChores}
            onChange={(e) => handleInputChange('householdChores', parseInt(e.target.value))}
            min="0"
            required
          />
        </div>

        <div className="form-group">
          <label>Sleep Hours Needed</label>
          <select
            value={userProfile.sleepHours}
            onChange={(e) => handleInputChange('sleepHours', parseInt(e.target.value))}
            required
          >
            <option value="7">7 hours</option>
            <option value="8">8 hours</option>
            <option value="9">9 hours</option>
          </select>
        </div>

        <div className="checkbox-group">
          <input
            type="checkbox"
            id="isFemale"
            checked={userProfile.isFemale}
            onChange={(e) => handleInputChange('isFemale', e.target.checked)}
          />
          <label htmlFor="isFemale">I am female (for cycle-based planning)</label>
        </div>

        <div className="navigation">
          <div></div>
          <button type="submit" className="btn">Next: Activities →</button>
        </div>
      </form>
    </div>
  );
};

export default ProfileSetup;