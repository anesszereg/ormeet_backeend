import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DateTimeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  currentTime: string;
  onDateTimeChange?: (date: string, time: string) => void;
}

const DateTimeModal = ({ isOpen, onClose, currentDate, currentTime, onDateTimeChange }: DateTimeModalProps) => {
  const { t } = useTranslation('organizer');
  const [selectedDate, setSelectedDate] = useState<number>(17);
  const [selectedMonth, setSelectedMonth] = useState<number>(4);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('6:30 PM – 7:30 PM');

  if (!isOpen) return null;

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
  const firstDayOfMonth = new Date(selectedYear, selectedMonth - 1, 1).getDay();

  const handlePrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedMonth(12);
      setSelectedYear(selectedYear - 1);
    } else {
      setSelectedMonth(selectedMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 12) {
      setSelectedMonth(1);
      setSelectedYear(selectedYear + 1);
    } else {
      setSelectedMonth(selectedMonth + 1);
    }
  };

  const handleDateSelect = (day: number) => {
    setSelectedDate(day);
  };

  const handleTimeSlotSelect = (timeSlot: string) => {
    setSelectedTimeSlot(timeSlot);
  };

  const renderCalendarDays = () => {
    const days = [];
    const totalCells = Math.ceil((firstDayOfMonth + daysInMonth) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - firstDayOfMonth + 1;
      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
      const isSelected = isValidDay && dayNumber === selectedDate;

      days.push(
        <button
          key={i}
          onClick={() => isValidDay && handleDateSelect(dayNumber)}
          disabled={!isValidDay}
          className={`h-10 flex items-center justify-center text-sm font-medium rounded-full transition-colors ${
            isSelected
              ? 'bg-[#FF4000] text-white'
              : isValidDay
              ? 'text-black hover:bg-[#F5F5F5]'
              : 'text-transparent cursor-default'
          }`}
        >
          {isValidDay ? dayNumber : ''}
        </button>
      );
    }

    return days;
  };

  const timeSlots = [
    '6:30 PM – 7:30 PM',
    '8:30 PM – 9:30 PM'
  ];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-[660px] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-[#EEEEEE]">
          <h2 className="text-lg font-bold text-black mb-2">{t('dateTimeModal.title')}</h2>
          <p className="text-sm text-black mb-1">
            Saturday, April 20, 2025 <span className="text-[#757575] mx-2">|</span> 3:00 PM – 11:00 PM
          </p>
          <button onClick={onClose} className="text-sm font-medium text-[#FF4000] hover:underline">
            {t('dateTimeModal.closeCalendar')}
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendar Section */}
            <div>
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6">
                <button
                  onClick={handlePrevMonth}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M12.5 15L7.5 10L12.5 5" stroke="#181818" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="flex items-center gap-2">
                  <span className="text-base font-semibold text-black">{monthNames[selectedMonth - 1]} {selectedYear}</span>
                  <button className="w-8 h-8 flex items-center justify-center rounded-full bg-black text-white">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 4V12M4 8H12" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                <button
                  onClick={handleNextMonth}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M7.5 15L12.5 10L7.5 5" stroke="#181818" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>

              {/* Calendar Grid */}
              <div>
                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {(['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const).map((day) => (
                    <div key={day} className="h-10 flex items-center justify-center text-xs font-medium text-[#757575]">
                      {t(`dateTimeModal.days.${day}`)}
                    </div>
                  ))}
                </div>

                {/* Calendar Days */}
                <div className="grid grid-cols-7 gap-1">
                  {renderCalendarDays()}
                </div>
              </div>
            </div>

            {/* Time Slots Section */}
            <div>
              <div className="bg-[#F8F8F8] rounded-xl p-4">
                <h3 className="text-sm font-semibold text-black mb-2">
                  {t('dateTimeModal.timesAvailable_other', { count: timeSlots.length, date: 'Tue, May 17' })}
                </h3>
                <p className="text-xs text-[#757575] mb-4">
                  {t('dateTimeModal.selectTimeSubtitle')}
                </p>

                {/* Time Slot Options */}
                <div className="space-y-2">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      onClick={() => handleTimeSlotSelect(slot)}
                      className={`w-full px-4 py-3 rounded-lg text-sm font-medium text-start transition-colors ${
                        selectedTimeSlot === slot
                          ? 'bg-white text-black border-2 border-[#FF4000]'
                          : 'bg-white text-black hover:bg-[#EEEEEE]'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DateTimeModal;
