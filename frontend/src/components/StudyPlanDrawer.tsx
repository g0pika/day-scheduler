import React from 'react';
import './StudyPlanDrawer.css';

interface StudyPlanDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  studyPlan: string;
  setStudyPlan: React.Dispatch<React.SetStateAction<string>>;
}

const StudyPlanDrawer: React.FC<StudyPlanDrawerProps> = ({
  isOpen,
  onClose,
  studyPlan,
  setStudyPlan,
}) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div className="study-drawer-overlay" onClick={onClose} />
      )}

      {/* Side Drawer */}
      <div className={`study-drawer ${isOpen ? 'open' : ''}`}>
        <div className="study-drawer-header">
          <h2 className="study-drawer-title">📚 Customize Study Plan</h2>
          <button onClick={onClose} className="study-drawer-close">
            ×
          </button>
        </div>

        <div className="study-drawer-description">
          <p>
            Enter what you want to study today. You can paste topics, chapters, or specific goals.
          </p>
          <p className="example">
            Example: "Data Structures: Trees & Graphs", "Algorithms: Dynamic Programming practice problems", etc.
          </p>
        </div>

        <div className="form-group">
          <label className="study-drawer-label">
            Today's Study Topics
          </label>
          <textarea
            value={studyPlan}
            onChange={(e) => setStudyPlan(e.target.value)}
            placeholder="Paste or type your study topics here...&#10;&#10;For example:&#10;- Data Structures: Binary Trees&#10;- Algorithms: Sorting (Quick & Merge)&#10;- Practice: 5 coding problems&#10;- Review: Previous week's notes"
            className="study-drawer-textarea"
          />
        </div>

        <div className="study-drawer-tip">
          <strong>💡 Tip:</strong> The AI will incorporate these topics into your schedule during your best study time (6-9 AM) and other study blocks.
        </div>

        <div className="study-drawer-actions">
          <button
            type="button"
            className="btn"
            onClick={onClose}
          >
            ✓ Save Study Plan
          </button>
          {studyPlan && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStudyPlan('')}
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default StudyPlanDrawer;
