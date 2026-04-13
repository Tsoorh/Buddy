import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from 'lucide-react';
import './DateTimePicker.css';

interface DateTimePickerProps {
  value: string; // ISO string or datetime-local string
  onChange: (value: string) => void;
  label?: string;
}

const DateTimePicker: React.FC<DateTimePickerProps> = ({ value, onChange, label }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const hourScrollRef = useRef<HTMLDivElement>(null);
  const minScrollRef = useRef<HTMLDivElement>(null);

  // Parse initial value
  const dateObj = value ? new Date(value) : new Date();
  const [currentMonth, setCurrentMonth] = useState(new Date(dateObj.getFullYear(), dateObj.getMonth(), 1));

  useEffect(() => {
    if (isOpen) {
      // Auto-scroll to selected time with a small delay to ensure DOM is ready
      setTimeout(() => {
        const hour = dateObj.getHours();
        const min = dateObj.getMinutes();
        
        if (hourScrollRef.current) {
          hourScrollRef.current.scrollTo({
            top: hour * 40,
            behavior: 'smooth'
          });
        }
        if (minScrollRef.current) {
          minScrollRef.current.scrollTo({
            top: min * 40,
            behavior: 'smooth'
          });
        }
      }, 10);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDateForInput = (date: Date) => {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(dateObj);
    newDate.setFullYear(currentMonth.getFullYear());
    newDate.setMonth(currentMonth.getMonth());
    newDate.setDate(day);
    onChange(formatDateForInput(newDate));
  };

  const handleTimeChange = (type: 'hour' | 'minute', val: number) => {
    const newDate = new Date(dateObj);
    if (type === 'hour') newDate.setHours(val);
    else newDate.setMinutes(val);
    onChange(formatDateForInput(newDate));
  };

  const handleNow = () => {
    const now = new Date();
    onChange(formatDateForInput(now));
    setIsOpen(false);
  };

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const renderCalendar = () => {
    const days = [];
    const totalDays = daysInMonth(currentMonth.getFullYear(), currentMonth.getMonth());
    const startDay = firstDayOfMonth(currentMonth.getFullYear(), currentMonth.getMonth());

    // Padding for first week
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`pad-${i}`} className="calendar-day empty"></div>);
    }

    for (let d = 1; d <= totalDays; d++) {
      const isSelected = dateObj.getDate() === d && 
                         dateObj.getMonth() === currentMonth.getMonth() && 
                         dateObj.getFullYear() === currentMonth.getFullYear();
      days.push(
        <div 
          key={d} 
          className={`calendar-day ${isSelected ? 'selected' : ''}`}
          onClick={() => handleDateSelect(d)}
        >
          {d}
        </div>
      );
    }
    return days;
  };

  return (
    <div className="datetime-picker-container" ref={containerRef}>
      {label && <label className="auth-label">{label}</label>}
      <div className="picker-input-wrapper" onClick={() => setIsOpen(!isOpen)}>
        <input 
          type="text" 
          className="auth-input w-100" 
          readOnly 
          value={value ? value.replace('T', ' ') : 'Select Date & Time'} 
        />
        <CalendarIcon className="picker-icon" size={18} />
      </div>

      {isOpen && (
        <div className="picker-popover glass-card">
          <div className="picker-split-view">
            {/* Left: Calendar */}
            <div className="calendar-section">
              <div className="calendar-header">
                <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
                  <ChevronLeft size={18} />
                </button>
                <span className="current-month-label">
                  {currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}
                </span>
                <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
                  <ChevronRight size={18} />
                </button>
              </div>
              <div className="calendar-weekdays">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="calendar-grid">
                {renderCalendar()}
              </div>
              <div className="picker-footer">
                <button type="button" className="btn-now" onClick={handleNow}>Now</button>
              </div>
            </div>

            {/* Right: Time Picker */}
            <div className="time-section">
              <div className="time-picker-visual-guide"></div>
              <div className="time-column-header">Hour</div>
              <div className="time-scroll-container" ref={hourScrollRef}>
                {Array.from({ length: 24 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`time-item ${dateObj.getHours() === i ? 'selected' : ''}`}
                    onClick={() => handleTimeChange('hour', i)}
                  >
                    {i.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
              <div className="time-column-header mt-2">Min</div>
              <div className="time-scroll-container" ref={minScrollRef}>
                {Array.from({ length: 60 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`time-item ${dateObj.getMinutes() === i ? 'selected' : ''}`}
                    onClick={() => handleTimeChange('minute', i)}
                  >
                    {i.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <button className="picker-close" onClick={() => setIsOpen(false)}>
            <X size={16} />
          </button>
        </div>
      )}
    </div>
  );
};

export default DateTimePicker;
