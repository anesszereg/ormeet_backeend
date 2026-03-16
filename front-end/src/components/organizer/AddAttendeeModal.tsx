import { useState, useEffect, useRef } from 'react';

interface Event {
  id: string;
  name: string;
}

interface AddAttendeeData {
  firstName: string;
  lastName: string;
  email: string;
  eventId: string;
  ticketType: string;
}

interface AddAttendeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: AddAttendeeData) => void;
  events: Event[];
}

const TICKET_TYPES = ['General', 'VIP', 'Early Bird'];

const AddAttendeeModal = ({ isOpen, onClose, onConfirm, events }: AddAttendeeModalProps) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isTicketDropdownOpen, setIsTicketDropdownOpen] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const eventDropdownRef = useRef<HTMLDivElement>(null);
  const ticketDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (eventDropdownRef.current && !eventDropdownRef.current.contains(event.target as Node)) {
        setIsEventDropdownOpen(false);
      }
      if (ticketDropdownRef.current && !ticketDropdownRef.current.contains(event.target as Node)) {
        setIsTicketDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFirstName('');
      setLastName('');
      setEmail('');
      setSelectedEvent('');
      setSelectedTicketType('');
      setIsEventDropdownOpen(false);
      setIsTicketDropdownOpen(false);
      setEmailError('');
      setShowSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (value: string) => {
    setEmail(value);
    if (emailError && value.trim() && validateEmail(value)) {
      setEmailError('');
    }
  };

  const handleEmailBlur = () => {
    if (email.trim() && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
    }
  };

  const isFormValid = firstName.trim() && lastName.trim() && email.trim() && validateEmail(email) && selectedEvent && selectedTicketType && !emailError;

  const handleConfirm = () => {
    if (!isFormValid) {
      if (email.trim() && !validateEmail(email)) {
        setEmailError('Please enter a valid email address');
      }
      return;
    }
    onConfirm({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      eventId: selectedEvent,
      ticketType: selectedTicketType,
    });
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      onClose();
    }, 3000);
  };

  const getSelectedEventName = () => {
    if (!selectedEvent) return '–';
    const event = events.find(e => e.id === selectedEvent);
    return event ? event.name : '–';
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" 
      onClick={() => !showSuccess && onClose()}
    >
      <div 
        className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-visible max-h-[90vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 overflow-y-auto flex-1">
          {!showSuccess ? (
            <>
              <h2 className="text-xl font-bold text-black mb-3">
                Add Attendee
              </h2>
              
              <p className="text-sm text-gray mb-6">
                Fill in the details to add a new attendee to an event.
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter first name"
                    className="w-full px-4 py-3 bg-white border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray hover:border-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Last Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter last name"
                    className="w-full px-4 py-3 bg-white border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray hover:border-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onBlur={handleEmailBlur}
                    placeholder="Enter email address"
                    className={`w-full px-4 py-3 bg-white border rounded-lg text-sm text-black placeholder:text-input-gray hover:border-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all ${
                      emailError ? 'border-red-500' : 'border-light-gray'
                    }`}
                  />
                  {emailError && (
                    <p className="text-xs text-red-500 mt-1">{emailError}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Event <span className="text-red-500">*</span>
                  </label>
                  <div className="relative" ref={eventDropdownRef}>
                <button
                  onClick={() => {
                    setIsEventDropdownOpen(!isEventDropdownOpen);
                    setIsTicketDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-light-gray rounded-lg text-sm text-black hover:border-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                >
                  <span>{getSelectedEventName()}</span>
                  <svg 
                    className={`w-4 h-4 text-gray transition-transform ${isEventDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isEventDropdownOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-light-gray py-1 z-[60] max-h-48 overflow-y-auto">
                    {events.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => {
                          setSelectedEvent(event.id);
                          setIsEventDropdownOpen(false);
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

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Ticket Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative" ref={ticketDropdownRef}>
                <button
                  onClick={() => {
                    setIsTicketDropdownOpen(!isTicketDropdownOpen);
                    setIsEventDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-light-gray rounded-lg text-sm text-black hover:border-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                >
                  <span>{selectedTicketType || '–'}</span>
                  <svg 
                    className={`w-4 h-4 text-gray transition-transform ${isTicketDropdownOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isTicketDropdownOpen && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-light-gray py-1 z-[60] max-h-48 overflow-y-auto">
                    {TICKET_TYPES.map((type) => (
                      <button
                        key={type}
                        onClick={() => {
                          setSelectedTicketType(type);
                          setIsTicketDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-left text-sm transition-colors cursor-pointer ${
                          selectedTicketType === type
                            ? 'bg-primary-light text-primary font-medium'
                            : 'text-gray hover:bg-secondary-light'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
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
                  disabled={!isFormValid}
                  className="flex-1 px-4 py-2.5 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FF4000]"
                  style={{ boxShadow: !isFormValid ? 'none' : '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                >
                  Confirm
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <svg className="w-16 h-16 mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-semibold text-black">Attendee added successfully</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddAttendeeModal;
