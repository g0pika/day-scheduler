import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  return (
    <div className="step-indicator">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div
          key={step}
          className={`step ${
            step < currentStep ? 'completed' : step === currentStep ? 'active' : ''
          }`}
        >
          {step}
        </div>
      ))}
    </div>
  );
};

export default StepIndicator;