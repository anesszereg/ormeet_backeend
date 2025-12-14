import { useState } from 'react';
import PersonalInfoIcon from '../assets/Svgs/personalInfo.svg';
import PaymentIcon from '../assets/Svgs/payment.svg';
import EmailIcon from '../assets/Svgs/email.svg';
import SecurityIcon from '../assets/Svgs/security.svg';
import EditIcon from '../assets/Svgs/edit.svg';
import VerifiedIcon from '../assets/Svgs/verified.svg';
import ProfilePhoto from '../assets/imges/photoProfil.jpg';
import CardIcon from '../assets/Svgs/card.svg';
import GoBackIcon from '../assets/Svgs/goBack.svg';
import UploadIcon from '../assets/Svgs/upload.svg';
import AddIcon from '../assets/Svgs/add.svg';
import CardFirstImage from '../assets/imges/cardFirst.png';

interface PaymentCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

const AccountSettings = () => {
  const [activeSection, setActiveSection] = useState('personal-info');
  
  // Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [isEditPasswordOpen, setIsEditPasswordOpen] = useState(false);
  
  // Validation errors
  const [profileError, setProfileError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Form states for Personal Info
  const [profileData, setProfileData] = useState({
    fullName: 'Lina Bensalem',
    profilePhoto: ProfilePhoto
  });
  
  const [emailData, setEmailData] = useState({
    currentEmail: 'sophia.reed@gmail.com',
    newEmail: '',
    password: ''
  });
  
  const [phoneData, setPhoneData] = useState({
    currentPhone: '(775) 586-5206',
    newPhone: '',
    password: ''
  });
  
  const [locationData, setLocationData] = useState({
    country: 'Algeria',
    city: 'Oran',
    address: ''
  });
  
  // Payment Methods states
  const [savedCards, setSavedCards] = useState<PaymentCard[]>([]);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvv: ''
  });
  
  // Email Preferences states
  const [attendeePrefs, setAttendeePrefs] = useState({
    ticketConfirmations: true,
    eventReminders: true,
    eventUpdates: true,
    newEvents: true,
    specialOffers: false,
    newsletters: false,
    surveys: false
  });
  
  // Login & Security states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  
  // Handlers for Personal Info
  const handleProfileSave = () => {
    if (!profileData.fullName.trim()) {
      setProfileError('Full name is required');
      return;
    }
    setProfileError('');
    setIsProfileModalOpen(false);
  };
  
  const handleEmailSave = () => {
    if (!emailData.newEmail.trim()) {
      setEmailError('New email is required');
      return;
    }
    if (!emailData.password.trim()) {
      setEmailError('Password is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.newEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    setEmailError('');
    setEmailData({ ...emailData, currentEmail: emailData.newEmail, newEmail: '', password: '' });
    setIsEmailModalOpen(false);
  };
  
  const handlePhoneSave = () => {
    if (!phoneData.newPhone.trim()) {
      setPhoneError('New phone number is required');
      return;
    }
    if (!phoneData.password.trim()) {
      setPhoneError('Password is required');
      return;
    }
    setPhoneError('');
    setPhoneData({ ...phoneData, currentPhone: phoneData.newPhone, newPhone: '', password: '' });
    setIsPhoneModalOpen(false);
  };
  
  const handleLocationSave = () => {
    if (!locationData.country.trim()) {
      setLocationError('Country is required');
      return;
    }
    if (!locationData.city.trim()) {
      setLocationError('City is required');
      return;
    }
    setLocationError('');
    setIsLocationModalOpen(false);
  };
  
  // Handlers for Payment Methods
  const handleAddCard = () => {
    if (newCard.cardNumber && newCard.expiryMonth && newCard.expiryYear && newCard.cvv) {
      const card: PaymentCard = {
        id: Date.now().toString(),
        cardNumber: newCard.cardNumber,
        cardHolder: 'CHARLOTTE JOHNSON',
        expiryMonth: newCard.expiryMonth,
        expiryYear: newCard.expiryYear,
        cvv: newCard.cvv
      };
      setSavedCards([...savedCards, card]);
      setNewCard({ cardNumber: '', expiryMonth: '', expiryYear: '', cvv: '' });
      setShowAddCardForm(false);
    }
  };
  
  const handleDeleteCard = (id: string) => {
    setSavedCards(savedCards.filter(card => card.id !== id));
  };
  
  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\s/g, '');
    const chunks = cleaned.match(/.{1,4}/g);
    return chunks ? chunks.join(' ') : cleaned;
  };
  
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, '');
    if (value.length <= 16 && /^\d*$/.test(value)) {
      setNewCard({ ...newCard, cardNumber: value });
    }
  };
  
  const getMaskedCardNumber = (cardNumber: string) => {
    const lastFour = cardNumber.slice(-4);
    return `•••• •••• •••• ${lastFour}`;
  };
  
  // Handlers for Login & Security
  const handlePasswordSave = () => {
    if (!passwordData.currentPassword.trim()) {
      setPasswordError('Current password is required');
      return;
    }
    if (!passwordData.newPassword.trim()) {
      setPasswordError('New password is required');
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError('');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setIsEditPasswordOpen(false);
    // Here you would typically call an API to update the password
  };

  const menuItems = [
    { id: 'personal-info', label: 'Personal Info', icon: PersonalInfoIcon },
    { id: 'payment-methods', label: 'Payment Methods', icon: PaymentIcon },
    { id: 'email-preferences', label: 'Email preferences', icon: EmailIcon },
    { id: 'login-security', label: 'Login & security', icon: SecurityIcon },
  ];

  return (
    <div className="w-full">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-black mb-6">Personal Info</h1>
      <p className="text-sm text-[#4F4F4F] mb-8">Verify your personal info to enhance your experience.</p>

      {/* Main Grid: Left Menu + Right Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Left Column: Navigation Menu */}
        <div className="bg-white rounded-xl border border-[#EEEEEE] p-4">
          <nav>
            <ul className="space-y-2">
              {menuItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => setActiveSection(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      activeSection === item.id
                        ? 'bg-[#FFF4F3] text-[#FF4000]'
                        : 'text-[#4F4F4F] hover:bg-[#F8F8F8]'
                    }`}
                  >
                    <img
                      src={item.icon}
                      alt={item.label}
                      className="w-5 h-5 shrink-0"
                    />
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Right Column: Content */}
        <div className="space-y-6">
          {/* Personal Info Section */}
          {activeSection === 'personal-info' && (
            <>
              {/* Profile Card */}
              <div className="bg-white rounded-xl border border-[#EEEEEE] p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-black">Profile</h2>
                  <button 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-[#F8F8F8] rounded-lg transition-colors"
                  >
                    <img src={EditIcon} alt="Edit" className="w-4 h-4" />
                    Edit
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <img
                    src={profileData.profilePhoto}
                    alt="Profile"
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-base font-semibold text-black">{profileData.fullName}</h3>
                  </div>
                </div>
              </div>

              {/* Email Card */}
              <div className="bg-white rounded-xl border border-[#EEEEEE] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-black">Email</h2>
                  <button 
                    onClick={() => setIsEmailModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-[#F8F8F8] rounded-lg transition-colors"
                  >
                    <img src={EditIcon} alt="Edit" className="w-4 h-4" />
                    Edit
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm text-black">{emailData.currentEmail}</p>
                  <div className="flex items-center gap-1 px-2 py-1 bg-[#E8F5E9] rounded-full">
                    <img src={VerifiedIcon} alt="Verified" className="w-3 h-3" />
                    <span className="text-xs font-medium text-[#2E7D32]">Verified</span>
                  </div>
                </div>
              </div>

              {/* Phone Card */}
              <div className="bg-white rounded-xl border border-[#EEEEEE] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-black">Phone</h2>
                  <button 
                    onClick={() => setIsPhoneModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-[#F8F8F8] rounded-lg transition-colors"
                  >
                    <img src={EditIcon} alt="Edit" className="w-4 h-4" />
                    Edit
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-sm text-black">{phoneData.currentPhone}</p>
                  <button className="text-sm font-medium text-[#FF4000] hover:underline">
                    Verify your phone
                  </button>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-white rounded-xl border border-[#EEEEEE] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-black">Location</h2>
                  <button 
                    onClick={() => setIsLocationModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-[#F8F8F8] rounded-lg transition-colors"
                  >
                    <img src={EditIcon} alt="Edit" className="w-4 h-4" />
                    Edit
                  </button>
                </div>

                <p className="text-sm text-black">{locationData.city}, {locationData.country}</p>
              </div>
            </>
          )}

          {/* Payment Methods Section */}
          {activeSection === 'payment-methods' && (
            <>
              {!showAddCardForm ? (
                <div className="space-y-6">
                  {savedCards.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-xl border border-[#EEEEEE] p-12 flex flex-col items-center justify-center">
                      <div className="w-64 h-40 mb-6">
                        <img src={CardFirstImage} alt="Card" className="w-full h-full object-contain" />
                      </div>
                      <h2 className="text-xl font-bold text-black mb-2">Add your preferred payment method</h2>
                      <p className="text-sm text-[#4F4F4F] mb-6 text-center max-w-md">
                        Securely save a payment method to make ticket purchases quick and easy. You can update it anytime.
                      </p>
                      <button
                        onClick={() => setShowAddCardForm(true)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-[#FF4000] text-white rounded-lg text-base font-semibold hover:bg-[#E63900] transition-colors"
                      >
                        Add Payment Method
                        <img src={AddIcon} alt="Add" className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    /* Saved Cards */
                    <div className="bg-white rounded-xl border border-[#EEEEEE] p-6">
                      <h2 className="text-lg font-bold text-black mb-6">Saved Cards</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {savedCards.map((card) => (
                          <div key={card.id} className="relative bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-xl p-6 shadow-lg">
                            <div className="flex flex-col h-full justify-between">
                              <div className="flex justify-between items-start">
                                <img src={CardIcon} alt="Card" className="w-12 h-12" />
                                <button
                                  onClick={() => handleDeleteCard(card.id)}
                                  className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                                >
                                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M4 4L10 10M4 10L10 4" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/>
                                  </svg>
                                </button>
                              </div>
                              <div className="mt-8">
                                <p className="text-white text-lg font-medium mb-4 tracking-wider">{getMaskedCardNumber(card.cardNumber)}</p>
                                <div className="flex items-center justify-between">
                                  <p className="text-white text-sm font-medium">{card.cardHolder}</p>
                                  <p className="text-white text-sm">{card.expiryMonth}/{card.expiryYear.slice(-2)}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={() => setShowAddCardForm(true)}
                        className="flex items-center gap-2 text-sm font-medium text-[#FF4000] hover:underline"
                      >
                        <span className="text-xl">+</span>
                        Add more
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Add Card Form - Full Page */
                <div className="bg-white rounded-xl border border-[#EEEEEE] p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <button
                      onClick={() => setShowAddCardForm(false)}
                      className="p-2 hover:bg-[#F8F8F8] rounded-lg transition-colors"
                    >
                      <img src={GoBackIcon} alt="Go Back" className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-black">Add Payment method</h2>
                      <p className="text-sm text-[#4F4F4F]">Add your card to enjoy smooth and hassle-free booking.</p>
                    </div>
                  </div>
                  <div className="max-w-2xl">
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-black">Card Number</label>
                        <input
                          type="text"
                          value={formatCardNumber(newCard.cardNumber)}
                          onChange={handleCardNumberChange}
                          placeholder="0000    0000    0000    0000"
                          className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-black">Expire Month</label>
                          <input
                            type="text"
                            value={newCard.expiryMonth}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 2 && /^\d*$/.test(value)) {
                                setNewCard({ ...newCard, expiryMonth: value });
                              }
                            }}
                            placeholder="MM"
                            className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-black">Expire Year</label>
                          <input
                            type="text"
                            value={newCard.expiryYear}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 4 && /^\d*$/.test(value)) {
                                setNewCard({ ...newCard, expiryYear: value });
                              }
                            }}
                            placeholder="YYYY"
                            className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-black">CVV</label>
                          <input
                            type="text"
                            value={newCard.cvv}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 3 && /^\d*$/.test(value)) {
                                setNewCard({ ...newCard, cvv: value });
                              }
                            }}
                            placeholder="Entre CVV"
                            className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-8">
                      <button
                        onClick={handleAddCard}
                        className="px-8 py-3.5 bg-[#FF4000] text-white rounded-lg text-base font-semibold hover:bg-[#E63900] transition-colors"
                      >
                        Save Card
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Email Preferences Section */}
          {activeSection === 'email-preferences' && (
            <div className="bg-white rounded-xl border border-[#EEEEEE] p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-black mb-2">Email preferences</h2>
                <p className="text-sm text-[#4F4F4F]">Choose the emails you want to receive—stay informed, not overwhelmed.</p>
              </div>
              
              {/* Attendees Preferences */}
              <div className="space-y-6">
                  <div className="flex items-start justify-between py-4 border-b border-[#EEEEEE]">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-black mb-1">Ticket Confirmations</h3>
                      <p className="text-sm text-[#4F4F4F]">Get a confirmation email after purchasing tickets.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={attendeePrefs.ticketConfirmations}
                        onChange={(e) => setAttendeePrefs({ ...attendeePrefs, ticketConfirmations: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#BCBCBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4000]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-start justify-between py-4 border-b border-[#EEEEEE]">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-black mb-1">Event Reminders</h3>
                      <p className="text-sm text-[#4F4F4F]">Receive reminders before your event starts.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={attendeePrefs.eventReminders}
                        onChange={(e) => setAttendeePrefs({ ...attendeePrefs, eventReminders: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#BCBCBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4000]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-start justify-between py-4 border-b border-[#EEEEEE]">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-black mb-1">Event Updates & Cancellations</h3>
                      <p className="text-sm text-[#4F4F4F]">Be notified if any changes are made to your registered events.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={attendeePrefs.eventUpdates}
                        onChange={(e) => setAttendeePrefs({ ...attendeePrefs, eventUpdates: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#BCBCBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4000]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-start justify-between py-4 border-b border-[#EEEEEE]">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-black mb-1">New Events in My Area</h3>
                      <p className="text-sm text-[#4F4F4F]">Get emails about trending or upcoming events near you.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={attendeePrefs.newEvents}
                        onChange={(e) => setAttendeePrefs({ ...attendeePrefs, newEvents: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#BCBCBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4000]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-start justify-between py-4 border-b border-[#EEEEEE]">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-black mb-1">Special Offers & Discounts</h3>
                      <p className="text-sm text-[#4F4F4F]">Receive exclusive ticket offers, early bird pricing, and promotions.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={attendeePrefs.specialOffers}
                        onChange={(e) => setAttendeePrefs({ ...attendeePrefs, specialOffers: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#BCBCBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4000]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-start justify-between py-4 border-b border-[#EEEEEE]">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-black mb-1">Newsletters & Platform Updates</h3>
                      <p className="text-sm text-[#4F4F4F]">Stay in the loop with Ormeet tips, stories, and announcements.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={attendeePrefs.newsletters}
                        onChange={(e) => setAttendeePrefs({ ...attendeePrefs, newsletters: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#BCBCBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4000]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-start justify-between py-4">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-black mb-1">Surveys & Feedback Requests</h3>
                      <p className="text-sm text-[#4F4F4F]">Help us improve by sharing your experience after events.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ml-4">
                      <input
                        type="checkbox"
                        checked={attendeePrefs.surveys}
                        onChange={(e) => setAttendeePrefs({ ...attendeePrefs, surveys: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#BCBCBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4000]"></div>
                    </label>
                  </div>
                </div>
            </div>
          )}

          {/* Login & Security Section */}
          {activeSection === 'login-security' && (
            <div className="bg-white rounded-xl border border-[#EEEEEE] p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-black mb-2">Login & security</h2>
                <p className="text-sm text-[#4F4F4F]">Set a unique password to protect your account</p>
              </div>
              
              {!isEditPasswordOpen ? (
                <>
                  {/* Password Section */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-base font-semibold text-black">Password</h3>
                      <button
                        onClick={() => setIsEditPasswordOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-[#F8F8F8] rounded-lg transition-colors"
                      >
                        <img src={EditIcon} alt="Edit" className="w-4 h-4" />
                        Change Password
                      </button>
                    </div>
                    <p className="text-sm text-black">••••••••</p>
                  </div>
                  
                  {/* Two-factor Authentication Section */}
                  <div className="pt-6 border-t border-[#EEEEEE]">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-black mb-1">Two-factor authentication</h3>
                        <p className="text-sm text-[#4F4F4F]">Two-factor authentication adds extra security by requiring a second step to verify your identity during login.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer ml-6">
                        <input
                          type="checkbox"
                          checked={twoFactorEnabled}
                          onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#BCBCBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4000]"></div>
                      </label>
                    </div>
                  </div>
                </>
              ) : (
                /* Edit Password Form */
                <div>
                  {passwordError && (
                    <div className="mb-4 px-4 py-3 bg-red-50 border border-[#FF3425] rounded-lg text-[#FF3425] text-sm">
                      {passwordError}
                    </div>
                  )}
                  <div className="space-y-4 mb-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-black">Current Password</label>
                      <input
                        type="password"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        placeholder="Enter current password"
                        className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-black">New Password</label>
                      <input
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        placeholder="Enter new password"
                        className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-black">Confirm New Password</label>
                      <input
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                        className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setPasswordError('');
                        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                        setIsEditPasswordOpen(false);
                      }}
                      className="flex-1 px-6 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-base font-semibold text-black hover:bg-[#F8F8F8] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handlePasswordSave}
                      className="flex-1 px-6 py-3.5 bg-[#FF4000] text-white rounded-lg text-base font-semibold hover:bg-[#E63900] transition-colors"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Profile Edit Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold text-black mb-6">Edit Profile</h2>
            {profileError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-[#FF3425] rounded-lg text-[#FF3425] text-sm">
                {profileError}
              </div>
            )}
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black">Full Name</label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black">Profile Photo</label>
                <div className="flex items-center gap-4">
                  <img src={profileData.profilePhoto} alt="Profile" className="w-16 h-16 rounded-full object-cover" />
                  <button className="flex items-center gap-2 px-4 py-2 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm font-medium text-black hover:bg-[#F8F8F8] transition-colors">
                    <img src={UploadIcon} alt="Upload" className="w-4 h-4" />
                    Change Photo
                  </button>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setProfileError('');
                  setIsProfileModalOpen(false);
                }}
                className="flex-1 px-6 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-base font-semibold text-black hover:bg-[#F8F8F8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleProfileSave}
                className="flex-1 px-6 py-3.5 bg-[#FF4000] text-white rounded-lg text-base font-semibold hover:bg-[#E63900] transition-colors"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Email Edit Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold text-black mb-6">Edit Email</h2>
            {emailError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-[#FF3425] rounded-lg text-[#FF3425] text-sm">
                {emailError}
              </div>
            )}
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black">Current Email</label>
                <input
                  type="email"
                  value={emailData.currentEmail}
                  disabled
                  className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-[#4F4F4F] bg-[#F8F8F8]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black">New Email</label>
                <input
                  type="email"
                  value={emailData.newEmail}
                  onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                  placeholder="Enter new email"
                  className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black">Password</label>
                <input
                  type="password"
                  value={emailData.password}
                  onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setEmailError('');
                  setIsEmailModalOpen(false);
                }}
                className="flex-1 px-6 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-base font-semibold text-black hover:bg-[#F8F8F8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleEmailSave}
                className="flex-1 px-6 py-3.5 bg-[#FF4000] text-white rounded-lg text-base font-semibold hover:bg-[#E63900] transition-colors"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Phone Edit Modal */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold text-black mb-6">Edit Phone</h2>
            {phoneError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-[#FF3425] rounded-lg text-[#FF3425] text-sm">
                {phoneError}
              </div>
            )}
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black">Current Phone</label>
                <input
                  type="text"
                  value={phoneData.currentPhone}
                  disabled
                  className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-[#4F4F4F] bg-[#F8F8F8]"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black">New Phone Number</label>
                <input
                  type="tel"
                  value={phoneData.newPhone}
                  onChange={(e) => setPhoneData({ ...phoneData, newPhone: e.target.value })}
                  placeholder="Enter new phone number"
                  className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black">Password</label>
                <input
                  type="password"
                  value={phoneData.password}
                  onChange={(e) => setPhoneData({ ...phoneData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setPhoneError('');
                  setIsPhoneModalOpen(false);
                }}
                className="flex-1 px-6 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-base font-semibold text-black hover:bg-[#F8F8F8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handlePhoneSave}
                className="flex-1 px-6 py-3.5 bg-[#FF4000] text-white rounded-lg text-base font-semibold hover:bg-[#E63900] transition-colors"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Location Edit Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg w-full">
            <h2 className="text-2xl font-bold text-black mb-6">Edit Location</h2>
            {locationError && (
              <div className="mb-4 px-4 py-3 bg-red-50 border border-[#FF3425] rounded-lg text-[#FF3425] text-sm">
                {locationError}
              </div>
            )}
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black">Country</label>
                <input
                  type="text"
                  value={locationData.country}
                  onChange={(e) => setLocationData({ ...locationData, country: e.target.value })}
                  placeholder="Enter country"
                  className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black">City</label>
                <input
                  type="text"
                  value={locationData.city}
                  onChange={(e) => setLocationData({ ...locationData, city: e.target.value })}
                  placeholder="Enter city"
                  className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black">Address</label>
                <input
                  type="text"
                  value={locationData.address}
                  onChange={(e) => setLocationData({ ...locationData, address: e.target.value })}
                  placeholder="Enter address (optional)"
                  className="px-4 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-sm text-black placeholder:text-[#BCBCBC] focus:outline-none focus:border-[#FF4000] focus:ring-[3px] focus:ring-[#FF4000]/10 transition-all"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setLocationError('');
                  setIsLocationModalOpen(false);
                }}
                className="flex-1 px-6 py-3.5 border-[1.5px] border-[#EEEEEE] rounded-lg text-base font-semibold text-black hover:bg-[#F8F8F8] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLocationSave}
                className="flex-1 px-6 py-3.5 bg-[#FF4000] text-white rounded-lg text-base font-semibold hover:bg-[#E63900] transition-colors"
              >
                Save changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
