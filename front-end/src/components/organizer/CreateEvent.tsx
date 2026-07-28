import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { wilayas, wilayaLabel, type Locale } from '@ormeet/i18n';
import organizerService, { CreateEventDto } from '../../services/organizerService';
import authService from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import CalendarIcon from '../../assets/Svgs/organiser/dashboard/calendrier.svg';
import EventPreviewModal from './EventPreviewModal';
import StaticTimePicker from './StaticTimePicker';

interface InitialEventData {
  id?: string;
  title: string;
  category: string;
  eventType: 'in-person' | 'online' | 'hybrid' | '';
  dateRange: [Date | null, Date | null];
  startTime: string;
  endTime: string;
  country: string;
  state: string;
  mapAddress: string;
  onlineLink: string;
  description: string;
  tickets: TicketData[];
  faqs: FAQData[];
  visibility: 'public' | 'private';
  images?: string[];
}

interface CreateEventProps {
  onSaveDraft?: () => void;
  onPublish?: () => void;
  onSaveChanges?: () => void;
  onBack?: () => void;
  mode?: 'create' | 'edit' | 'duplicate';
  initialData?: InitialEventData;
  source?: 'dashboard' | 'events';
}

interface TicketData {
  id: string;
  type: string;
  priceType: 'free' | 'paid' | '';
  price: string;
  quantity: string;
}

interface FAQData {
  id: string;
  question: string;
  answer: string;
}

interface EventFormData {
  title: string;
  category: string;
  eventType: 'in-person' | 'online' | 'hybrid' | '';
  dateRange: [Date | null, Date | null];
  startTime: string;
  endTime: string;
  country: string;
  state: string;
  mapAddress: string;
  onlineLink: string;
  eventImages: Array<{ file: File; preview: string; id: string }>;
  description: string;
  tickets: TicketData[];
  faqs: FAQData[];
  status: 'draft' | 'publish';
  visibility: 'public' | 'private';
  requiresApproval: boolean;
}


const PRESET_CATEGORIES = [
  'Music',
  'Tech',
  'Business',
  'Art',
  'Sport',
  'Food & Drink',
  'Health & Wellness',
  'Education',
  'Community',
  'Other',
];

/** Pays pré-sélectionné à la création d'un événement. */
const DEFAULT_COUNTRY = 'Algérie';

const ticketTypes = [
  'General Admission',
  'VIP',
  'Early Bird',
  'Student',
  'Group',
  'Premium',
  'Standard',
  'Other'
];

const CreateEvent = ({ onSaveDraft, onPublish, onSaveChanges, onBack, mode = 'create', initialData, source = 'events' }: CreateEventProps) => {
  const { t, i18n } = useTranslation('organizer');
  const locale = (i18n.language as Locale) || 'fr';
  const { user, setUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Organizer's own custom event types are stored on `user.hostingEventTypes`.
  // We merge them with the preset categories and let the organizer add new ones
  // inline from the dropdown.
  const [customCategories, setCustomCategories] = useState<string[]>(() => {
    const fromUser = (user?.hostingEventTypes as unknown as string[]) || [];
    return Array.from(new Set(fromUser.filter(Boolean)));
  });
  const [newCustomCategory, setNewCustomCategory] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  const categories = Array.from(
    new Set([...PRESET_CATEGORIES, ...customCategories]),
  );

  const getInitialFormData = (): EventFormData => {
    if (initialData) {
      return {
        title: initialData.title,
        category: initialData.category,
        eventType: initialData.eventType,
        dateRange: initialData.dateRange,
        startTime: initialData.startTime,
        endTime: initialData.endTime,
        country: initialData.country,
        state: initialData.state,
        mapAddress: initialData.mapAddress,
        onlineLink: initialData.onlineLink,
        eventImages: [],
        description: initialData.description,
        tickets: initialData.tickets.length > 0 ? initialData.tickets : [{
          id: `ticket-${Date.now()}`,
          type: '',
          priceType: '',
          price: '',
          quantity: ''
        }],
        faqs: initialData.faqs,
        status: 'draft',
        visibility: initialData.visibility,
        requiresApproval: (initialData as any).requiresApproval ?? false,
      };
    }
    return {
      title: '',
      category: '',
      eventType: 'in-person',
      dateRange: [null, null],
      startTime: '',
      endTime: '',
      // Marché principal de la plateforme, modifiable par l'organisateur.
      country: DEFAULT_COUNTRY,
      state: '',
      mapAddress: '',
      onlineLink: '',
      eventImages: [],
      description: '',
      tickets: [{
        id: `ticket-${Date.now()}`,
        type: '',
        priceType: '',
        price: '',
        quantity: ''
      }],
      faqs: [],
      status: 'draft',
      visibility: 'public',
      requiresApproval: false,
    };
  };

  const [formData, setFormData] = useState<EventFormData>(getInitialFormData());
  const [existingImages, setExistingImages] = useState<string[]>(initialData?.images || []);

  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});
  const [ticketErrors, setTicketErrors] = useState<Record<string, Partial<Record<keyof TicketData, string>>>>({});
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [isEventTypeDropdownOpen, setIsEventTypeDropdownOpen] = useState(false);
  const [mapLocation, setMapLocation] = useState<string>('');
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [isDragging, setIsDragging] = useState(false);
  const [openTicketTypeDropdown, setOpenTicketTypeDropdown] = useState<string | null>(null);
  const [openPriceTypeDropdown, setOpenPriceTypeDropdown] = useState<string | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [faqErrors, setFaqErrors] = useState<Record<string, Partial<Record<keyof FAQData, string>>>>({});
  const imageInputRef = useRef<HTMLInputElement>(null);
  const locationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Refs for click-outside detection
  const categoryRef = useRef<HTMLDivElement>(null);
  const eventTypeRef = useRef<HTMLDivElement>(null);
  const datePickerRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<HTMLDivElement>(null);
  const endTimeRef = useRef<HTMLDivElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    let processedValue = value;
    
    // Auto-capitalize first character of Event Title
    if (name === 'title' && value.length > 0) {
      processedValue = value.charAt(0).toUpperCase() + value.slice(1);
    }
    
    setFormData(prev => ({ ...prev, [name]: processedValue }));
    if (errors[name as keyof EventFormData]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }

    // Handle map address change with debounce for map update
    if (name === 'mapAddress') {
      if (locationTimeoutRef.current) {
        clearTimeout(locationTimeoutRef.current);
      }
      
      locationTimeoutRef.current = setTimeout(() => {
        if (processedValue.trim()) {
          // Encode the address for Google Maps embed URL
          const encodedLocation = encodeURIComponent(processedValue);
          setMapLocation(encodedLocation);
        } else {
          // Clear map location if address is empty
          setMapLocation('');
        }
      }, 500);
    }
  };

  const handleCategorySelect = (category: string) => {
    setFormData(prev => ({ ...prev, category }));
    setIsCategoryDropdownOpen(false);
    if (errors.category) {
      setErrors(prev => ({ ...prev, category: '' }));
    }
  };

  /**
   * Persist a brand-new event category for this organizer. Saved on
   * `user.hostingEventTypes` so it stays available across events and
   * sessions.
   */
  const handleAddCustomCategory = async () => {
    const value = newCustomCategory.trim();
    if (!value) return;

    // De-dupe case-insensitively against everything we already know about.
    const existing = categories.find(
      (c) => c.toLowerCase() === value.toLowerCase(),
    );
    if (existing) {
      handleCategorySelect(existing);
      setNewCustomCategory('');
      setIsAddingCategory(false);
      return;
    }

    // Optimistically add to the UI so the dropdown doesn't flicker.
    const nextCustom = [...customCategories, value];
    setCustomCategories(nextCustom);
    handleCategorySelect(value);
    setNewCustomCategory('');
    setIsAddingCategory(false);

    // Best-effort persist to backend; if it fails we still let the
    // organizer publish the event with this custom type — the value is
    // stored on the event itself regardless.
    try {
      const merged = Array.from(
        new Set([
          ...((user?.hostingEventTypes as unknown as string[]) || []),
          value,
        ]),
      );
      const updated = await authService.updateHostingTypes({
        hostingEventTypes: merged,
      });
      setUser(updated);
    } catch (err) {
      console.warn(
        '⚠️ Failed to persist custom category to user profile:',
        err,
      );
    }
  };

  // Close all dropdowns
  const closeAllDropdowns = () => {
    setIsCategoryDropdownOpen(false);
    setIsEventTypeDropdownOpen(false);
    setShowStartTimePicker(false);
    setShowEndTimePicker(false);
    setShowDatePicker(false);
  };

  // Initialize map location from initial data
  useEffect(() => {
    if (initialData?.mapAddress) {
      const encodedLocation = encodeURIComponent(initialData.mapAddress);
      setMapLocation(encodedLocation);
    }
  }, [initialData?.mapAddress]);

  // Click outside to close all dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // Check if click is outside all dropdown containers
      const isOutsideCategory = categoryRef.current && !categoryRef.current.contains(target);
      const isOutsideEventType = eventTypeRef.current && !eventTypeRef.current.contains(target);
      const isOutsideDatePicker = datePickerRef.current && !datePickerRef.current.contains(target);
      const isOutsideStartTime = startTimeRef.current && !startTimeRef.current.contains(target);
      const isOutsideEndTime = endTimeRef.current && !endTimeRef.current.contains(target);
      
      // If click is outside all dropdowns, close them all
      if (isOutsideCategory && isOutsideEventType && isOutsideDatePicker && isOutsideStartTime && isOutsideEndTime) {
        closeAllDropdowns();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleEventTypeSelect = (type: 'in-person' | 'online' | 'hybrid') => {
    setFormData(prev => ({ ...prev, eventType: type }));
    setIsEventTypeDropdownOpen(false);
    if (errors.eventType) {
      setErrors(prev => ({ ...prev, eventType: '' }));
    }
  };

  const handleDateRangeChange = (dates: [Date | null, Date | null]) => {
    setFormData(prev => ({ ...prev, dateRange: dates }));
    if (errors.dateRange) {
      setErrors(prev => ({ ...prev, dateRange: '' }));
    }
  };

  // Calendar functions (same as EventsTable)
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    return { daysInMonth, startingDayOfWeek };
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  /** Minuit aujourd'hui : un événement ne peut pas commencer dans le passé. */
  const startOfToday = () => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const isPastDay = (day: number) =>
    new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day) < startOfToday();

  const handleDateSelect = (day: number) => {
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    if (isPastDay(day)) return;

    if (!formData.dateRange[0] || (formData.dateRange[0] && formData.dateRange[1])) {
      // Start new selection
      handleDateRangeChange([selected, null]);
    } else {
      // Complete range selection
      if (selected < formData.dateRange[0]) {
        handleDateRangeChange([selected, formData.dateRange[0]]);
      } else {
        handleDateRangeChange([formData.dateRange[0], selected]);
      }
      setShowDatePicker(false);
    }
  };

  const handleMonthSelect = () => {
    const firstOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    // Sur le mois en cours, on démarre à aujourd'hui plutôt qu'au 1er (ORM-016).
    const startOfMonth = firstOfMonth < startOfToday() ? startOfToday() : firstOfMonth;
    if (endOfMonth < startOfToday()) return;
    handleDateRangeChange([startOfMonth, endOfMonth]);
    setShowDatePicker(false);
  };

  const isDateInRange = (day: number): boolean => {
    if (!formData.dateRange[0]) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (!formData.dateRange[1]) {
      return date.getTime() === formData.dateRange[0].getTime();
    }
    
    return date >= formData.dateRange[0] && date <= formData.dateRange[1];
  };

  const isDateRangeEdge = (day: number): boolean => {
    if (!formData.dateRange[0]) return false;
    const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    
    if (formData.dateRange[1]) {
      return date.getTime() === formData.dateRange[0].getTime() || date.getTime() === formData.dateRange[1].getTime();
    }
    
    return date.getTime() === formData.dateRange[0].getTime();
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth);
    const days = [];
    const monthName = currentMonth.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const inRange = isDateInRange(day);
      const isEdge = isDateRangeEdge(day);
      const isPast = isPastDay(day);

      days.push(
        <button
          key={day}
          type="button"
          onClick={() => handleDateSelect(day)}
          disabled={isPast}
          aria-disabled={isPast}
          className={`h-8 flex items-center justify-center text-sm font-normal rounded-full transition-colors
            ${isPast ? 'text-[#CCCCCC] cursor-not-allowed' : ''}
            ${!isPast && isEdge ? 'bg-primary text-white font-medium' : ''}
            ${!isPast && inRange && !isEdge ? 'bg-[#FFE8E3] text-black' : ''}
            ${!isPast && !inRange ? 'text-black hover:bg-gray-100' : ''}
          `}
        >
          {day}
        </button>
      );
    }

    return (
      <div className="absolute start-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-light-gray p-4 z-50 w-full max-w-[320px]">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-3">
          <button
            type="button"
            onClick={handleMonthSelect}
            className="text-xs text-primary hover:text-primary-dark font-medium transition-colors"
          >
            {t('createEvent.calendar.selectMonth')}
          </button>
          {(formData.dateRange[0] || formData.dateRange[1]) && (
            <button
              type="button"
              onClick={() => {
                handleDateRangeChange([null, null]);
              }}
              className="text-xs text-gray hover:text-black font-medium transition-colors"
            >
              {t('createEvent.calendar.clear')}
            </button>
          )}
        </div>
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full border border-black hover:bg-gray-100 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          <h3 className="text-base font-medium text-black">{monthName}</h3>
          
          <button
            type="button"
            onClick={handleNextMonth}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-black hover:bg-gray-800 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-1">
          {[t('createEvent.calendar.sun'), t('createEvent.calendar.mon'), t('createEvent.calendar.tue'), t('createEvent.calendar.wed'), t('createEvent.calendar.thu'), t('createEvent.calendar.fri'), t('createEvent.calendar.sat')].map(day => (
            <div key={day} className="h-8 flex items-center justify-center text-xs font-medium text-gray">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {days}
        </div>
      </div>
    );
  };

  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const newImages: Array<{ file: File; preview: string; id: string }> = [];
    const fileArray = Array.from(files);

    fileArray.forEach(file => {
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, eventImages: t('createEvent.validation.imageSizeError') }));
        return;
      }

      if (!['image/png', 'image/jpeg', 'image/jpg'].includes(file.type)) {
        setErrors(prev => ({ ...prev, eventImages: t('createEvent.validation.imageFormatError') }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        newImages.push({
          file,
          preview: reader.result as string,
          id: `${Date.now()}-${Math.random()}`
        });

        if (newImages.length === fileArray.length) {
          setFormData(prev => ({
            ...prev,
            eventImages: [...prev.eventImages, ...newImages]
          }));
          if (errors.eventImages) {
            setErrors(prev => ({ ...prev, eventImages: '' }));
          }
        }
      };
      reader.readAsDataURL(file);
    });

    if (imageInputRef.current) {
      imageInputRef.current.value = '';
    }
  };

  const removeImage = (id: string) => {
    setFormData(prev => ({
      ...prev,
      eventImages: prev.eventImages.filter(img => img.id !== id)
    }));
  };

  const removeExistingImage = (url: string) => {
    setExistingImages(prev => prev.filter(img => img !== url));
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...formData.eventImages];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    setFormData(prev => ({ ...prev, eventImages: newImages }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageUpload(e.dataTransfer.files);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {};
    
    if (!formData.title.trim()) newErrors.title = t('createEvent.validation.titleRequired');
    if (!formData.category) newErrors.category = t('createEvent.validation.categoryRequired');
    if (!formData.eventType) newErrors.eventType = t('createEvent.validation.eventTypeRequired');
    if (!formData.dateRange[0] || !formData.dateRange[1]) {
      newErrors.dateRange = t('createEvent.validation.dateRequired');
    } else if (formData.dateRange[0] < startOfToday()) {
      // Filet de sécurité : le calendrier bloque déjà les dates passées, mais une
      // date peut venir d'un brouillon plus ancien (ORM-016).
      newErrors.dateRange = t('createEvent.validation.datePast');
    }
    if (!formData.startTime) newErrors.startTime = t('createEvent.validation.startTimeRequired');
    if (!formData.endTime) newErrors.endTime = t('createEvent.validation.endTimeRequired');
    
    if (formData.eventType === 'in-person' || formData.eventType === 'hybrid') {
      if (!formData.country.trim()) newErrors.country = t('createEvent.validation.countryRequired');
      if (!formData.state.trim()) newErrors.state = t('createEvent.validation.stateRequired');
      if (!formData.mapAddress.trim()) newErrors.mapAddress = t('createEvent.validation.mapAddressRequired');
    }
    
    if (formData.eventImages.length === 0 && existingImages.length === 0) newErrors.eventImages = t('createEvent.validation.imagesRequired');
    if (!formData.description.trim()) newErrors.description = t('createEvent.validation.descriptionRequired');
    
    // Validate tickets
    const newTicketErrors: Record<string, Partial<Record<keyof TicketData, string>>> = {};
    const ticketTypeNames = new Map<string, string>(); // Map of lowercase type name to ticket ID
    
    formData.tickets.forEach(ticket => {
      const ticketError: Partial<Record<keyof TicketData, string>> = {};
      if (!ticket.type.trim()) {
        ticketError.type = t('createEvent.validation.ticketTypeRequired');
      } else {
        // Check for duplicate ticket types (case-insensitive)
        const normalizedType = ticket.type.trim().toLowerCase();
        const existingTicketId = ticketTypeNames.get(normalizedType);
        if (existingTicketId && existingTicketId !== ticket.id) {
          ticketError.type = t('createEvent.validation.duplicateTicketType');
        } else {
          ticketTypeNames.set(normalizedType, ticket.id);
        }
      }
      if (!ticket.priceType) ticketError.priceType = t('createEvent.validation.priceTypeRequired');
      if (!ticket.quantity.trim()) ticketError.quantity = t('createEvent.validation.quantityRequired');
      if (ticket.priceType === 'paid' && !ticket.price.trim()) ticketError.price = t('createEvent.validation.priceRequired');
      
      if (Object.keys(ticketError).length > 0) {
        newTicketErrors[ticket.id] = ticketError;
      }
    });
    
    // Validate FAQs
    const newFaqErrors: Record<string, Partial<Record<keyof FAQData, string>>> = {};
    formData.faqs.forEach(faq => {
      const faqError: Partial<Record<keyof FAQData, string>> = {};
      if (!faq.question.trim()) faqError.question = t('createEvent.validation.faqQuestionRequired');
      if (!faq.answer.trim()) faqError.answer = t('createEvent.validation.faqAnswerRequired');
      
      if (Object.keys(faqError).length > 0) {
        newFaqErrors[faq.id] = faqError;
      }
    });
    
    setErrors(newErrors);
    setTicketErrors(newTicketErrors);
    setFaqErrors(newFaqErrors);
    return Object.keys(newErrors).length === 0 && Object.keys(newTicketErrors).length === 0 && Object.keys(newFaqErrors).length === 0;
  };

  // Helper to convert form data to API format
  const convertToApiFormat = (status: 'draft' | 'publish', imageUrls: string[] = []): CreateEventDto => {
    // Parse start and end times
    const parseTime = (timeStr: string): { hours: number; minutes: number } => {
      const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
      if (!match) return { hours: 0, minutes: 0 };
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const period = match[3]?.toUpperCase();
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return { hours, minutes };
    };

    const startDate = formData.dateRange[0] || new Date();
    const endDate = formData.dateRange[1] || formData.dateRange[0] || new Date();
    
    const startTime = parseTime(formData.startTime);
    const endTime = parseTime(formData.endTime);
    
    const startAt = new Date(startDate);
    startAt.setHours(startTime.hours, startTime.minutes, 0, 0);
    
    const endAt = new Date(endDate);
    endAt.setHours(endTime.hours, endTime.minutes, 0, 0);

    // Map event type
    const locationType = formData.eventType === 'in-person' ? 'physical' : 
                         formData.eventType === 'online' ? 'online' : 'to_be_announced';

    // Map tickets
    const tickets = formData.tickets
      .filter(t => t.type && t.quantity)
      .map(t => {
        console.log('Ticket type being sent:', t.type, 'Type:', typeof t.type);
        return {
          name: t.type,
          type: t.type as 'General Admission' | 'VIP' | 'Early Bird' | 'Student' | 'Group' | 'Premium' | 'Standard' | 'Other',
          quantityTotal: parseInt(t.quantity) || 0,
          price: t.priceType === 'free' ? 0 : parseFloat(t.price) || 0,
        };
      });

    // Use uploaded image URLs, or keep existing images when editing without new uploads
    const fallbackImages = mode === 'edit' ? existingImages : [];
    const validImages = imageUrls.length > 0 ? imageUrls : fallbackImages;

    // Validate onlineLink is a proper URL or set to undefined
    const onlineLink = locationType === 'online' && formData.onlineLink && 
      (formData.onlineLink.startsWith('http://') || formData.onlineLink.startsWith('https://'))
      ? formData.onlineLink 
      : undefined;

    // Use organizationId if available, otherwise fall back to user.id
    const organizerId = user?.organizationId || user?.id || '';

    return {
      title: formData.title,
      type: formData.category?.toLowerCase() || 'general',
      shortDescription: formData.description.substring(0, 200) || 'Event description',
      longDescription: formData.description || undefined,
      organizerId,
      status: 'draft',
      visibility: formData.visibility,
      dateType: 'one_time' as const,
      startAt: startAt.toISOString(),
      endAt: endAt.toISOString(),
      locationType,
      customLocation: locationType === 'physical' && (formData.mapAddress || formData.country || formData.state) ? {
        address: formData.mapAddress || '',
        city: formData.state || '',
        state: formData.state || '',
        zipCode: '',
        postalCode: '',
        country: formData.country || '',
      } : undefined,
      onlineLink,
      images: validImages.length > 0 ? validImages : undefined,
      tickets: tickets.length > 0 ? tickets : undefined,
      tags: formData.category ? [formData.category.toLowerCase()] : undefined,
      guidelines: formData.faqs.length > 0 ? {
        ageRequirement: '',
        refundPolicy: '',
        accessibleInfo: '',
        entryPolicy: '',
        prohibitedItems: [],
        allowedItems: [],
        parkingInfo: '',
        faqs: formData.faqs.map(faq => ({
          question: faq.question,
          answer: faq.answer
        }))
      } : undefined,
      requiresApproval: formData.requiresApproval,
    };
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Upload images first
      let imageUrls: string[] = [];
      const filesToUpload = formData.eventImages.map(img => img.file);
      if (filesToUpload.length > 0) {
        imageUrls = await organizerService.uploadImages(filesToUpload);
      }

      const eventData = convertToApiFormat('draft', imageUrls);
      
      if (mode === 'edit' && initialData?.id) {
        await organizerService.updateEvent(initialData.id, eventData);
      } else {
        await organizerService.createEvent(eventData);
      }
      
      setFormData(prev => ({ ...prev, status: 'draft' }));
      onSaveDraft?.();
    } catch (err: any) {
      console.error('Failed to save draft:', err);
      setSubmitError(err.response?.data?.message || 'Failed to save draft');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Upload images first
      let imageUrls: string[] = [];
      const filesToUpload = formData.eventImages.map(img => img.file);
      if (filesToUpload.length > 0) {
        imageUrls = await organizerService.uploadImages(filesToUpload);
      }

      const eventData = convertToApiFormat('publish', imageUrls);
      
      let eventId: string;
      
      if (mode === 'edit' && initialData?.id) {
        await organizerService.updateEvent(initialData.id, eventData);
        eventId = initialData.id;
      } else {
        const createdEvent = await organizerService.createEvent(eventData);
        eventId = createdEvent.id;
      }
      
      // Publish the event
      await organizerService.publishEvent(eventId);
      
      setFormData(prev => ({ ...prev, status: 'publish' }));
      onPublish?.();
    } catch (err: any) {
      console.error('Failed to publish event:', err);
      setSubmitError(err.response?.data?.message || 'Failed to publish event');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        {/* Back Button */}
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray hover:text-black transition-colors mb-4"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm font-medium">
              {source === 'dashboard' ? t('createEvent.backToDashboard') : t('createEvent.backToEvents')}
            </span>
          </button>
        )}
        <h1 className="text-2xl font-bold text-black mb-2">{t('createEvent.pageTitle', { mode: mode === 'edit' ? 'Edit' : 'Create' })}</h1>
        <p className="text-sm text-gray">
          {t('createEvent.pageSubtitle', { mode: mode === 'edit' ? 'update' : 'create' })}
        </p>
      </div>

      {/* Form */}
      <form className="space-y-6">
        {/* 1. Essential Information */}
        <div className="bg-white border border-light-gray rounded-xl p-5">
          <h2 className="text-lg font-semibold text-black mb-4">{t('createEvent.steps.essentialInfo')}</h2>
          
          <div className="space-y-4">
            {/* Event Title */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                {t('createEvent.form.eventTitle')} <span className="text-[#FF3425]">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder={t('createEvent.form.eventTitlePlaceholder')}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-primary  transition-all ${
                  errors.title ? 'border-[#FF3425]' : 'border-light-gray'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-[#FF3425]">{errors.title}</p>
              )}
            </div>

            {/* Category and Event Type Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Event Category */}
              <div className="relative" ref={categoryRef}>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('createEvent.form.eventCategory')} <span className="text-[#FF3425]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    closeAllDropdowns();
                    setIsCategoryDropdownOpen(!isCategoryDropdownOpen);
                  }}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm text-start flex items-center justify-between focus:outline-none focus:border-primary  transition-all ${
                    errors.category ? 'border-[#FF3425]' : 'border-light-gray'
                  } ${formData.category ? 'text-black' : 'text-[#9CA3AF]'}`}
                >
                  {formData.category || t('createEvent.form.eventCategoryPlaceholder')}
                  <svg className="w-4 h-4 text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isCategoryDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-light-gray rounded-lg shadow-lg max-h-72 overflow-y-auto">
                    {categories.map((category) => {
                      const isCustom = !PRESET_CATEGORIES.includes(category);
                      return (
                        <button
                          key={category}
                          type="button"
                          onClick={() => handleCategorySelect(category)}
                          className={`w-full px-4 py-2 text-start text-sm transition-colors flex items-center justify-between ${
                            formData.category === category
                              ? 'bg-primary-light text-primary font-medium'
                              : 'text-gray hover:bg-secondary-light'
                          }`}
                        >
                          <span>{category}</span>
                          {isCustom && (
                            <span className="text-[10px] uppercase tracking-wide text-primary/70 ms-2">
                              {t('createEvent.form.customBadge', { defaultValue: 'custom' })}
                            </span>
                          )}
                        </button>
                      );
                    })}

                    {/* Add custom category */}
                    <div className="border-t border-light-gray bg-secondary-light/40">
                      {isAddingCategory ? (
                        <div className="flex items-center gap-2 p-2">
                          <input
                            type="text"
                            autoFocus
                            value={newCustomCategory}
                            onChange={(e) => setNewCustomCategory(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCustomCategory();
                              } else if (e.key === 'Escape') {
                                setIsAddingCategory(false);
                                setNewCustomCategory('');
                              }
                            }}
                            placeholder={t('createEvent.form.customCategoryPlaceholder', { defaultValue: 'e.g. Open-mic night' })}
                            className="flex-1 px-3 py-1.5 text-sm border border-light-gray rounded-md focus:outline-none focus:border-primary"
                          />
                          <button
                            type="button"
                            onClick={handleAddCustomCategory}
                            disabled={!newCustomCategory.trim()}
                            className="px-3 py-1.5 text-xs font-medium bg-primary text-white rounded-md disabled:opacity-50 hover:bg-primary/90"
                          >
                            {t('createEvent.form.add', { defaultValue: 'Add' })}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAddingCategory(false);
                              setNewCustomCategory('');
                            }}
                            className="px-2 py-1.5 text-xs text-gray hover:text-black"
                          >
                            {t('createEvent.form.cancel', { defaultValue: 'Cancel' })}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setIsAddingCategory(true)}
                          className="w-full px-4 py-2 text-start text-sm text-primary font-medium hover:bg-primary-light transition-colors flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                          {t('createEvent.form.addCustomCategory', { defaultValue: 'Add custom category' })}
                        </button>
                      )}
                    </div>
                  </div>
                )}
                {errors.category && (
                  <p className="mt-1 text-xs text-[#FF3425]">{errors.category}</p>
                )}
              </div>

              {/* Event Type */}
              <div className="relative" ref={eventTypeRef}>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('createEvent.form.eventType')} <span className="text-[#FF3425]">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    closeAllDropdowns();
                    setIsEventTypeDropdownOpen(!isEventTypeDropdownOpen);
                  }}
                  className={`w-full px-4 py-2.5 border rounded-lg text-sm text-start flex items-center justify-between focus:outline-none focus:border-primary  transition-all ${
                    errors.eventType ? 'border-[#FF3425]' : 'border-light-gray'
                  } ${formData.eventType ? 'text-black' : 'text-[#9CA3AF]'}`}
                >
                  {formData.eventType === 'in-person' ? t('createEvent.form.eventTypeInPerson') : formData.eventType === 'online' ? t('createEvent.form.eventTypeRemote') : formData.eventType === 'hybrid' ? t('createEvent.form.eventTypeHybrid') : t('createEvent.form.eventTypePlaceholder')}
                  <svg className="w-4 h-4 text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {isEventTypeDropdownOpen && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-light-gray rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    <button
                      type="button"
                      onClick={() => handleEventTypeSelect('in-person')}
                      className={`w-full px-4 py-2 text-start text-sm transition-colors ${
                        formData.eventType === 'in-person'
                          ? 'bg-primary-light text-primary font-medium'
                          : 'text-gray hover:bg-secondary-light'
                      }`}
                    >
                      {t('createEvent.form.eventTypeInPerson')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEventTypeSelect('hybrid')}
                      className={`w-full px-4 py-2 text-start text-sm transition-colors ${
                        formData.eventType === 'hybrid'
                          ? 'bg-primary-light text-primary font-medium'
                          : 'text-gray hover:bg-secondary-light'
                      }`}
                    >
                      {t('createEvent.form.eventTypeHybrid')}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleEventTypeSelect('online')}
                      className={`w-full px-4 py-2 text-start text-sm transition-colors ${
                        formData.eventType === 'online'
                          ? 'bg-primary-light text-primary font-medium'
                          : 'text-gray hover:bg-secondary-light'
                      }`}
                    >
                      {t('createEvent.form.eventTypeRemote')}
                    </button>
                  </div>
                )}
                {errors.eventType && (
                  <p className="mt-1 text-xs text-[#FF3425]">{errors.eventType}</p>
                )}
              </div>
            </div>

            {/* Short Description */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                {t('createEvent.form.description')} <span className="text-[#FF3425]">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t('createEvent.form.descriptionPlaceholder')}
                rows={3}
                className={`w-full px-4 py-2.5 border rounded-lg text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-primary  transition-all resize-none ${
                  errors.description ? 'border-[#FF3425]' : 'border-light-gray'
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-xs text-[#FF3425]">{errors.description}</p>
              )}
            </div>
          </div>
        </div>

        {/* 2. Date & Location */}
        <div className="bg-white border border-light-gray rounded-xl p-5">
          <h2 className="text-lg font-semibold text-black mb-4">{t('createEvent.steps.dateLocation')}</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:items-start">
            {/* Left Column - Form Fields */}
            <div className="space-y-4 flex flex-col">
              {/* Date Range Picker */}
              <div className="relative" ref={datePickerRef}>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('createEvent.form.eventDate')} <span className="text-[#FF3425]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={
                      formData.dateRange[0] && formData.dateRange[1]
                        ? `${formData.dateRange[0].toLocaleDateString('en-US')} - ${formData.dateRange[1].toLocaleDateString('en-US')}`
                        : ''
                    }
                    placeholder={t('createEvent.form.eventDatePlaceholder')}
                    onClick={() => {
                      closeAllDropdowns();
                      setShowDatePicker(!showDatePicker);
                    }}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm cursor-pointer focus:outline-none focus:border-primary  transition-all ${
                      errors.dateRange ? 'border-[#FF3425]' : 'border-light-gray'
                    } ${!formData.dateRange[0] ? 'text-[#9CA3AF]' : 'text-black'}`}
                  />
                  <img 
                    src={CalendarIcon}
                    alt="Calendar"
                    className="absolute end-3 top-1/2 -translate-y-1/2 w-[30px] h-[30px] cursor-pointer"
                    onClick={() => {
                      closeAllDropdowns();
                      setShowDatePicker(!showDatePicker);
                    }}
                  />
                </div>
                {showDatePicker && renderCalendar()}
                {errors.dateRange && (
                  <p className="mt-1 text-xs text-[#FF3425]">{errors.dateRange}</p>
                )}
              </div>

            {/* Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="relative" ref={startTimeRef}>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('createEvent.form.startTime')} <span className="text-[#FF3425]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={formData.startTime || t('createEvent.form.startTimePlaceholder')}
                    onClick={() => {
                      closeAllDropdowns();
                      setShowStartTimePicker(!showStartTimePicker);
                    }}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm cursor-pointer focus:outline-none focus:border-primary  transition-all ${
                      errors.startTime ? 'border-[#FF3425]' : 'border-light-gray'
                    } ${!formData.startTime ? 'text-[#9CA3AF]' : 'text-black'}`}
                  />
                  <svg 
                    className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray pointer-events-none" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                {showStartTimePicker && (
                  <StaticTimePicker
                    value={formData.startTime}
                    onChange={(time) => {
                      setFormData(prev => ({ ...prev, startTime: time }));
                      if (errors.startTime) {
                        setErrors(prev => ({ ...prev, startTime: '' }));
                      }
                    }}
                    onClose={() => setShowStartTimePicker(false)}
                  />
                )}
                {errors.startTime && (
                  <p className="mt-1 text-xs text-[#FF3425]">{errors.startTime}</p>
                )}
              </div>

              <div className="relative" ref={endTimeRef}>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('createEvent.form.endTime')} <span className="text-[#FF3425]">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value={formData.endTime || t('createEvent.form.endTimePlaceholder')}
                    onClick={() => {
                      closeAllDropdowns();
                      setShowEndTimePicker(!showEndTimePicker);
                    }}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm cursor-pointer focus:outline-none focus:border-primary  transition-all ${
                      errors.endTime ? 'border-[#FF3425]' : 'border-light-gray'
                    } ${!formData.endTime ? 'text-[#9CA3AF]' : 'text-black'}`}
                  />
                  <svg 
                    className="absolute end-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray pointer-events-none" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                {showEndTimePicker && (
                  <StaticTimePicker
                    value={formData.endTime}
                    onChange={(time) => {
                      setFormData(prev => ({ ...prev, endTime: time }));
                      if (errors.endTime) {
                        setErrors(prev => ({ ...prev, endTime: '' }));
                      }
                    }}
                    onClose={() => setShowEndTimePicker(false)}
                  />
                )}
                {errors.endTime && (
                  <p className="mt-1 text-xs text-[#FF3425]">{errors.endTime}</p>
                )}
              </div>
            </div>

              {/* Country and State Row (conditional) */}
              {(formData.eventType === 'in-person' || formData.eventType === 'hybrid') && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      {t('createEvent.form.country')} <span className="text-[#FF3425]">*</span>
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      placeholder={t('createEvent.form.countryPlaceholder')}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-primary  transition-all ${
                        errors.country ? 'border-[#FF3425]' : 'border-light-gray'
                      }`}
                    />
                    {errors.country && (
                      <p className="mt-1 text-xs text-[#FF3425]">{errors.country}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      {t('createEvent.form.state')} <span className="text-[#FF3425]">*</span>
                    </label>
                    {/* Liste des 58 wilayas — même référentiel que la recherche,
                        pour garantir des données homogènes (ORM-018). */}
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm bg-white focus:outline-none focus:border-primary transition-all ${
                        formData.state ? 'text-black' : 'text-[#9CA3AF]'
                      } ${errors.state ? 'border-[#FF3425]' : 'border-light-gray'}`}
                    >
                      <option value="">{t('createEvent.form.statePlaceholder')}</option>
                      {wilayas.map((wilaya) => (
                        <option key={wilaya.code} value={wilaya[locale]} className="text-black">
                          {wilayaLabel(wilaya, locale)}
                        </option>
                      ))}
                    </select>
                    {errors.state && (
                      <p className="mt-1 text-xs text-[#FF3425]">{errors.state}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Map Address (conditional) */}
              {(formData.eventType === 'in-person' || formData.eventType === 'hybrid') && (
                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    {t('createEvent.form.mapAddress')} <span className="text-[#FF3425]">*</span>
                  </label>
                  <input
                    type="text"
                    name="mapAddress"
                    value={formData.mapAddress}
                    onChange={handleInputChange}
                    placeholder={t('createEvent.form.mapAddressPlaceholder')}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-primary  transition-all ${
                      errors.mapAddress ? 'border-[#FF3425]' : 'border-light-gray'
                    }`}
                  />
                  {errors.mapAddress && (
                    <p className="mt-1 text-xs text-[#FF3425]">{errors.mapAddress}</p>
                  )}
                </div>
              )}

              {/* Online Link (optional - available for all event types) */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  {t('createEvent.form.onlineLink')} <span className="text-[#9CA3AF] text-xs">{t('createEvent.form.onlineLinkOptional')}</span>
                </label>
                <input
                  type="text"
                  name="onlineLink"
                  value={formData.onlineLink}
                  onChange={handleInputChange}
                  placeholder={t('createEvent.form.onlineLinkPlaceholder')}
                  className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-primary  transition-all"
                />
              </div>
            </div>

            {/* Right Column - Interactive Map */}
            {(formData.eventType === 'in-person' || formData.eventType === 'hybrid') && (
              <div className="flex flex-col h-full">
                <label className="block text-sm font-medium text-black mb-2">
                  {t('createEvent.form.mapPreview')}
                </label>
                <div className="flex-1 border border-light-gray rounded-lg overflow-hidden relative">
                  {/* Google Map iframe - Interactive, centered on Algeria */}
                  <iframe
                    key={mapLocation}
                    src={mapLocation 
                      ? `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${mapLocation}&zoom=15`
                      : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d6876839.3!2d1.6596!3d28.0339!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd7e8a6a28037bd1%3A0x7140bee3abd7f8a2!2sAlgeria!5e0!3m2!1sen!2s!4v1234567890123!5m2!1sen!2s"
                    }
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Event location map"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 3. Event Images */}
        <div className="bg-white border border-light-gray rounded-xl p-5">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-black mb-1">{t('createEvent.steps.images')}</h2>
            <p className="text-sm text-gray">
              <svg className="w-4 h-4 inline-block me-1 text-primary" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              {t('createEvent.form.imagesInfo')}
            </p>
          </div>
          
          <div>
            {/* Upload Zone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => imageInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-primary bg-primary-light/50 scale-[1.02]'
                  : 'border-light-gray bg-secondary-light hover:border-primary hover:bg-primary-light'
              }`}
            >
              <svg className="w-12 h-12 text-primary/60 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm mb-1">
                <span className="text-primary font-semibold">{t('createEvent.form.uploadZone.click')}</span>
                <span className="text-gray">{t('createEvent.form.uploadZone.dragDrop')}</span>
              </p>
              <p className="text-xs text-gray">
                {t('createEvent.form.uploadZone.formats')}
              </p>
            </div>
            
            <input
              ref={imageInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg"
              multiple
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
            />
            
            {errors.eventImages && (
              <p className="mt-2 text-xs text-[#FF3425]">{errors.eventImages}</p>
            )}

            {/* Image Previews Grid */}
            {(formData.eventImages.length > 0 || existingImages.length > 0) && (
              <div className="mt-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Existing images from the backend */}
                  {existingImages.map((url, index) => (
                    <div
                      key={url}
                      className="relative group rounded-lg overflow-hidden border-2 border-light-gray hover:border-primary transition-all"
                    >
                      {/* Cover Badge */}
                      {index === 0 && formData.eventImages.length === 0 && (
                        <div className="absolute top-2 start-2 z-10 bg-primary text-white text-xs font-semibold px-2 py-1 rounded-md">
                          {t('createEvent.form.coverBadge')}
                        </div>
                      )}

                      <img
                        src={url}
                        alt={`Existing event image ${index + 1}`}
                        className="w-full h-32 object-cover"
                      />

                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => removeExistingImage(url)}
                          className="w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="Delete image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>

                      <div className="absolute bottom-2 end-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                        {index + 1}
                      </div>
                    </div>
                  ))}

                  {/* Newly uploaded images */}
                  {formData.eventImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="relative group rounded-lg overflow-hidden border-2 border-light-gray hover:border-primary transition-all"
                    >
                      {/* Cover Badge */}
                      {index === 0 && existingImages.length === 0 && (
                        <div className="absolute top-2 start-2 z-10 bg-primary text-white text-xs font-semibold px-2 py-1 rounded-md">
                          {t('createEvent.form.coverBadge')}
                        </div>
                      )}

                      {/* Image */}
                      <img
                        src={image.preview}
                        alt={`Event image ${existingImages.length + index + 1}`}
                        className="w-full h-32 object-cover"
                      />

                      {/* Overlay with Actions */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        {/* Move Left */}
                        {index > 0 && (
                          <button
                            type="button"
                            onClick={() => moveImage(index, index - 1)}
                            className="w-10 h-10 flex items-center justify-center bg-white rounded-lg hover:bg-secondary-light transition-colors"
                            title="Move left"
                          >
                            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => removeImage(image.id)}
                          className="w-10 h-10 flex items-center justify-center bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          title="Delete image"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>

                        {/* Move Right */}
                        {index < formData.eventImages.length - 1 && (
                          <button
                            type="button"
                            onClick={() => moveImage(index, index + 1)}
                            className="w-10 h-10 flex items-center justify-center bg-white rounded-lg hover:bg-secondary-light transition-colors"
                            title="Move right"
                          >
                            <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        )}
                      </div>

                      {/* Image Number */}
                      <div className="absolute bottom-2 end-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">
                        {existingImages.length + index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 4. Tickets & Pricing */}
        <div className="bg-white border border-light-gray rounded-xl p-5">
          <h2 className="text-lg font-semibold text-black mb-4">{t('createEvent.steps.tickets')}</h2>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pe-1">
            {formData.tickets.map((ticket, index) => (
              <div key={ticket.id} className="border border-light-gray rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-black">
                    {t('createEvent.form.ticketLabel', { number: index + 1 })}
                  </h3>
                  {formData.tickets.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          tickets: prev.tickets.filter(t => t.id !== ticket.id)
                        }));
                        setTicketErrors(prev => {
                          const newErrors = { ...prev };
                          delete newErrors[ticket.id];
                          return newErrors;
                        });
                      }}
                      className="text-red-500 hover:text-red-600 transition-colors"
                      title="Remove ticket"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Line 1: Custom Ticket Type Input */}
                <div className="mb-3 max-w-sm">
                  <label className="block text-sm font-medium text-black mb-2">
                    {t('createEvent.form.ticketType')} <span className="text-[#FF3425]">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t('createEvent.form.ticketTypePlaceholder')}
                    value={ticket.type}
                    onChange={(e) => {
                      const value = e.target.value;
                      setFormData(prev => ({
                        ...prev,
                        tickets: prev.tickets.map(t =>
                          t.id === ticket.id ? { ...t, type: value } : t
                        )
                      }));
                      // Clear error when typing
                      if (ticketErrors[ticket.id]?.type) {
                        setTicketErrors(prev => ({
                          ...prev,
                          [ticket.id]: { ...prev[ticket.id], type: '' }
                        }));
                      }
                    }}
                    className={`w-full px-4 py-2.5 border rounded-lg text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-primary transition-all ${
                      ticketErrors[ticket.id]?.type ? 'border-[#FF3425]' : 'border-light-gray'
                    }`}
                  />
                  {ticketErrors[ticket.id]?.type && (
                    <p className="mt-1 text-xs text-[#FF3425]">{ticketErrors[ticket.id].type}</p>
                  )}
                  <p className="mt-1 text-xs text-[#757575]">{t('createEvent.form.ticketTypeHint')}</p>
                </div>

                {/* Line 2: Price Type, Quantity, and Price */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Price Type Select */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-black mb-2">
                      {t('createEvent.form.priceType')} <span className="text-[#FF3425]">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        closeAllDropdowns();
                        setOpenPriceTypeDropdown(openPriceTypeDropdown === ticket.id ? null : ticket.id);
                      }}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm text-start flex items-center justify-between focus:outline-none focus:border-primary  transition-all ${
                        ticketErrors[ticket.id]?.priceType ? 'border-[#FF3425]' : 'border-light-gray'
                      } ${ticket.priceType ? 'text-black' : 'text-[#9CA3AF]'}`}
                    >
                      {ticket.priceType === 'free' ? t('createEvent.form.priceTypeFree') : ticket.priceType === 'paid' ? t('createEvent.form.priceTypePaid') : t('createEvent.form.priceTypePlaceholder')}
                      <svg className="w-4 h-4 text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    
                    {openPriceTypeDropdown === ticket.id && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-light-gray rounded-lg shadow-lg">
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              tickets: prev.tickets.map(t =>
                                t.id === ticket.id ? { ...t, priceType: 'free', price: '' } : t
                              )
                            }));
                            setOpenPriceTypeDropdown(null);
                            if (ticketErrors[ticket.id]?.priceType) {
                              setTicketErrors(prev => ({
                                ...prev,
                                [ticket.id]: { ...prev[ticket.id], priceType: '' }
                              }));
                            }
                          }}
                          className={`w-full px-4 py-2 text-start text-sm transition-colors ${
                            ticket.priceType === 'free'
                              ? 'bg-primary-light text-primary font-medium'
                              : 'text-gray hover:bg-secondary-light'
                          }`}
                        >
                          {t('createEvent.form.priceTypeFree')}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              tickets: prev.tickets.map(t =>
                                t.id === ticket.id ? { ...t, priceType: 'paid' } : t
                              )
                            }));
                            setOpenPriceTypeDropdown(null);
                            if (ticketErrors[ticket.id]?.priceType) {
                              setTicketErrors(prev => ({
                                ...prev,
                                [ticket.id]: { ...prev[ticket.id], priceType: '' }
                              }));
                            }
                          }}
                          className={`w-full px-4 py-2 text-start text-sm transition-colors ${
                            ticket.priceType === 'paid'
                              ? 'bg-primary-light text-primary font-medium'
                              : 'text-gray hover:bg-secondary-light'
                          }`}
                        >
                          {t('createEvent.form.priceTypePaid')}
                        </button>
                      </div>
                    )}
                    {ticketErrors[ticket.id]?.priceType && (
                      <p className="mt-1 text-xs text-[#FF3425]">{ticketErrors[ticket.id].priceType}</p>
                    )}
                  </div>

                  {/* Ticket Quantity */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      {t('createEvent.form.quantity')} <span className="text-[#FF3425]">*</span>
                    </label>
                    <input
                      type="number"
                      value={ticket.quantity}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          tickets: prev.tickets.map(t =>
                            t.id === ticket.id ? { ...t, quantity: e.target.value } : t
                          )
                        }));
                        if (ticketErrors[ticket.id]?.quantity) {
                          setTicketErrors(prev => ({
                            ...prev,
                            [ticket.id]: { ...prev[ticket.id], quantity: '' }
                          }));
                        }
                      }}
                      placeholder="0"
                      min="1"
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-primary  transition-all ${
                        ticketErrors[ticket.id]?.quantity ? 'border-[#FF3425]' : 'border-light-gray'
                      }`}
                    />
                    {ticketErrors[ticket.id]?.quantity && (
                      <p className="mt-1 text-xs text-[#FF3425]">{ticketErrors[ticket.id].quantity}</p>
                    )}
                  </div>

                  {/* Ticket Price */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      {t('createEvent.form.price')} {ticket.priceType === 'paid' && <span className="text-[#FF3425]">*</span>}
                    </label>
                    <input
                      type="number"
                      value={ticket.price}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          tickets: prev.tickets.map(t =>
                            t.id === ticket.id ? { ...t, price: e.target.value } : t
                          )
                        }));
                        if (ticketErrors[ticket.id]?.price) {
                          setTicketErrors(prev => ({
                            ...prev,
                            [ticket.id]: { ...prev[ticket.id], price: '' }
                          }));
                        }
                      }}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      disabled={ticket.priceType !== 'paid'}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-primary  transition-all ${
                        ticket.priceType !== 'paid' ? 'bg-[#F5F5F5] cursor-not-allowed opacity-60' : ''
                      } ${ticketErrors[ticket.id]?.price ? 'border-[#FF3425]' : 'border-light-gray'}`}
                    />
                    {ticketErrors[ticket.id]?.price && (
                      <p className="mt-1 text-xs text-[#FF3425]">{ticketErrors[ticket.id].price}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add Ticket Button */}
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  tickets: [
                    ...prev.tickets,
                    {
                      id: `ticket-${Date.now()}`,
                      type: '',
                      priceType: '',
                      price: '',
                      quantity: ''
                    }
                  ]
                }));
              }}
              className="px-3 py-2 border-2 border-dashed border-primary/30 rounded-lg text-xs font-medium text-primary bg-primary-light/30 hover:bg-primary-light hover:border-primary transition-all flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {t('createEvent.form.addTicket')}
            </button>
          </div>
        </div>

        {/* 5. Q&A Section */}
        <div className="bg-white border border-light-gray rounded-xl p-5">
          <h2 className="text-lg font-semibold text-black mb-4">Q&A</h2>
          
          <div className="space-y-4">
            {formData.faqs.map((faq, index) => (
              <div key={faq.id} className="border border-light-gray rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-black">
                    Question {index + 1}
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        faqs: prev.faqs.filter(f => f.id !== faq.id)
                      }));
                      setFaqErrors(prev => {
                        const newErrors = { ...prev };
                        delete newErrors[faq.id];
                        return newErrors;
                      });
                    }}
                    className="text-red-500 hover:text-red-600 transition-colors"
                    title="Remove FAQ"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Question */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Question <span className="text-[#FF3425]">*</span>
                    </label>
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          faqs: prev.faqs.map(f =>
                            f.id === faq.id ? { ...f, question: e.target.value } : f
                          )
                        }));
                        if (faqErrors[faq.id]?.question) {
                          setFaqErrors(prev => ({
                            ...prev,
                            [faq.id]: { ...prev[faq.id], question: '' }
                          }));
                        }
                      }}
                      placeholder={t('createEvent.faq.questionPlaceholder')}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-primary  transition-all ${
                        faqErrors[faq.id]?.question ? 'border-[#FF3425]' : 'border-light-gray'
                      }`}
                    />
                    {faqErrors[faq.id]?.question && (
                      <p className="mt-1 text-xs text-[#FF3425]">{faqErrors[faq.id].question}</p>
                    )}
                  </div>

                  {/* Answer */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Answer <span className="text-[#FF3425]">*</span>
                    </label>
                    <textarea
                      value={faq.answer}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          faqs: prev.faqs.map(f =>
                            f.id === faq.id ? { ...f, answer: e.target.value } : f
                          )
                        }));
                        if (faqErrors[faq.id]?.answer) {
                          setFaqErrors(prev => ({
                            ...prev,
                            [faq.id]: { ...prev[faq.id], answer: '' }
                          }));
                        }
                      }}
                      placeholder={t('createEvent.faq.answerPlaceholder')}
                      rows={3}
                      className={`w-full px-4 py-2.5 border rounded-lg text-sm text-black placeholder:text-[#9CA3AF] focus:outline-none focus:border-primary  transition-all resize-none ${
                        faqErrors[faq.id]?.answer ? 'border-[#FF3425]' : 'border-light-gray'
                      }`}
                    />
                    {faqErrors[faq.id]?.answer && (
                      <p className="mt-1 text-xs text-[#FF3425]">{faqErrors[faq.id].answer}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Add FAQ Button */}
            <button
              type="button"
              onClick={() => {
                setFormData(prev => ({
                  ...prev,
                  faqs: [
                    ...prev.faqs,
                    {
                      id: `faq-${Date.now()}`,
                      question: '',
                      answer: ''
                    }
                  ]
                }));
              }}
              className="px-3 py-2 border-2 border-dashed border-primary/30 rounded-lg text-xs font-medium text-primary bg-primary-light/30 hover:bg-primary-light hover:border-primary transition-all flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Question
            </button>
          </div>
        </div>

        {/* 6. Publication & Visibility */}
        <div className="bg-white border border-light-gray rounded-xl p-5">
          <h2 className="text-lg font-semibold text-black mb-4">{t('createEvent.publicationSection')}</h2>
          
          <div className="max-w-md">
            <label className="block text-sm font-medium text-black mb-2">
              Visibility
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, visibility: 'public' }))}
                className={`flex-1 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all ${
                  formData.visibility === 'public'
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-light-gray bg-white text-gray hover:border-primary hover:text-primary'
                }`}
              >
                Public
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, visibility: 'private' }))}
                className={`flex-1 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all ${
                  formData.visibility === 'private'
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-light-gray bg-white text-gray hover:border-primary hover:text-primary'
                }`}
              >
                Private
              </button>
            </div>
            <p className="mt-2 text-xs text-input-gray">
              {formData.visibility === 'public' 
                ? 'Your event will be visible to everyone' 
                : 'Your event will only be accessible via direct link'}
            </p>
          </div>

          {/* Reservation Approval */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Reservation Approval
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, requiresApproval: false }))}
                className={`flex-1 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all ${
                  !formData.requiresApproval
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-light-gray bg-white text-gray hover:border-primary hover:text-primary'
                }`}
              >
                Auto-approve
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, requiresApproval: true }))}
                className={`flex-1 px-4 py-2.5 border rounded-lg text-sm font-medium transition-all ${
                  formData.requiresApproval
                    ? 'border-primary bg-primary-light text-primary'
                    : 'border-light-gray bg-white text-gray hover:border-primary hover:text-primary'
                }`}
              >
                Manual approval
              </button>
            </div>
            <p className="mt-2 text-xs text-input-gray">
              {formData.requiresApproval
                ? 'You must manually approve each reservation request'
                : 'Reservations are automatically confirmed after payment'}
            </p>
          </div>
        </div>

        {/* Error Message */}
        {submitError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {submitError}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <button
              type="button"
              onClick={() => setIsPreviewModalOpen(true)}
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 ps-5 pe-5 py-2 border border-gray text-gray rounded-full text-sm font-medium hover:bg-secondary-light hover:border-black hover:text-black transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
                <path d="M10 3.33301C5.83333 3.33301 2.27499 5.73301 0.833328 9.16634C2.27499 12.5997 5.83333 14.9997 10 14.9997C14.1667 14.9997 17.725 12.5997 19.1667 9.16634C17.725 5.73301 14.1667 3.33301 10 3.33301Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {t('createEvent.actions.preview')}
            </button>
            {mode !== 'edit' && (
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={isSubmitting}
                className="w-full sm:w-auto ps-5 pe-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('createEvent.actions.saving') : t('createEvent.actions.saveDraft')}
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={mode === 'edit' ? handleSaveDraft : handlePublish}
            disabled={isSubmitting}
            className="w-full sm:w-auto ps-5 pe-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
          >
            {isSubmitting ? t('createEvent.actions.publishing') : (mode === 'edit' ? t('createEvent.actions.saveChanges') : t('createEvent.actions.publish'))}
          </button>
        </div>
      </form>

      {/* Event Preview Modal */}
      <EventPreviewModal
        isOpen={isPreviewModalOpen}
        onClose={() => setIsPreviewModalOpen(false)}
        eventData={formData}
      />
    </div>
  );
};

export default CreateEvent;
