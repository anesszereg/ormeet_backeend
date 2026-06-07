import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import organizerService, { TicketTypeInfo } from '../../services/organizerService';

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
  ticketTypeId: string;
}

interface AddAttendeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: AddAttendeeData) => Promise<void> | void;
  events: Event[];
}

const AddAttendeeModal = ({ isOpen, onClose, onConfirm, events }: AddAttendeeModalProps) => {
  const { t } = useTranslation(['organizer', 'common']);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [selectedTicketType, setSelectedTicketType] = useState<string>('');
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isTicketDropdownOpen, setIsTicketDropdownOpen] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeInfo[]>([]);
  const [isLoadingTickets, setIsLoadingTickets] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
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
      setTicketTypes([]);
      setSubmitError('');
    }
  }, [isOpen]);

  // Load ticket types whenever the selected event changes.
  useEffect(() => {
    if (!selectedEvent) {
      setTicketTypes([]);
      return;
    }
    let cancelled = false;
    setIsLoadingTickets(true);
    setSelectedTicketType('');
    organizerService
      .getEventById(selectedEvent)
      .then((event) => {
        if (!cancelled) setTicketTypes(event.ticketTypes || []);
      })
      .catch(() => {
        if (!cancelled) setTicketTypes([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingTickets(false);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedEvent]);

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
      setEmailError(t('organizer:addAttendee.validation.emailInvalid'));
    }
  };

  const selectedTicketTypeObj = ticketTypes.find((tt) => tt.id === selectedTicketType);
  const isFormValid = firstName.trim() && lastName.trim() && email.trim() && validateEmail(email) && selectedEvent && selectedTicketType && !emailError;

  const handleConfirm = async () => {
    if (!isFormValid) {
      if (email.trim() && !validateEmail(email)) {
        setEmailError(t('organizer:addAttendee.validation.emailInvalid'));
      }
      return;
    }
    setSubmitError('');
    setIsSubmitting(true);
    try {
      await onConfirm({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        eventId: selectedEvent,
        ticketType: selectedTicketTypeObj?.name || '',
        ticketTypeId: selectedTicketType,
      });
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      setSubmitError(
        err?.response?.data?.message ||
          t('organizer:addAttendee.validation.submitError', { defaultValue: 'Failed to add attendee. Please try again.' }),
      );
    } finally {
      setIsSubmitting(false);
    }
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
                {t('organizer:addAttendee.title')}
              </h2>
              
              <p className="text-sm text-gray mb-6">
                {t('organizer:addAttendee.description')}
              </p>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    {t('organizer:addAttendee.fields.firstName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={t('organizer:addAttendee.fields.firstNamePlaceholder')}
                    className="w-full px-4 py-3 bg-white border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray hover:border-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    {t('organizer:addAttendee.fields.lastName')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={t('organizer:addAttendee.fields.lastNamePlaceholder')}
                    className="w-full px-4 py-3 bg-white border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray hover:border-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    {t('organizer:addAttendee.fields.email')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(e.target.value)}
                    onBlur={handleEmailBlur}
                    placeholder={t('organizer:addAttendee.fields.emailPlaceholder')}
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
                    {t('organizer:addAttendee.fields.event')} <span className="text-red-500">*</span>
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
                  <div className="absolute bottom-full start-0 end-0 mb-2 bg-white rounded-lg shadow-lg border border-light-gray py-1 z-[60] max-h-48 overflow-y-auto">
                    {events.map((event) => (
                      <button
                        key={event.id}
                        onClick={() => {
                          setSelectedEvent(event.id);
                          setIsEventDropdownOpen(false);
                        }}
                        className={`w-full px-4 py-2 text-start text-sm transition-colors cursor-pointer ${
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
                    {t('organizer:addAttendee.fields.ticketType')} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative" ref={ticketDropdownRef}>
                <button
                  disabled={!selectedEvent || isLoadingTickets}
                  onClick={() => {
                    setIsTicketDropdownOpen(!isTicketDropdownOpen);
                    setIsEventDropdownOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white border border-light-gray rounded-lg text-sm text-black hover:border-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>
                    {isLoadingTickets
                      ? t('common:loading', { defaultValue: 'Loading...' })
                      : selectedTicketTypeObj?.name || '–'}
                  </span>
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
                  <div className="absolute bottom-full start-0 end-0 mb-2 bg-white rounded-lg shadow-lg border border-light-gray py-1 z-[60] max-h-48 overflow-y-auto">
                    {ticketTypes.length === 0 ? (
                      <div className="px-4 py-2 text-sm text-gray">
                        {t('organizer:addAttendee.noTicketTypes', { defaultValue: 'No ticket types for this event' })}
                      </div>
                    ) : (
                      ticketTypes.map((tt) => (
                        <button
                          key={tt.id}
                          onClick={() => {
                            setSelectedTicketType(tt.id);
                            setIsTicketDropdownOpen(false);
                          }}
                          className={`w-full px-4 py-2 text-start text-sm transition-colors cursor-pointer ${
                            selectedTicketType === tt.id
                              ? 'bg-primary-light text-primary font-medium'
                              : 'text-gray hover:bg-secondary-light'
                          }`}
                        >
                          {tt.name}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
                </div>
              </div>

              {submitError && (
                <p className="text-sm text-red-500 mb-3">{submitError}</p>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2.5 bg-white border border-light-gray text-gray hover:text-black hover:border-gray-400 font-medium text-sm rounded-full transition-all cursor-pointer"
                >
                  {t('common:cta.cancel')}
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={!isFormValid || isSubmitting}
                  className="flex-1 px-4 py-2.5 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#FF4000]"
                  style={{ boxShadow: !isFormValid ? 'none' : '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                >
                  {isSubmitting
                    ? t('common:loading', { defaultValue: 'Loading...' })
                    : t('organizer:addAttendee.confirm')}
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <svg className="w-16 h-16 mb-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-semibold text-black">{t('organizer:addAttendee.success')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddAttendeeModal;
