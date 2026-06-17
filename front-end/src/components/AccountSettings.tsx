import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
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
import SuccessIcon from '../assets/Svgs/success.svg';

interface PaymentCard {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
}

const AccountSettings = () => {
  const { t } = useTranslation('attendee');
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState('personal-info');
  
  // Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [showAddCardForm, setShowAddCardForm] = useState(false);
  const [isEditPasswordOpen, setIsEditPasswordOpen] = useState(false);
  
  // Success message states
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);
  const [showEmailSuccess, setShowEmailSuccess] = useState(false);
  const [showPhoneSuccess, setShowPhoneSuccess] = useState(false);
  const [showLocationSuccess, setShowLocationSuccess] = useState(false);
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);
  
  // Validation errors
  const [profileError, setProfileError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  // Form states for Personal Info
  const [profileData, setProfileData] = useState({
    fullName: user?.name || '',
    profilePhoto: user?.avatarUrl || ProfilePhoto
  });
  
  const [emailData, setEmailData] = useState({
    currentEmail: user?.email || '',
    newEmail: '',
    password: ''
  });
  
  const [phoneData, setPhoneData] = useState({
    currentPhone: user?.phone || '',
    newPhone: '',
    password: ''
  });
  
  const [locationData, setLocationData] = useState({
    country: user?.metadata?.location?.country || '',
    city: user?.metadata?.location?.city || '',
    address: user?.metadata?.location?.address || ''
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
  const handleProfileSave = async () => {
    if (!profileData.fullName.trim()) {
      setProfileError(t('accountSettings.personalInfo.validation.fullNameRequired'));
      return;
    }
    
    try {
      setProfileError('');
      await authService.updateProfile({
        name: profileData.fullName,
        avatarUrl: profileData.profilePhoto
      });
      setShowProfileSuccess(true);
      setTimeout(() => {
        setShowProfileSuccess(false);
        setIsProfileModalOpen(false);
      }, 2000);
    } catch (err: any) {
      setProfileError(err.response?.data?.message || 'Failed to update profile');
    }
  };
  
  const handleEmailSave = async () => {
    if (!emailData.newEmail.trim()) {
      setEmailError(t('accountSettings.personalInfo.validation.newEmailRequired'));
      return;
    }
    if (!emailData.password.trim()) {
      setEmailError(t('accountSettings.personalInfo.validation.passwordRequired'));
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailData.newEmail)) {
      setEmailError(t('accountSettings.personalInfo.validation.invalidEmail'));
      return;
    }
    
    try {
      setEmailError('');
      await authService.updateEmail({
        newEmail: emailData.newEmail,
        password: emailData.password
      });
      setShowEmailSuccess(true);
      setTimeout(() => {
        setShowEmailSuccess(false);
        setEmailData({ ...emailData, currentEmail: emailData.newEmail, newEmail: '', password: '' });
        setIsEmailModalOpen(false);
      }, 2000);
    } catch (err: any) {
      setEmailError(err.response?.data?.message || 'Failed to update email');
    }
  };
  
  const handlePhoneSave = async () => {
    if (!phoneData.newPhone.trim()) {
      setPhoneError(t('accountSettings.personalInfo.validation.newPhoneRequired'));
      return;
    }
    if (!phoneData.password.trim()) {
      setPhoneError(t('accountSettings.personalInfo.validation.passwordRequired'));
      return;
    }
    
    try {
      setPhoneError('');
      await authService.updatePhone({
        newPhone: phoneData.newPhone,
        password: phoneData.password
      });
      setShowPhoneSuccess(true);
      setTimeout(() => {
        setShowPhoneSuccess(false);
        setPhoneData({ ...phoneData, currentPhone: phoneData.newPhone, newPhone: '', password: '' });
        setIsPhoneModalOpen(false);
      }, 2000);
    } catch (err: any) {
      setPhoneError(err.response?.data?.message || 'Failed to update phone');
    }
  };
  
  const handleLocationSave = async () => {
    if (!locationData.country.trim()) {
      setLocationError(t('accountSettings.personalInfo.validation.countryRequired'));
      return;
    }
    if (!locationData.city.trim()) {
      setLocationError(t('accountSettings.personalInfo.validation.cityRequired'));
      return;
    }
    
    try {
      setLocationError('');
      await authService.updateLocation({
        country: locationData.country,
        city: locationData.city,
        address: locationData.address
      });
      setShowLocationSuccess(true);
      setTimeout(() => {
        setShowLocationSuccess(false);
        setIsLocationModalOpen(false);
      }, 2000);
    } catch (err: any) {
      setLocationError(err.response?.data?.message || 'Failed to update location');
    }
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
  const handlePasswordSave = async () => {
    if (!passwordData.currentPassword.trim()) {
      setPasswordError(t('accountSettings.loginSecurity.modals.changePassword.validation.currentRequired'));
      return;
    }
    if (!passwordData.newPassword.trim()) {
      setPasswordError(t('accountSettings.loginSecurity.modals.changePassword.validation.newRequired'));
      return;
    }
    if (passwordData.newPassword.length < 8) {
      setPasswordError(t('accountSettings.loginSecurity.modals.changePassword.validation.minLength'));
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(t('accountSettings.loginSecurity.modals.changePassword.validation.match'));
      return;
    }
    
    try {
      setPasswordError('');
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setShowPasswordSuccess(true);
      setTimeout(() => {
        setShowPasswordSuccess(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setIsEditPasswordOpen(false);
      }, 2000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    }
  };

  const menuItems = [
    { id: 'personal-info', label: t('accountSettings.menu.personalInfo'), icon: PersonalInfoIcon },
    { id: 'payment-methods', label: t('accountSettings.menu.paymentMethods'), icon: PaymentIcon },
    { id: 'email-preferences', label: t('accountSettings.menu.emailPreferences'), icon: EmailIcon },
    { id: 'login-security', label: t('accountSettings.menu.loginSecurity'), icon: SecurityIcon },
  ];

  return (
    <div className="w-full">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-black mb-6">{t('accountSettings.pageTitle')}</h1>
      <p className="text-sm text-[#4F4F4F] mb-8">{t('accountSettings.pageSubtitle')}</p>

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
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all cursor-pointer ${
                      activeSection === item.id
                        ? 'bg-[#FFF4F3] text-[#FF4000]'
                        : 'text-[#4F4F4F] hover:bg-[#F8F8F8] hover:text-[#FF4000]'
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
        <div className="space-y-4">
          {/* Personal Info Section */}
          {activeSection === 'personal-info' && (
            <>
              {/* Profile Card */}
              <div className="bg-white rounded-xl border border-[#EEEEEE] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-black">{t('accountSettings.personalInfo.profile')}</h2>
                  <button 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-secondary-light rounded-lg transition-colors cursor-pointer"
                  >
                    <img src={EditIcon} alt="Edit" className="w-5 h-5" />
                    {t('accountSettings.personalInfo.edit')}
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <img
                    src={profileData.profilePhoto}
                    alt={t('accountSettings.personalInfo.modals.profilePhotoAlt')}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-base font-semibold text-black">{profileData.fullName}</h3>
                  </div>
                </div>
              </div>

              {/* Email Card */}
              <div className="bg-white rounded-xl border border-[#EEEEEE] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-black">{t('accountSettings.personalInfo.email')}</h2>
                  <button 
                    onClick={() => setIsEmailModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-secondary-light rounded-lg transition-colors cursor-pointer"
                  >
                    <img src={EditIcon} alt="Edit" className="w-5 h-5" />
                    {t('accountSettings.personalInfo.edit')}
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <p className="text-sm text-black">{emailData.currentEmail}</p>
                  <div className="flex items-center gap-1 px-2 py-1 bg-[#E8F5E9] rounded-full">
                    <img src={VerifiedIcon} alt="Verified" className="w-3 h-3" />
                    <span className="text-xs font-medium text-[#2E7D32]">{t('accountSettings.personalInfo.verified')}</span>
                  </div>
                </div>
              </div>

              {/* Phone Card */}
              <div className="bg-white rounded-xl border border-[#EEEEEE] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-black">{t('accountSettings.personalInfo.phone')}</h2>
                  <button 
                    onClick={() => setIsPhoneModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-secondary-light rounded-lg transition-colors cursor-pointer"
                  >
                    <img src={EditIcon} alt="Edit" className="w-5 h-5" />
                    {t('accountSettings.personalInfo.edit')}
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-sm text-black">{phoneData.currentPhone}</p>
                  <button className="text-sm font-medium text-[#FF4000] hover:underline hover:opacity-80 cursor-pointer">
                    {t('accountSettings.personalInfo.verifyPhone')}
                  </button>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-white rounded-xl border border-[#EEEEEE] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-black">{t('accountSettings.personalInfo.location')}</h2>
                  <button 
                    onClick={() => setIsLocationModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-secondary-light rounded-lg transition-colors cursor-pointer"
                  >
                    <img src={EditIcon} alt="Edit" className="w-5 h-5" />
                    {t('accountSettings.personalInfo.edit')}
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
                    <div className="bg-white rounded-xl border border-light-gray p-6 sm:p-12 flex flex-col items-center justify-center">
                      <div className="w-48 h-32 sm:w-64 sm:h-40 mb-6">
                        <img src={CardFirstImage} alt="Card" className="w-full h-full object-contain" />
                      </div>
                      <h2 className="text-xl font-bold text-black mb-2">{t('accountSettings.paymentMethods.empty.title')}</h2>
                      <p className="text-sm text-gray mb-6 text-center max-w-md">
                        {t('accountSettings.paymentMethods.empty.description')}
                      </p>
                      <button
                        onClick={() => setShowAddCardForm(true)}
                        className="px-6 py-2.5 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all cursor-pointer"
                        style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                      >
                        {t('accountSettings.paymentMethods.empty.addButton')}
                      </button>
                    </div>
                  ) : (
                    /* Saved Cards */
                    <div className="bg-white rounded-xl border border-light-gray p-6">
                      <h2 className="text-lg font-bold text-black mb-6">{t('accountSettings.paymentMethods.savedCards')}</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {savedCards.map((card) => (
                          <div key={card.id} className="relative bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-xl p-6 shadow-lg">
                            <div className="flex flex-col h-full justify-between">
                              <div className="flex justify-between items-start">
                                <img src={CardIcon} alt="Card" className="w-12 h-12" />
                                <button
                                  onClick={() => handleDeleteCard(card.id)}
                                  className="w-6 h-6 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors cursor-pointer"
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
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary-light rounded-lg transition-all cursor-pointer"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        {t('accountSettings.paymentMethods.addMore')}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Add Card Form - Full Page */
                <div className="bg-white rounded-xl border border-light-gray p-8">
                  <div className="flex items-center gap-3 mb-8">
                    <button
                      onClick={() => setShowAddCardForm(false)}
                      className="p-2 hover:bg-secondary-light rounded-lg transition-colors cursor-pointer"
                    >
                      <img src={GoBackIcon} alt={t('accountSettings.paymentMethods.goBackAlt')} className="w-5 h-5" />
                    </button>
                    <div>
                      <h2 className="text-2xl font-bold text-black">{t('accountSettings.paymentMethods.addPaymentTitle')}</h2>
                      <p className="text-sm text-gray">{t('accountSettings.paymentMethods.addPaymentSubtitle')}</p>
                    </div>
                  </div>
                  <div className="max-w-2xl">
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-black">{t('accountSettings.paymentMethods.cardNumber')}</label>
                        <input
                          type="text"
                          value={formatCardNumber(newCard.cardNumber)}
                          onChange={handleCardNumberChange}
                          placeholder={t('accountSettings.paymentMethods.cardNumberPlaceholder')}
                          className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-black">{t('accountSettings.paymentMethods.expireMonth')}</label>
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
                            className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-black">{t('accountSettings.paymentMethods.expireYear')}</label>
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
                            className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-sm font-medium text-black">{t('accountSettings.paymentMethods.cvv')}</label>
                          <input
                            type="text"
                            value={newCard.cvv}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value.length <= 3 && /^\d*$/.test(value)) {
                                setNewCard({ ...newCard, cvv: value });
                              }
                            }}
                            placeholder={t('accountSettings.paymentMethods.cvvPlaceholder')}
                            className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-8">
                      <button
                        onClick={handleAddCard}
                        className="px-6 py-2.5 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all cursor-pointer"
                        style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                      >
                        {t('accountSettings.paymentMethods.saveCard')}
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
                <h2 className="text-2xl font-bold text-black mb-2">{t('accountSettings.emailPreferences.title')}</h2>
                <p className="text-sm text-[#4F4F4F]">{t('accountSettings.emailPreferences.subtitle')}</p>
              </div>
              
              {/* Attendees Preferences */}
              <div className="space-y-6">
                  <div className="flex items-start justify-between py-4 border-b border-[#EEEEEE]">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-black mb-1">{t('accountSettings.emailPreferences.options.ticketConfirmations.title')}</h3>
                      <p className="text-sm text-[#4F4F4F]">{t('accountSettings.emailPreferences.options.ticketConfirmations.description')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ms-4">
                      <input
                        type="checkbox"
                        checked={attendeePrefs.ticketConfirmations}
                        onChange={(e) => setAttendeePrefs({ ...attendeePrefs, ticketConfirmations: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#BCBCBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4000] hover:shadow-md hover:ring-2 hover:ring-[#FF4000]/20"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-start justify-between py-4 border-b border-[#EEEEEE]">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-black mb-1">{t('accountSettings.emailPreferences.options.eventReminders.title')}</h3>
                      <p className="text-sm text-[#4F4F4F]">{t('accountSettings.emailPreferences.options.eventReminders.description')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ms-4">
                      <input
                        type="checkbox"
                        checked={attendeePrefs.eventReminders}
                        onChange={(e) => setAttendeePrefs({ ...attendeePrefs, eventReminders: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#BCBCBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4000] hover:shadow-md hover:ring-2 hover:ring-[#FF4000]/20"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-start justify-between py-4 border-b border-[#EEEEEE]">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-black mb-1">{t('accountSettings.emailPreferences.options.eventUpdates.title')}</h3>
                      <p className="text-sm text-[#4F4F4F]">{t('accountSettings.emailPreferences.options.eventUpdates.description')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ms-4">
                      <input
                        type="checkbox"
                        checked={attendeePrefs.eventUpdates}
                        onChange={(e) => setAttendeePrefs({ ...attendeePrefs, eventUpdates: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#BCBCBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4000] hover:shadow-md hover:ring-2 hover:ring-[#FF4000]/20"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-start justify-between py-4 border-b border-[#EEEEEE]">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-black mb-1">{t('accountSettings.emailPreferences.options.newEvents.title')}</h3>
                      <p className="text-sm text-[#4F4F4F]">{t('accountSettings.emailPreferences.options.newEvents.description')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ms-4">
                      <input
                        type="checkbox"
                        checked={attendeePrefs.newEvents}
                        onChange={(e) => setAttendeePrefs({ ...attendeePrefs, newEvents: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#BCBCBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4000] hover:shadow-md hover:ring-2 hover:ring-[#FF4000]/20"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-start justify-between py-4 border-b border-[#EEEEEE]">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-black mb-1">{t('accountSettings.emailPreferences.options.specialOffers.title')}</h3>
                      <p className="text-sm text-[#4F4F4F]">{t('accountSettings.emailPreferences.options.specialOffers.description')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ms-4">
                      <input
                        type="checkbox"
                        checked={attendeePrefs.specialOffers}
                        onChange={(e) => setAttendeePrefs({ ...attendeePrefs, specialOffers: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#BCBCBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4000] hover:shadow-md hover:ring-2 hover:ring-[#FF4000]/20"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-start justify-between py-4 border-b border-[#EEEEEE]">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-black mb-1">{t('accountSettings.emailPreferences.options.newsletters.title')}</h3>
                      <p className="text-sm text-[#4F4F4F]">{t('accountSettings.emailPreferences.options.newsletters.description')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ms-4">
                      <input
                        type="checkbox"
                        checked={attendeePrefs.newsletters}
                        onChange={(e) => setAttendeePrefs({ ...attendeePrefs, newsletters: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#BCBCBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4000] hover:shadow-md hover:ring-2 hover:ring-[#FF4000]/20"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-start justify-between py-4">
                    <div className="flex-1">
                      <h3 className="text-base font-semibold text-black mb-1">{t('accountSettings.emailPreferences.options.surveys.title')}</h3>
                      <p className="text-sm text-[#4F4F4F]">{t('accountSettings.emailPreferences.options.surveys.description')}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer ms-4">
                      <input
                        type="checkbox"
                        checked={attendeePrefs.surveys}
                        onChange={(e) => setAttendeePrefs({ ...attendeePrefs, surveys: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#BCBCBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4000] hover:shadow-md hover:ring-2 hover:ring-[#FF4000]/20"></div>
                    </label>
                  </div>
                </div>
            </div>
          )}

          {/* Login & Security Section */}
          {activeSection === 'login-security' && (
            <div className="bg-white rounded-xl border border-[#EEEEEE] p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-black mb-2">{t('accountSettings.loginSecurity.title')}</h2>
                <p className="text-sm text-[#4F4F4F]">{t('accountSettings.loginSecurity.subtitle')}</p>
              </div>
              
              {/* Password Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-black">{t('accountSettings.loginSecurity.password')}</h3>
                  <button
                    onClick={() => setIsEditPasswordOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-secondary-light rounded-lg transition-colors cursor-pointer"
                  >
                    <img src={EditIcon} alt="Edit" className="w-5 h-5" />
                    {t('accountSettings.loginSecurity.changePassword')}
                  </button>
                </div>
                <p className="text-sm text-black">••••••••</p>
              </div>
              
              {/* Two-factor Authentication Section */}
              <div className="pt-6 border-t border-[#EEEEEE]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-black mb-1">{t('accountSettings.loginSecurity.twoFactor.title')}</h3>
                    <p className="text-sm text-[#4F4F4F]">{t('accountSettings.loginSecurity.twoFactor.description')}</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ms-6 shrink-0">
                    <input
                      type="checkbox"
                      checked={twoFactorEnabled}
                      onChange={(e) => setTwoFactorEnabled(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#BCBCBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4000] hover:shadow-md hover:ring-2 hover:ring-[#FF4000]/20"></div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Profile Edit Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-2xl shadow-2xl p-5 sm:p-8 w-full transition-all ${showProfileSuccess ? 'max-w-md' : 'max-w-lg'}`}>
            {!showProfileSuccess && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-black">{t('accountSettings.personalInfo.modals.editProfile')}</h2>
                  <button
                    type="button"
                    onClick={() => { setProfileError(''); setIsProfileModalOpen(false); }}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors shrink-0"
                    aria-label={t('accountSettings.personalInfo.modals.cancel')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </button>
                </div>
                {profileError && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-[#FF3425] rounded-lg text-[#FF3425] text-sm">
                    {profileError}
                  </div>
                )}
              </>
            )}
            {!showProfileSuccess && (
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-black">{t('accountSettings.personalInfo.modals.fullName')}</label>
                  <input
                    type="text"
                    value={profileData.fullName}
                    onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                    placeholder={t('accountSettings.personalInfo.modals.fullNamePlaceholder')}
                    className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-black">{t('accountSettings.personalInfo.modals.profilePhoto')}</label>
                  <div className="flex items-center gap-4">
                    <img src={profileData.profilePhoto} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-light-gray" />
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setProfileData({ ...profileData, profilePhoto: reader.result as string });
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        className="hidden"
                        id="profile-photo-upload"
                      />
                      <label
                        htmlFor="profile-photo-upload"
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 border-2 border-dashed border-primary rounded-lg text-sm font-medium text-primary hover:bg-primary-light/30 transition-colors cursor-pointer"
                      >
                        <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <span>{t('accountSettings.personalInfo.modals.uploadHint')}</span>
                      </label>
                      <p className="text-xs text-gray mt-1.5">{t('accountSettings.personalInfo.modals.uploadFormats')}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {!showProfileSuccess ? (
              <div className="flex justify-end gap-3 flex-wrap mt-6">
                <button
                  onClick={() => {
                    setProfileError('');
                    setIsProfileModalOpen(false);
                  }}
                  className="px-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap cursor-pointer"
                >
                  {t('accountSettings.personalInfo.modals.cancel')}
                </button>
                <button
                  onClick={handleProfileSave}
                  className="px-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all whitespace-nowrap cursor-pointer"
                  style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                >
                  {t('accountSettings.personalInfo.modals.saveChanges')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <img src={SuccessIcon} alt="Success" className="w-16 h-16 mb-4" style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }} />
                <p className="text-lg font-semibold text-black">{t('accountSettings.personalInfo.modals.success')}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Email Edit Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-2xl shadow-2xl p-5 sm:p-8 w-full transition-all ${showEmailSuccess ? 'max-w-md' : 'max-w-lg'}`}>
            {!showEmailSuccess && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-black">{t('accountSettings.personalInfo.modals.editEmail')}</h2>
                  <button
                    type="button"
                    onClick={() => { setEmailError(''); setIsEmailModalOpen(false); }}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors shrink-0"
                    aria-label={t('accountSettings.personalInfo.modals.cancel')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </button>
                </div>
                {emailError && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-[#FF3425] rounded-lg text-[#FF3425] text-sm">
                    {emailError}
                  </div>
                )}
              </>
            )}
            {!showEmailSuccess && (
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-black">{t('accountSettings.personalInfo.modals.currentEmail')}</label>
                  <input
                    type="email"
                    value={emailData.currentEmail}
                    disabled
                    className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-gray bg-secondary-light"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-black">{t('accountSettings.personalInfo.modals.newEmail')}</label>
                  <input
                    type="email"
                    value={emailData.newEmail}
                    onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                    placeholder={t('accountSettings.personalInfo.modals.newEmailPlaceholder')}
                    className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-black">{t('accountSettings.personalInfo.modals.password')}</label>
                  <input
                    type="password"
                    value={emailData.password}
                    onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                    placeholder={t('accountSettings.personalInfo.modals.passwordPlaceholder')}
                    className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            )}
            {!showEmailSuccess ? (
              <div className="flex justify-end gap-3 flex-wrap mt-6">
                <button
                  onClick={() => {
                    setEmailError('');
                    setIsEmailModalOpen(false);
                  }}
                  className="px-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap cursor-pointer"
                >
                  {t('accountSettings.personalInfo.modals.cancel')}
                </button>
                <button
                  onClick={handleEmailSave}
                  className="px-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all whitespace-nowrap cursor-pointer"
                  style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                >
                  {t('accountSettings.personalInfo.modals.saveChanges')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <img src={SuccessIcon} alt="Success" className="w-16 h-16 mb-4" style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }} />
                <p className="text-lg font-semibold text-black">{t('accountSettings.personalInfo.modals.success')}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Phone Edit Modal */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-2xl shadow-2xl p-5 sm:p-8 w-full transition-all ${showPhoneSuccess ? 'max-w-md' : 'max-w-lg'}`}>
            {!showPhoneSuccess && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-black">{t('accountSettings.personalInfo.modals.editPhone')}</h2>
                  <button
                    type="button"
                    onClick={() => { setPhoneError(''); setIsPhoneModalOpen(false); }}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors shrink-0"
                    aria-label={t('accountSettings.personalInfo.modals.cancel')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </button>
                </div>
                {phoneError && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-[#FF3425] rounded-lg text-[#FF3425] text-sm">
                    {phoneError}
                  </div>
                )}
              </>
            )}
            {!showPhoneSuccess && (
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-black">{t('accountSettings.personalInfo.modals.currentPhone')}</label>
                  <input
                    type="text"
                    value={phoneData.currentPhone}
                    disabled
                    className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-gray bg-secondary-light"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-black">{t('accountSettings.personalInfo.modals.newPhone')}</label>
                  <input
                    type="tel"
                    value={phoneData.newPhone}
                    onChange={(e) => setPhoneData({ ...phoneData, newPhone: e.target.value })}
                    placeholder={t('accountSettings.personalInfo.modals.newPhonePlaceholder')}
                    className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-black">{t('accountSettings.personalInfo.modals.password')}</label>
                  <input
                    type="password"
                    value={phoneData.password}
                    onChange={(e) => setPhoneData({ ...phoneData, password: e.target.value })}
                    placeholder={t('accountSettings.personalInfo.modals.passwordPlaceholder')}
                    className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            )}
            {!showPhoneSuccess ? (
              <div className="flex justify-end gap-3 flex-wrap mt-6">
                <button
                  onClick={() => {
                    setPhoneError('');
                    setIsPhoneModalOpen(false);
                  }}
                  className="px-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap cursor-pointer"
                >
                  {t('accountSettings.personalInfo.modals.cancel')}
                </button>
                <button
                  onClick={handlePhoneSave}
                  className="px-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all whitespace-nowrap cursor-pointer"
                  style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                >
                  {t('accountSettings.personalInfo.modals.saveChanges')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <img src={SuccessIcon} alt="Success" className="w-16 h-16 mb-4" style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }} />
                <p className="text-lg font-semibold text-black">{t('accountSettings.personalInfo.modals.success')}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Location Edit Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-2xl shadow-2xl p-5 sm:p-8 w-full transition-all ${showLocationSuccess ? 'max-w-md' : 'max-w-lg'}`}>
            {!showLocationSuccess && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-black">{t('accountSettings.personalInfo.modals.editLocation')}</h2>
                  <button
                    type="button"
                    onClick={() => { setLocationError(''); setIsLocationModalOpen(false); }}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors shrink-0"
                    aria-label={t('accountSettings.personalInfo.modals.cancel')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </button>
                </div>
                {locationError && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-[#FF3425] rounded-lg text-[#FF3425] text-sm">
                    {locationError}
                  </div>
                )}
              </>
            )}
            {!showLocationSuccess && (
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-black">{t('accountSettings.personalInfo.modals.country')}</label>
                  <input
                    type="text"
                    value={locationData.country}
                    onChange={(e) => setLocationData({ ...locationData, country: e.target.value })}
                    placeholder={t('accountSettings.personalInfo.modals.countryPlaceholder')}
                    className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-black">{t('accountSettings.personalInfo.modals.city')}</label>
                  <input
                    type="text"
                    value={locationData.city}
                    onChange={(e) => setLocationData({ ...locationData, city: e.target.value })}
                    placeholder={t('accountSettings.personalInfo.modals.cityPlaceholder')}
                    className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-black">{t('accountSettings.personalInfo.modals.address')}</label>
                  <input
                    type="text"
                    value={locationData.address}
                    onChange={(e) => setLocationData({ ...locationData, address: e.target.value })}
                    placeholder={t('accountSettings.personalInfo.modals.addressPlaceholder')}
                    className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            )}
            {!showLocationSuccess ? (
              <div className="flex justify-end gap-3 flex-wrap mt-6">
                <button
                  onClick={() => {
                    setLocationError('');
                    setIsLocationModalOpen(false);
                  }}
                  className="px-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap cursor-pointer"
                >
                  {t('accountSettings.personalInfo.modals.cancel')}
                </button>
                <button
                  onClick={handleLocationSave}
                  className="px-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all whitespace-nowrap cursor-pointer"
                  style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                >
                  {t('accountSettings.personalInfo.modals.saveChanges')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <img src={SuccessIcon} alt="Success" className="w-16 h-16 mb-4" style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }} />
                <p className="text-lg font-semibold text-black">{t('accountSettings.personalInfo.modals.success')}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Password Edit Modal */}
      {isEditPasswordOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-2xl shadow-2xl p-5 sm:p-8 w-full transition-all ${showPasswordSuccess ? 'max-w-md' : 'max-w-lg'}`}>
            {!showPasswordSuccess && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-black">{t('accountSettings.loginSecurity.modals.changePassword.title')}</h2>
                  <button
                    type="button"
                    onClick={() => { setPasswordError(''); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); setIsEditPasswordOpen(false); }}
                    className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors shrink-0"
                    aria-label={t('accountSettings.loginSecurity.modals.changePassword.cancel')}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round">
                      <line x1="6" y1="6" x2="18" y2="18" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                    </svg>
                  </button>
                </div>
                {passwordError && (
                  <div className="mb-4 px-4 py-3 bg-red-50 border border-[#FF3425] rounded-lg text-[#FF3425] text-sm">
                    {passwordError}
                  </div>
                )}
              </>
            )}
            {!showPasswordSuccess && (
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-black">{t('accountSettings.loginSecurity.modals.changePassword.currentPassword')}</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder={t('accountSettings.loginSecurity.modals.changePassword.currentPasswordPlaceholder')}
                    className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-black">{t('accountSettings.loginSecurity.modals.changePassword.newPassword')}</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder={t('accountSettings.loginSecurity.modals.changePassword.newPasswordPlaceholder')}
                    className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-black">{t('accountSettings.loginSecurity.modals.changePassword.confirmPassword')}</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder={t('accountSettings.loginSecurity.modals.changePassword.confirmPasswordPlaceholder')}
                    className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            )}
            {!showPasswordSuccess ? (
              <div className="flex justify-end gap-3 flex-wrap mt-6">
                <button
                  onClick={() => {
                    setPasswordError('');
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setIsEditPasswordOpen(false);
                  }}
                  className="px-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap cursor-pointer"
                >
                  {t('accountSettings.loginSecurity.modals.changePassword.cancel')}
                </button>
                <button
                  onClick={handlePasswordSave}
                  className="px-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all whitespace-nowrap cursor-pointer"
                  style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                >
                  {t('accountSettings.loginSecurity.modals.changePassword.saveChanges')}
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <img src={SuccessIcon} alt="Success" className="w-16 h-16 mb-4" style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }} />
                <p className="text-lg font-semibold text-black">{t('accountSettings.loginSecurity.modals.changePassword.success')}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettings;
