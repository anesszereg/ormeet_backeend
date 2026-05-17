import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface StaticTimePickerProps {
  value: string;
  onChange: (time: string) => void;
  onClose: () => void;
}

const StaticTimePicker: React.FC<StaticTimePickerProps> = ({ value, onChange, onClose }) => {
  const { t } = useTranslation('organizer');
  const [mode, setMode] = useState<'hour' | 'minute'>('hour');
  const [selectedHour, setSelectedHour] = useState<number | null>(() => {
    if (value) {
      const [h] = value.split(':');
      const hour24 = parseInt(h);
      return hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
    }
    return null;
  });
  
  const [selectedMinute, setSelectedMinute] = useState<number | null>(() => {
    if (value) {
      const [, m] = value.split(':');
      return parseInt(m);
    }
    return null;
  });
  
  const [period, setPeriod] = useState<'AM' | 'PM'>(() => {
    if (value) {
      const [h] = value.split(':');
      return parseInt(h) >= 12 ? 'PM' : 'AM';
    }
    return 'AM';
  });

  const handleHourClick = (hour: number) => {
    setSelectedHour(hour);
    setMode('minute');
  };

  const handleMinuteClick = (minute: number) => {
    setSelectedMinute(minute);
    // Auto-apply and close after minute selection
    if (selectedHour !== null) {
      let hour24 = selectedHour;
      if (period === 'PM' && selectedHour !== 12) {
        hour24 = selectedHour + 12;
      } else if (period === 'AM' && selectedHour === 12) {
        hour24 = 0;
      }
      const timeString = `${hour24.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      onChange(timeString);
      onClose();
    }
  };

  const handlePeriodToggle = (newPeriod: 'AM' | 'PM') => {
    setPeriod(newPeriod);
  };

  const displayHour = selectedHour !== null ? selectedHour.toString().padStart(2, '0') : '--';
  const displayMinute = selectedMinute !== null ? selectedMinute.toString().padStart(2, '0') : '--';
  const displayTime = `${displayHour}:${displayMinute}`;

  // Generate clock positions for hours (1-12)
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Generate minutes (0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55)
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5);

  const getClockPosition = (index: number, total: number) => {
    const angle = (index * 360) / total - 90;
    const radian = (angle * Math.PI) / 180;
    const radius = 85;
    return {
      x: radius * Math.cos(radian),
      y: radius * Math.sin(radian)
    };
  };

  return (
    <div className="absolute z-50 mt-2 bg-white border border-light-gray rounded-lg shadow-lg p-4 w-[380px]">
      <div className="flex items-start gap-4">
        {/* Left side - Time display and AM/PM selector */}
        <div className="flex flex-col items-start gap-2">
          <span className="text-xs font-medium text-gray uppercase tracking-wide">{t('timePicker.selectTimeLabel')}</span>
          
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setMode('hour')}
              className={`text-4xl font-bold tracking-tight transition-colors ${
                mode === 'hour' ? 'text-primary' : 'text-gray hover:text-black'
              }`}
            >
              {displayHour}
            </button>
            <span className="text-4xl font-bold text-gray">:</span>
            <button
              type="button"
              onClick={() => selectedHour !== null && setMode('minute')}
              className={`text-4xl font-bold tracking-tight transition-colors ${
                mode === 'minute' ? 'text-primary' : 'text-gray hover:text-black'
              }`}
            >
              {displayMinute}
            </button>
          </div>
          
          <div className="flex gap-1.5 mt-1">
            <button
              type="button"
              onClick={() => handlePeriodToggle('AM')}
              className={`px-3 py-1 text-sm font-medium rounded transition-all ${
                period === 'AM'
                  ? 'bg-primary-light text-primary'
                  : 'text-gray hover:bg-secondary-light'
              }`}
            >
              AM
            </button>
            <button
              type="button"
              onClick={() => handlePeriodToggle('PM')}
              className={`px-3 py-1 text-sm font-medium rounded transition-all ${
                period === 'PM'
                  ? 'bg-primary-light text-primary'
                  : 'text-gray hover:bg-secondary-light'
              }`}
            >
              PM
            </button>
          </div>
        </div>

        {/* Right side - Clock face */}
        <div className="relative">
          <div className="w-48 h-48 rounded-full bg-[#F5F5F5] relative flex items-center justify-center">
            {/* Clock numbers - Hours or Minutes based on mode */}
            {mode === 'hour' ? (
              hours.map((hour, index) => {
                const pos = getClockPosition(index, 12);
                const isSelected = selectedHour === hour;
                return (
                  <button
                    key={hour}
                    type="button"
                    onClick={() => handleHourClick(hour)}
                    className={`absolute w-7 h-7 flex items-center justify-center text-xs font-medium rounded-full transition-all ${
                      isSelected
                        ? 'bg-primary text-white scale-110'
                        : 'text-black hover:bg-white'
                    }`}
                    style={{
                      left: `calc(50% + ${pos.x * 0.75}px - 14px)`,
                      top: `calc(50% + ${pos.y * 0.75}px - 14px)`
                    }}
                  >
                    {hour}
                  </button>
                );
              })
            ) : (
              minutes.map((minute, index) => {
                const pos = getClockPosition(index, 12);
                const isSelected = selectedMinute === minute;
                return (
                  <button
                    key={minute}
                    type="button"
                    onClick={() => handleMinuteClick(minute)}
                    className={`absolute w-7 h-7 flex items-center justify-center text-xs font-medium rounded-full transition-all ${
                      isSelected
                        ? 'bg-primary text-white scale-110'
                        : 'text-black hover:bg-white'
                    }`}
                    style={{
                      left: `calc(50% + ${pos.x * 0.75}px - 14px)`,
                      top: `calc(50% + ${pos.y * 0.75}px - 14px)`
                    }}
                  >
                    {minute.toString().padStart(2, '0')}
                  </button>
                );
              })
            )}

            {/* Clock hand */}
            {mode === 'hour' && selectedHour !== null && (() => {
              const hourIndex = selectedHour === 12 ? 11 : selectedHour - 1;
              const pos = getClockPosition(hourIndex, 12);
              const angle = (hourIndex * 360) / 12 - 90;
              return (
                <>
                  <div
                    className="absolute w-0.5 bg-primary origin-left"
                    style={{
                      height: '2px',
                      left: '50%',
                      top: '50%',
                      transform: `rotate(${angle}deg)`,
                      width: '64px'
                    }}
                  />
                  <div className="absolute w-1.5 h-1.5 bg-primary rounded-full" style={{ left: 'calc(50% - 3px)', top: 'calc(50% - 3px)' }} />
                  <div
                    className="absolute w-7 h-7 bg-primary rounded-full flex items-center justify-center"
                    style={{
                      left: `calc(50% + ${pos.x * 0.75}px - 14px)`,
                      top: `calc(50% + ${pos.y * 0.75}px - 14px)`
                    }}
                  >
                    <span className="text-white text-xs font-medium">{selectedHour}</span>
                  </div>
                </>
              );
            })()}
            {mode === 'minute' && selectedMinute !== null && (() => {
              const minuteIndex = selectedMinute / 5;
              const pos = getClockPosition(minuteIndex, 12);
              const angle = (minuteIndex * 360) / 12 - 90;
              return (
                <>
                  <div
                    className="absolute w-0.5 bg-primary origin-left"
                    style={{
                      height: '2px',
                      left: '50%',
                      top: '50%',
                      transform: `rotate(${angle}deg)`,
                      width: '64px'
                    }}
                  />
                  <div className="absolute w-1.5 h-1.5 bg-primary rounded-full" style={{ left: 'calc(50% - 3px)', top: 'calc(50% - 3px)' }} />
                  <div
                    className="absolute w-7 h-7 bg-primary rounded-full flex items-center justify-center"
                    style={{
                      left: `calc(50% + ${pos.x * 0.75}px - 14px)`,
                      top: `calc(50% + ${pos.y * 0.75}px - 14px)`
                    }}
                  >
                    <span className="text-white text-xs font-medium">{selectedMinute.toString().padStart(2, '0')}</span>
                  </div>
                </>
              );
            })()}
          </div>

        </div>
      </div>
    </div>
  );
};

export default StaticTimePicker;
