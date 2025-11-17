import React from 'react';

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
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 999,
          }}
          onClick={onClose}
        />
      )}

      {/* Side Drawer */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          right: isOpen ? 0 : '-400px',
          width: '400px',
          height: '100vh',
          backgroundColor: 'white',
          boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
          transition: 'right 0.3s ease-in-out',
          zIndex: 1000,
          padding: '20px',
          overflowY: 'auto',
        }}
      >
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '24px' }}>📚 Customize Study Plan</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '28px',
              cursor: 'pointer',
              padding: '5px',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ marginBottom: '15px' }}>
          <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
            Enter what you want to study today. You can paste topics, chapters, or specific goals.
          </p>
          <p style={{ color: '#888', fontSize: '12px', fontStyle: 'italic' }}>
            Example: "Data Structures: Trees & Graphs", "Algorithms: Dynamic Programming practice problems", etc.
          </p>
        </div>

        <div className="form-group">
          <label style={{ fontWeight: 'bold', marginBottom: '8px', display: 'block' }}>
            Today's Study Topics
          </label>
          <textarea
            value={studyPlan}
            onChange={(e) => setStudyPlan(e.target.value)}
            placeholder="Paste or type your study topics here...&#10;&#10;For example:&#10;- Data Structures: Binary Trees&#10;- Algorithms: Sorting (Quick & Merge)&#10;- Practice: 5 coding problems&#10;- Review: Previous week's notes"
            style={{
              width: '100%',
              minHeight: '300px',
              padding: '12px',
              fontSize: '14px',
              fontFamily: 'monospace',
              border: '1px solid #ddd',
              borderRadius: '5px',
              resize: 'vertical',
            }}
          />
        </div>

        <div style={{ marginTop: '20px' }}>
          <div style={{ padding: '12px', backgroundColor: '#e3f2fd', borderRadius: '5px', fontSize: '13px' }}>
            <strong>💡 Tip:</strong> The AI will incorporate these topics into your schedule during your best study time (6-9 AM) and other study blocks.
          </div>
        </div>

        <div style={{ marginTop: '20px' }}>
          <button
            type="button"
            className="btn"
            onClick={onClose}
            style={{ width: '100%' }}
          >
            ✓ Save Study Plan
          </button>
          {studyPlan && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setStudyPlan('')}
              style={{ width: '100%', marginTop: '10px' }}
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
