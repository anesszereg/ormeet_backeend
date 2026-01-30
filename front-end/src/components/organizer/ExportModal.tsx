import { useState, useEffect, useRef } from 'react';

interface Event {
  id: string;
  name: string;
}

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedEvent: string) => void;
  events: Event[];
}

const ExportModal = ({ isOpen, onClose, onConfirm, events }: ExportModalProps) => {
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setSelectedEvent('');
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedEvent) return;
    onConfirm(selectedEvent);
    onClose();
  };

  const getSelectedEventName = () => {
    if (!selectedEvent) return '–';
    if (selectedEvent === 'all') return 'All events';
    const event = events.find(e => e.id === selectedEvent);
    return event ? event.name : '–';
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" 
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-visible" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <h2 className="text-xl font-bold text-black mb-3">
            Export data
          </h2>
          
          <p className="text-sm text-gray mb-6">
            Select the event you want to export data for.
          </p>

          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-2">
              Select Event
            </label>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-3 bg-white border border-light-gray rounded-lg text-sm text-black hover:border-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
              >
                <span>{getSelectedEventName()}</span>
                <svg 
                  className={`w-4 h-4 text-gray transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-light-gray py-1 z-[60] max-h-60 overflow-y-auto">
                  <button
                    onClick={() => {
                      setSelectedEvent('all');
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
                      selectedEvent === 'all'
                        ? 'bg-primary-light text-primary font-medium'
                        : 'text-gray hover:bg-secondary-light'
                    }`}
                  >
                    All events
                  </button>
                  {events.map((event) => (
                    <button
                      key={event.id}
                      onClick={() => {
                        setSelectedEvent(event.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
                        selectedEvent === event.id
                          ? 'bg-primary-light text-primary font-medium'
                          : 'text-gray hover:bg-secondary-light'
                      }`}
                    >
                      {event.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white border border-light-gray text-gray hover:text-black hover:border-gray-400 font-medium text-sm rounded-full transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedEvent}
              className="flex-1 px-4 py-2.5 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FF4000]"
              style={{ boxShadow: !selectedEvent ? 'none' : '0 4px 12px rgba(255, 64, 0, 0.25)' }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
