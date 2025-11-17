import React, { useState } from 'react';
import './CalendarView.css';

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

      let className = 'calendar-day';
      if (selected) className += ' selected';
      else if (today) className += ' today';

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={className}
        >
          {day}
        </div>
      );
    }

    return days;
  };

  return (
    <div className="calendar-container">
      {/* Calendar Header */}
      <div className="calendar-header">
        <button onClick={previousMonth} className="calendar-nav-btn">
          ←
        </button>
        <h3 className="calendar-month-title">
          {monthNames[month]} {year}
        </h3>
        <button onClick={nextMonth} className="calendar-nav-btn">
          →
        </button>
      </div>

      {/* Day Names */}
      <div className="calendar-day-names">
        {dayNames.map((day) => (
          <div key={day} className="calendar-day-name">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="calendar-days-grid">
        {renderCalendarDays()}
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <div className="calendar-legend-item">
          <div className="calendar-legend-dot today" />
          <span>Today</span>
        </div>
        <div className="calendar-legend-item">
          <div className="calendar-legend-dot selected" />
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
