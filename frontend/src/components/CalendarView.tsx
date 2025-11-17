import React, { useState } from 'react';

interface CalendarViewProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ selectedDate, onDateSelect }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const previousMonth = () => {
    setCurrentMonth(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(year, month + 1, 1));
  };

  const handleDateClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onDateSelect(dateStr);
  };

  const isSelectedDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr === selectedDate;
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  const renderCalendarDays = () => {
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} style={{ padding: '10px' }} />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const selected = isSelectedDate(day);
      const today = isToday(day);

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          style={{
            padding: '10px',
            textAlign: 'center',
            cursor: 'pointer',
            borderRadius: '50%',
            backgroundColor: selected ? '#5469d4' : today ? '#e3f2fd' : 'transparent',
            color: selected ? 'white' : today ? '#5469d4' : '#333',
            fontWeight: selected || today ? 'bold' : 'normal',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!selected) {
              e.currentTarget.style.backgroundColor = '#f5f5f5';
            }
          }}
          onMouseLeave={(e) => {
            if (!selected) {
              e.currentTarget.style.backgroundColor = today ? '#e3f2fd' : 'transparent';
            }
          }}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '20px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
        maxWidth: '350px',
        margin: '0 auto',
      }}
    >
      {/* Calendar Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={previousMonth}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '5px 10px',
          }}
        >
          ←
        </button>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold' }}>
          {monthNames[month]} {year}
        </h3>
        <button
          onClick={nextMonth}
          style={{
            background: 'none',
            border: 'none',
            fontSize: '20px',
            cursor: 'pointer',
            padding: '5px 10px',
          }}
        >
          →
        </button>
      </div>

      {/* Day Names */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '5px',
          marginBottom: '10px',
        }}
      >
        {dayNames.map((day) => (
          <div
            key={day}
            style={{
              textAlign: 'center',
              fontSize: '12px',
              fontWeight: 'bold',
              color: '#666',
              padding: '5px',
            }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '5px',
        }}
      >
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: '20px',
          fontSize: '12px',
          color: '#666',
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#e3f2fd',
            }}
          />
          <span>Today</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: '#5469d4',
            }}
          />
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
