import { useState, useEffect, useRef } from 'react';
import PersonalInfoIcon from '../../assets/Svgs/organiser/dashboard/Account settings/personalInfo.svg';
import OrganizationIcon from '../../assets/Svgs/organiser/dashboard/Account settings/organization.svg';
import TeamRolesIcon from '../../assets/Svgs/organiser/dashboard/Account settings/teamRoles.svg';
import PaymentIcon from '../../assets/Svgs/payment.svg';
import EmailIcon from '../../assets/Svgs/email.svg';
import SecurityIcon from '../../assets/Svgs/security.svg';
import EditIcon from '../../assets/Svgs/edit.svg';
import VerifiedIcon from '../../assets/Svgs/verified.svg';
import ProfilePhoto from '../../assets/imges/photoProfil.jpg';
import UploadIcon from '../../assets/Svgs/uploadImage.svg';
import SearchIcon from '../../assets/Svgs/recherche.svg';
import CreateEventIcon from '../../assets/Svgs/organiser/dashboard/Events/createEvent.svg';
import ValidIcon from '../../assets/Svgs/organiser/dashboard/Account settings/valide.svg';
import GoIcon from '../../assets/Svgs/organiser/dashboard/Account settings/go.svg';
import SuccessIcon from '../../assets/Svgs/success.svg';
import ErrorIcon from '../../assets/Svgs/error.svg';
import TeamPhoto1 from '../../assets/imges/photoPorifle/Mask group.png';
import TeamPhoto2 from '../../assets/imges/photoPorifle/Mask group (1).png';
import TeamPhoto3 from '../../assets/imges/photoPorifle/Mask group (2).png';
import BankAccountSettings from './BankAccountSettings';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'pending';
  lastActive: string;
  avatar?: string;
}

interface Role {
  id: string;
  name: string;
  permissions: string;
}

const AccountSettingsOrganizer = () => {
  const [activeSection, setActiveSection] = useState('personal-info');
  
  // Modal states
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isEditPasswordOpen, setIsEditPasswordOpen] = useState(false);
  const [isEditEmailSecurityOpen, setIsEditEmailSecurityOpen] = useState(false);
  const [isEdit2FAOpen, setIsEdit2FAOpen] = useState(false);
  
  // Success message states
  const [showProfileSuccess, setShowProfileSuccess] = useState(false);
  const [showEmailSuccess, setShowEmailSuccess] = useState(false);
  const [showPhoneSuccess, setShowPhoneSuccess] = useState(false);
  const [showLocationSuccess, setShowLocationSuccess] = useState(false);
  const [showPasswordSuccess, setShowPasswordSuccess] = useState(false);
  const [showEmailSecuritySuccess, setShowEmailSecuritySuccess] = useState(false);
  const [show2FASuccess, setShow2FASuccess] = useState(false);
  
  // Delete confirmation states
  const [isDeleteRoleConfirmOpen, setIsDeleteRoleConfirmOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  const [showDeleteRoleSuccess, setShowDeleteRoleSuccess] = useState(false);
  const [isRemoveMemberConfirmOpen, setIsRemoveMemberConfirmOpen] = useState(false);
  const [memberToRemove, setMemberToRemove] = useState<TeamMember | null>(null);
  const [showRemoveMemberSuccess, setShowRemoveMemberSuccess] = useState(false);
  
  // Team member details states
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [showResendSuccess, setShowResendSuccess] = useState(false);
  const [showResendError, setShowResendError] = useState(false);
  
  // Change role states
  const [isChangeRoleOpen, setIsChangeRoleOpen] = useState(false);
  const [changeRoleData, setChangeRoleData] = useState({ currentRole: '', newRole: '' });
  const [showChangeRoleSuccess, setShowChangeRoleSuccess] = useState(false);
  const [showChangeRoleError, setShowChangeRoleError] = useState(false);
  const [isNewRoleDropdownOpen, setIsNewRoleDropdownOpen] = useState(false);
  const newRoleDropdownRef = useRef<HTMLDivElement>(null);
  
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
  
  // Email Preferences states
  const [emailPrefs, setEmailPrefs] = useState({
    eventUpdates: true,
    ticketSales: true,
    attendeeMessages: true,
    payoutNotifications: true,
    platformUpdates: true,
    marketingTips: false,
    newsletters: false
  });
  
  // Login & Security states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  
  // About Organization states
  const [organizationData, setOrganizationData] = useState({
    name: 'Pulsewave Entertainment',
    logo: null as File | null,
    logoPreview: '',
    organizationType: '',
    address: '',
    email: '',
    phone: '',
    description: '',
    socialMedia: {
      facebook: 'facebook.com/yourpage',
      instagram: '@yourusername',
      linkedin: 'linkedin.com/company/yourname',
      youtube: 'youtube.com/@yourchannel'
    }
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Team & Roles states
  const [activeTeamTab, setActiveTeamTab] = useState<'team' | 'roles'>('team');
  const [teamSearchQuery, setTeamSearchQuery] = useState('');
  const [rolesSearchQuery, setRolesSearchQuery] = useState('');
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);
  const [isCreatingRole, setIsCreatingRole] = useState(false);
  const [isDuplicateRoleWarning, setIsDuplicateRoleWarning] = useState(false);
  const [roleMode, setRoleMode] = useState<'create' | 'edit' | 'duplicate'>('create');
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const roleTitleInputRef = useRef<HTMLInputElement>(null);
  
  // Create Role form state
  const [roleFormData, setRoleFormData] = useState({
    roleName: '',
    permissions: {
      events: {
        deleteEvents: false,
        createAndEditEvents: false,
        viewEvents: false
      },
      ticketsAndPricing: {
        viewTickets: false,
        editTicketTypesAndPricing: false,
        managePromoCodes: false
      },
      ordersAndAttendees: {
        viewAttendees: false,
        exportAttendeeData: false,
        checkInAttendees: false,
        editAttendeeInfo: false
      },
      reportsAndAnalytics: {
        viewAnalyticsDashboard: false,
        downloadReports: false
      },
      emailAndNotifications: {
        viewScheduledMessages: false,
        editEmailTemplates: false,
        sendEventReminders: false
      },
      settings: {
        viewSettings: false,
        manageTeamAccess: false
      }
    }
  });
  
  // Organization Type dropdown state
  const [isOrgTypeDropdownOpen, setIsOrgTypeDropdownOpen] = useState(false);
  const orgTypeRef = useRef<HTMLDivElement>(null);
  
  // Invite Team Member states
  const [isInviteTeamMemberPage, setIsInviteTeamMemberPage] = useState(false);
  const [inviteTeamMemberData, setInviteTeamMemberData] = useState({
    email: '',
    invitationCode: '',
    assignedRole: ''
  });
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef<HTMLDivElement>(null);
  const [inviteError, setInviteError] = useState('');
  const [showInviteConfirmation, setShowInviteConfirmation] = useState(false);
  
  // Auto-focus on role title input when in duplicate mode
  useEffect(() => {
    if (isCreatingRole && roleMode === 'duplicate' && roleTitleInputRef.current) {
      roleTitleInputRef.current.focus();
    }
  }, [isCreatingRole, roleMode]);

  // Handle role form submission
  const handleCreateRole = () => {
    // Check for duplicate role name (case-insensitive) - skip check if editing the same role
    const isDuplicate = mockRoles.some(
      role => role.id !== editingRoleId && role.name.toLowerCase() === roleFormData.roleName.trim().toLowerCase()
    );
    
    if (isDuplicate) {
      setIsDuplicateRoleWarning(true);
      return;
    }
    
    if (roleMode === 'edit') {
      console.log('Updating role:', editingRoleId, roleFormData);
    } else {
      console.log('Creating role:', roleFormData);
    }
    
    setIsCreatingRole(false);
    setRoleMode('create');
    setEditingRoleId(null);
    // Reset form
    setRoleFormData({
      roleName: '',
      permissions: {
        events: { deleteEvents: false, createAndEditEvents: false, viewEvents: false },
        ticketsAndPricing: { viewTickets: false, editTicketTypesAndPricing: false, managePromoCodes: false },
        ordersAndAttendees: { viewAttendees: false, exportAttendeeData: false, checkInAttendees: false, editAttendeeInfo: false },
        reportsAndAnalytics: { viewAnalyticsDashboard: false, downloadReports: false },
        emailAndNotifications: { viewScheduledMessages: false, editEmailTemplates: false, sendEventReminders: false },
        settings: { viewSettings: false, manageTeamAccess: false }
      }
    });
  };

  // Handle edit role action
  const handleEditRole = (roleId: string) => {
    const role = mockRoles.find(r => r.id === roleId);
    if (!role) return;

    setRoleMode('edit');
    setEditingRoleId(roleId);
    setRoleFormData({
      roleName: role.name,
      permissions: {
        events: { deleteEvents: true, createAndEditEvents: true, viewEvents: true },
        ticketsAndPricing: { viewTickets: true, editTicketTypesAndPricing: true, managePromoCodes: true },
        ordersAndAttendees: { viewAttendees: true, exportAttendeeData: true, checkInAttendees: true, editAttendeeInfo: true },
        reportsAndAnalytics: { viewAnalyticsDashboard: true, downloadReports: true },
        emailAndNotifications: { viewScheduledMessages: true, editEmailTemplates: true, sendEventReminders: true },
        settings: { viewSettings: true, manageTeamAccess: true }
      }
    });
    setIsCreatingRole(true);
    setOpenActionMenu(null);
  };

  // Handle duplicate role action
  const handleDuplicateRole = (roleId: string) => {
    const role = mockRoles.find(r => r.id === roleId);
    if (!role) return;

    setRoleMode('duplicate');
    setEditingRoleId(null);
    setRoleFormData({
      roleName: '',
      permissions: {
        events: { deleteEvents: true, createAndEditEvents: true, viewEvents: true },
        ticketsAndPricing: { viewTickets: true, editTicketTypesAndPricing: true, managePromoCodes: true },
        ordersAndAttendees: { viewAttendees: true, exportAttendeeData: true, checkInAttendees: true, editAttendeeInfo: true },
        reportsAndAnalytics: { viewAnalyticsDashboard: true, downloadReports: true },
        emailAndNotifications: { viewScheduledMessages: true, editEmailTemplates: true, sendEventReminders: true },
        settings: { viewSettings: true, manageTeamAccess: true }
      }
    });
    setIsCreatingRole(true);
    setOpenActionMenu(null);
  };
  
  const handleCancelCreateRole = () => {
    setIsCreatingRole(false);
    setRoleMode('create');
    setEditingRoleId(null);
    // Reset form
    setRoleFormData({
      roleName: '',
      permissions: {
        events: { deleteEvents: false, createAndEditEvents: false, viewEvents: false },
        ticketsAndPricing: { viewTickets: false, editTicketTypesAndPricing: false, managePromoCodes: false },
        ordersAndAttendees: { viewAttendees: false, exportAttendeeData: false, checkInAttendees: false, editAttendeeInfo: false },
        reportsAndAnalytics: { viewAnalyticsDashboard: false, downloadReports: false },
        emailAndNotifications: { viewScheduledMessages: false, editEmailTemplates: false, sendEventReminders: false },
        settings: { viewSettings: false, manageTeamAccess: false }
      }
    });
  };
  
  // Mock team members data
  const mockTeamMembers: TeamMember[] = [
    { id: '1', name: 'Lina Bensalem', email: 'Lina@company.dz', role: 'Admin', status: 'active', lastActive: '', avatar: TeamPhoto1 },
    { id: '2', name: 'Charlotte Anderson Charlotte Anderson', email: 'Charlotte@ormeet.dz', role: 'Finance Manager', status: 'active', lastActive: '', avatar: TeamPhoto2 },
    { id: '3', name: 'John Lee', email: 'John@Company.Com', role: 'Ticketing Officer', status: 'pending', lastActive: '', avatar: TeamPhoto3 },
  ];
  
  const filteredTeamMembers = mockTeamMembers.filter(member =>
    member.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(teamSearchQuery.toLowerCase())
  );
  
  // Mock roles data
  const mockRoles: Role[] = [
    { id: '1', name: 'Admin', permissions: 'All Permissions' },
    { id: '2', name: 'Finance Manager', permissions: '20 Permissions' },
    { id: '3', name: 'Ticketing Officer', permissions: '10 Permissions' },
  ];
  
  const filteredRoles = mockRoles.filter(role =>
    role.name.toLowerCase().includes(rolesSearchQuery.toLowerCase()) ||
    role.permissions.toLowerCase().includes(rolesSearchQuery.toLowerCase())
  );
  
  // Helper functions for team members
  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase();
  const getAvatarColor = (id: string) => {
    const colors = ['#FF4000', '#34A853', '#4285F4', '#FBBC04', '#EA4335'];
    return colors[parseInt(id) % colors.length];
  };
  
  // Click outside handler for action menu, org type dropdown, and role dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(event.target as Node)) {
        setOpenActionMenu(null);
      }
      if (orgTypeRef.current && !orgTypeRef.current.contains(event.target as Node)) {
        setIsOrgTypeDropdownOpen(false);
      }
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target as Node)) {
        setIsRoleDropdownOpen(false);
      }
      if (newRoleDropdownRef.current && !newRoleDropdownRef.current.contains(event.target as Node)) {
        setIsNewRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Handlers for Personal Info
  const handleProfileSave = () => {
    if (!profileData.fullName.trim()) {
      setProfileError('Full name is required');
      return;
    }
    setProfileError('');
    setShowProfileSuccess(true);
    setTimeout(() => {
      setShowProfileSuccess(false);
      setIsProfileModalOpen(false);
    }, 2000);
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
    setShowEmailSuccess(true);
    setTimeout(() => {
      setShowEmailSuccess(false);
      setEmailData({ ...emailData, currentEmail: emailData.newEmail, newEmail: '', password: '' });
      setIsEmailModalOpen(false);
    }, 2000);
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
    setShowPhoneSuccess(true);
    setTimeout(() => {
      setShowPhoneSuccess(false);
      setPhoneData({ ...phoneData, currentPhone: phoneData.newPhone, newPhone: '', password: '' });
      setIsPhoneModalOpen(false);
    }, 2000);
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
    setShowLocationSuccess(true);
    setTimeout(() => {
      setShowLocationSuccess(false);
      setIsLocationModalOpen(false);
    }, 2000);
  };
  
  // Handlers for About Organization
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setOrganizationData(prev => ({
          ...prev,
          logo: file,
          logoPreview: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleOrganizationChange = (field: string, value: string) => {
    if (field.startsWith('socialMedia.')) {
      const socialField = field.split('.')[1];
      setOrganizationData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialField]: value
        }
      }));
    } else {
      setOrganizationData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleOrganizationTypeSelect = (type: string) => {
    setOrganizationData(prev => ({
      ...prev,
      organizationType: type
    }));
    setIsOrgTypeDropdownOpen(false);
  };

  const handleOrganizationSave = () => {
    console.log('Saving organization data:', organizationData);
  };
  
  const organizationTypes = ['Company', 'Association', 'Agency', 'Individual', 'Other'];
  
  // Handlers for Invite Team Member
  const handleRoleSelect = (roleName: string) => {
    setInviteTeamMemberData(prev => ({
      ...prev,
      assignedRole: roleName
    }));
    setIsRoleDropdownOpen(false);
  };

  const handleSendInvite = () => {
    if (!inviteTeamMemberData.email.trim()) {
      setInviteError('Email address is required');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteTeamMemberData.email)) {
      setInviteError('Please enter a valid email address');
      return;
    }
    if (!inviteTeamMemberData.assignedRole) {
      setInviteError('Please assign a role');
      return;
    }
    setInviteError('');
    console.log('Sending invite:', inviteTeamMemberData);
    setShowInviteConfirmation(true);
  };

  const handleCancelInvite = () => {
    setInviteError('');
    setIsInviteTeamMemberPage(false);
    setInviteTeamMemberData({ email: '', invitationCode: '', assignedRole: '' });
  };

  const handleBackToTeamMembers = () => {
    setShowInviteConfirmation(false);
    setIsInviteTeamMemberPage(false);
    setInviteTeamMemberData({ email: '', invitationCode: '', assignedRole: '' });
  };
  
  // Handlers for Change Role
  const handleOpenChangeRole = () => {
    if (selectedMember) {
      setChangeRoleData({
        currentRole: selectedMember.role,
        newRole: ''
      });
      setIsChangeRoleOpen(true);
      setSelectedMember(null);
    }
  };

  const handleNewRoleSelect = (roleName: string) => {
    setChangeRoleData(prev => ({
      ...prev,
      newRole: roleName
    }));
    setIsNewRoleDropdownOpen(false);
  };

  const handleCancelChangeRole = () => {
    const memberToRestore = mockTeamMembers.find(m => m.role === changeRoleData.currentRole);
    setIsChangeRoleOpen(false);
    setChangeRoleData({ currentRole: '', newRole: '' });
    if (memberToRestore) {
      setSelectedMember(memberToRestore);
    }
  };

  const handleConfirmChangeRole = () => {
    if (!changeRoleData.newRole) {
      return;
    }

    console.log('Changing role:', changeRoleData);

    if (Math.random() > 0.5) {
      setShowChangeRoleSuccess(true);
      setTimeout(() => {
        setShowChangeRoleSuccess(false);
        setIsChangeRoleOpen(false);
        setChangeRoleData({ currentRole: '', newRole: '' });
        setActiveTeamTab('team');
      }, 3000);
    } else {
      setShowChangeRoleError(true);
      setTimeout(() => {
        setShowChangeRoleError(false);
        setIsChangeRoleOpen(false);
        setChangeRoleData({ currentRole: '', newRole: '' });
        setActiveTeamTab('team');
      }, 3000);
    }
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
    setShowPasswordSuccess(true);
    setTimeout(() => {
      setShowPasswordSuccess(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsEditPasswordOpen(false);
    }, 2000);
  };

  const menuItems = [
    { id: 'personal-info', label: 'Personal Info', icon: PersonalInfoIcon },
    { id: 'about-organization', label: 'About Organization', icon: OrganizationIcon },
    { id: 'team-roles', label: 'Team & Roles', icon: TeamRolesIcon },
    { id: 'payment-payout', label: 'Payment & Payout', icon: PaymentIcon },
    { id: 'email-preferences', label: 'Email preferences', icon: EmailIcon },
    { id: 'login-security', label: 'Login & security', icon: SecurityIcon },
  ];

  return (
    <div className="w-full">
      {/* Page Title */}
      <h1 className="text-2xl font-bold text-black mb-6">Account Settings</h1>
      <p className="text-sm text-[#4F4F4F] mb-8">Manage your account preferences and organization settings.</p>

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
        <div className="space-y-4">
          {/* Personal Info Section */}
          {activeSection === 'personal-info' && (
            <>
              {/* Profile Card */}
              <div className="bg-white rounded-xl border border-[#EEEEEE] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-black">Profile</h2>
                  <button 
                    onClick={() => setIsProfileModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-secondary-light rounded-lg transition-colors cursor-pointer"
                  >
                    <img src={EditIcon} alt="Edit" className="w-5 h-5" />
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
              <div className="bg-white rounded-xl border border-[#EEEEEE] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-black">Email</h2>
                  <button 
                    onClick={() => setIsEmailModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-secondary-light rounded-lg transition-colors cursor-pointer"
                  >
                    <img src={EditIcon} alt="Edit" className="w-5 h-5" />
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
              <div className="bg-white rounded-xl border border-[#EEEEEE] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-black">Phone</h2>
                  <button 
                    onClick={() => setIsPhoneModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-secondary-light rounded-lg transition-colors cursor-pointer"
                  >
                    <img src={EditIcon} alt="Edit" className="w-5 h-5" />
                    Edit
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-sm text-black">{phoneData.currentPhone}</p>
                  <button className="text-sm font-medium text-[#FF4000] hover:underline cursor-pointer">
                    Verify your phone
                  </button>
                </div>
              </div>

              {/* Location Card */}
              <div className="bg-white rounded-xl border border-[#EEEEEE] p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-bold text-black">Location</h2>
                  <button 
                    onClick={() => setIsLocationModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-secondary-light rounded-lg transition-colors cursor-pointer"
                  >
                    <img src={EditIcon} alt="Edit" className="w-5 h-5" />
                    Edit
                  </button>
                </div>

                <p className="text-sm text-black">{locationData.city}, {locationData.country}</p>
              </div>
            </>
          )}

          {/* About Organization */}
          {activeSection === 'about-organization' && (
            <div className="space-y-6">
              {/* Organization Profile Section */}
              <div>
                <h2 className="text-xl font-bold text-black mb-1">Organization Profile</h2>
                <p className="text-sm text-gray mb-6">
                  Tell attendees who you are. Add your brand details and build trust with your audience.
                </p>

                <div className="space-y-4">
                  {/* Rows 1-2: Organization Name, Organization Type + Logo Upload (spans 2 rows) */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column: Organization Name (row 1) + Organization Type (row 2) */}
                    <div className="space-y-4">
                      {/* Organization Name */}
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Organization Name <span className="text-[#FF3425]">*</span>
                        </label>
                        <input
                          type="text"
                          value={organizationData.name}
                          onChange={(e) => handleOrganizationChange('name', e.target.value)}
                          className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                          placeholder="Enter organization name"
                        />
                      </div>

                      {/* Organization Type */}
                      <div className="relative" ref={orgTypeRef}>
                        <label className="block text-sm font-medium text-black mb-2">
                          Organization Type
                        </label>
                        <button
                          type="button"
                          onClick={() => setIsOrgTypeDropdownOpen(!isOrgTypeDropdownOpen)}
                          className={`w-full px-4 py-2.5 border rounded-lg text-sm text-left flex items-center justify-between focus:outline-none focus:border-primary transition-all border-light-gray ${
                            organizationData.organizationType ? 'text-black' : 'text-[#9CA3AF]'
                          }`}
                        >
                          {organizationData.organizationType || 'Select organization type'}
                          <svg className="w-4 h-4 text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        
                        {isOrgTypeDropdownOpen && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-light-gray rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {organizationTypes.map((type) => (
                              <button
                                key={type}
                                type="button"
                                onClick={() => handleOrganizationTypeSelect(type)}
                                className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                  organizationData.organizationType === type
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

                    {/* Right Column: Organization Logo (spans 2 rows) */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Organization Logo
                      </label>
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="relative w-full h-[108px] border-2 border-dashed border-primary rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-primary-light/30 transition-colors"
                      >
                        {organizationData.logoPreview ? (
                          <img 
                            src={organizationData.logoPreview} 
                            alt="Organization Logo" 
                            className="max-h-[88px] object-contain"
                          />
                        ) : (
                          <>
                            <img src={UploadIcon} alt="Upload" className="w-6 h-6 mb-1.5" />
                            <p className="text-sm text-primary font-medium">
                              <span className="font-semibold">Choose file</span> or Drop here
                            </p>
                            <p className="text-xs text-gray mt-0.5">
                              PNG or JPG (400×400px, max 5MB)
                            </p>
                          </>
                        )}
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/jpg"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Address only */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      value={organizationData.address}
                      onChange={(e) => handleOrganizationChange('address', e.target.value)}
                      className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="Ex: Jolie vue, Kouba, Algeria"
                    />
                  </div>

                  {/* Row 4: Organization Email + Contact Phone */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Organization Email (Required) */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Organization Email <span className="text-[#FF3425]">*</span>
                      </label>
                      <input
                        type="email"
                        value={organizationData.email}
                        onChange={(e) => handleOrganizationChange('email', e.target.value)}
                        className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        placeholder="Ex: contact@ormeet.com"
                      />
                    </div>

                    {/* Contact Phone */}
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Contact Phone
                      </label>
                      <input
                        type="tel"
                        value={organizationData.phone}
                        onChange={(e) => handleOrganizationChange('phone', e.target.value)}
                        className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        placeholder="Add your organization phone number"
                      />
                    </div>
                  </div>

                  {/* About Your Organization */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      About Your Organization
                    </label>
                    <textarea
                      value={organizationData.description}
                      onChange={(e) => handleOrganizationChange('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                      placeholder="Write a short description about what kind of events you host and what attendees can expect."
                    />
                  </div>
                </div>
              </div>

              {/* Social Media Links Section */}
              <div>
                <h2 className="text-xl font-bold text-black mb-1">Social Media Links</h2>
                <p className="text-sm text-gray mb-6">
                  Connect your social accounts so attendees can find and follow you.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Facebook */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Facebook
                    </label>
                    <input
                      type="text"
                      value={organizationData.socialMedia.facebook}
                      onChange={(e) => handleOrganizationChange('socialMedia.facebook', e.target.value)}
                      className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="facebook.com/yourpage"
                    />
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Instagram
                    </label>
                    <input
                      type="text"
                      value={organizationData.socialMedia.instagram}
                      onChange={(e) => handleOrganizationChange('socialMedia.instagram', e.target.value)}
                      className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="@yourusername"
                    />
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="text"
                      value={organizationData.socialMedia.linkedin}
                      onChange={(e) => handleOrganizationChange('socialMedia.linkedin', e.target.value)}
                      className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="linkedin.com/company/yourname"
                    />
                  </div>

                  {/* YouTube */}
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      YouTube
                    </label>
                    <input
                      type="text"
                      value={organizationData.socialMedia.youtube}
                      onChange={(e) => handleOrganizationChange('socialMedia.youtube', e.target.value)}
                      className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                      placeholder="youtube.com/@yourchannel"
                    />
                  </div>
                </div>
              </div>

              {/* Save Changes Button */}
              <div className="flex justify-end">
                <button
                  onClick={handleOrganizationSave}
                  className="px-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all whitespace-nowrap cursor-pointer"
                  style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                >
                  Save changes
                </button>
              </div>
            </div>
          )}

          {/* Team & Roles */}
          {activeSection === 'team-roles' && (
            <div className="w-full">
              {/* Tab Navigation */}
              <div className="flex items-center gap-8 mb-6 border-b border-light-gray">
                <button
                  onClick={() => setActiveTeamTab('team')}
                  className={`pb-3 text-base font-medium transition-colors relative ${
                    activeTeamTab === 'team'
                      ? 'text-primary'
                      : 'text-gray hover:text-black'
                  }`}
                >
                  Team Members
                  {activeTeamTab === 'team' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                  )}
                </button>
                <button
                  onClick={() => setActiveTeamTab('roles')}
                  className={`pb-3 text-base font-medium transition-colors relative ${
                    activeTeamTab === 'roles'
                      ? 'text-primary'
                      : 'text-gray hover:text-black'
                  }`}
                >
                  Roles
                  {activeTeamTab === 'roles' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
                  )}
                </button>
              </div>

              {activeTeamTab === 'team' && (
                <div>
                  {!isInviteTeamMemberPage ? (
                    <>
                      {/* Header with count, search and invite button */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <h2 className="text-lg font-semibold text-black">{filteredTeamMembers.length} Team Member{filteredTeamMembers.length !== 1 ? 's' : ''}</h2>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                          {/* Search Input - Exact same as Events */}
                          <div className="relative flex-1 sm:flex-none">
                            <input
                              type="text"
                              placeholder="Search team member"
                              value={teamSearchQuery}
                              onChange={(e) => setTeamSearchQuery(e.target.value)}
                              className="w-full sm:w-[160px] lg:w-[199px] h-[38px] pl-4 pr-10 bg-white border border-light-gray text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all rounded-full"
                            />
                            <img 
                              src={SearchIcon} 
                              alt="Search" 
                              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none" 
                            />
                          </div>

                          {/* Invite Team Member Button - Exact same as Create Event */}
                          <button
                            onClick={() => setIsInviteTeamMemberPage(true)}
                            className="relative flex items-center gap-2 pl-10 pr-5 h-[38px] bg-[#FF4000] hover:bg-[#E63900] text-white text-sm sm:text-base rounded-full transition-all cursor-pointer whitespace-nowrap"
                            style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                          >
                            <img src={CreateEventIcon} alt="Invite" className="absolute left-1 top-1/2 -translate-y-1/2 w-[26px] h-[26px] sm:w-[30px] sm:h-[30px]" />
                            <span>Invite team member</span>
                          </button>
                        </div>
                      </div>

                      {/* Team Members Table */}
                  <div className="bg-white border border-light-gray rounded-xl overflow-hidden">
                    {/* Table Header */}
                    <div className="hidden lg:grid grid-cols-[2.5fr_3fr_2fr_1.5fr] gap-4 px-6 py-3 bg-secondary-light border-b border-light-gray">
                      <div className="text-sm font-medium text-gray">Name</div>
                      <div className="text-sm font-medium text-gray">Email</div>
                      <div className="text-sm font-medium text-gray">Role</div>
                      <div className="text-sm font-medium text-gray">Status</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-light-gray">
                      {filteredTeamMembers.length === 0 ? (
                        <div className="px-6 py-12 text-center text-gray">No team members found</div>
                      ) : (
                        filteredTeamMembers.map((member) => (
                          <div 
                            key={member.id} 
                            className="grid grid-cols-1 lg:grid-cols-[2.5fr_3fr_2fr_1.5fr] gap-4 px-6 py-4 hover:bg-secondary-light transition-colors cursor-pointer"
                            onClick={() => setSelectedMember(member)}
                          >
                            {/* Name with Avatar */}
                            <div className="flex items-center gap-3 min-w-0 overflow-hidden">
                              {member.avatar ? (
                                <img
                                  src={member.avatar}
                                  alt={member.name}
                                  className="w-10 h-10 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold shrink-0" style={{ backgroundColor: getAvatarColor(member.id) }}>
                                  {getInitials(member.name)}
                                </div>
                              )}
                              <div className="min-w-0 overflow-hidden">
                                <div className="text-sm font-medium text-black truncate">{member.name}</div>
                                <div className="lg:hidden text-xs text-gray truncate">{member.email}</div>
                              </div>
                            </div>
                            
                            {/* Email - Hidden on mobile */}
                            <div className="hidden lg:flex items-center min-w-0 overflow-hidden">
                              <span className="text-sm text-black truncate">{member.email}</span>
                            </div>
                            
                            {/* Role */}
                            <div className="flex items-center min-w-0 overflow-hidden">
                              <span className="lg:hidden text-xs text-gray mr-2 shrink-0">Role:</span>
                              <span className="text-sm text-black truncate">{member.role}</span>
                            </div>
                            
                            {/* Status */}
                            <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                              <span className="lg:hidden text-xs text-gray mr-2 shrink-0">Status:</span>
                              {member.status === 'active' ? (
                                <>
                                  <svg className="w-4 h-4 text-success shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-sm text-success font-medium whitespace-nowrap">Active</span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-4 h-4 text-[#FBBC04] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                  </svg>
                                  <span className="text-sm text-[#FBBC04] font-medium whitespace-nowrap">Pending</span>
                                </>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                    </>
                  ) : (
                    /* Invite Team Member Page */
                    <div className="bg-white border border-light-gray rounded-xl p-6">
                      {/* Header */}
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-black mb-1">Add your team Member</h2>
                        <p className="text-sm text-gray">
                          Enter the email address of your team member, then choose what they can do by assigning a role.
                        </p>
                      </div>

                      {inviteError && (
                        <div className="mb-4 px-4 py-3 bg-red-50 border border-[#FF3425] rounded-lg text-[#FF3425] text-sm">
                          {inviteError}
                        </div>
                      )}

                      <div className="space-y-4">
                        {/* Email Address */}
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={inviteTeamMemberData.email}
                            onChange={(e) => setInviteTeamMemberData({ ...inviteTeamMemberData, email: e.target.value })}
                            placeholder="teammate@example.com"
                            className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                          />
                        </div>

                        {/* Invitation Code */}
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">
                            Invitation code
                          </label>
                          <input
                            type="text"
                            value={inviteTeamMemberData.invitationCode}
                            onChange={(e) => setInviteTeamMemberData({ ...inviteTeamMemberData, invitationCode: e.target.value })}
                            placeholder="Enter invitation code"
                            className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                          />
                        </div>

                        {/* Assign Role - Matching Organization Type dropdown design */}
                        <div>
                          <label className="block text-sm font-medium text-black mb-2">
                            Assign role
                          </label>
                          <div className="relative" ref={roleDropdownRef}>
                            <button
                              type="button"
                              onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
                              className={`w-full px-4 py-2.5 border rounded-lg text-sm text-left flex items-center justify-between focus:outline-none focus:border-primary transition-all border-light-gray ${
                                inviteTeamMemberData.assignedRole ? 'text-black' : 'text-[#9CA3AF]'
                              }`}
                            >
                              {inviteTeamMemberData.assignedRole || 'Select a role'}
                              <svg className="w-4 h-4 text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>

                            {isRoleDropdownOpen && (
                              <div className="absolute z-10 w-full mt-1 bg-white border border-light-gray rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {mockRoles.map((role) => (
                                  <button
                                    key={role.id}
                                    type="button"
                                    onClick={() => handleRoleSelect(role.name)}
                                    className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                                      inviteTeamMemberData.assignedRole === role.name
                                        ? 'bg-primary-light text-primary font-medium'
                                        : 'text-gray hover:bg-secondary-light'
                                    }`}
                                  >
                                    {role.name}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons - Matching Create Event page style */}
                      <div className="flex items-center justify-end gap-3 mt-6">
                        <button
                          onClick={handleCancelInvite}
                          className="pl-5 pr-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSendInvite}
                          className="pl-5 pr-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all whitespace-nowrap"
                          style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                        >
                          Send Invite
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTeamTab === 'roles' && (
                <div>
                  {!isCreatingRole ? (
                    <>
                      {/* Header with count, search and create role button */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <h2 className="text-lg font-semibold text-black">{filteredRoles.length} Role{filteredRoles.length !== 1 ? 's' : ''}</h2>
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                          {/* Search Input - Exact same as Team Members */}
                          <div className="relative flex-1 sm:flex-none">
                            <input
                              type="text"
                              placeholder="Search Roles"
                              value={rolesSearchQuery}
                              onChange={(e) => setRolesSearchQuery(e.target.value)}
                              className="w-full sm:w-[160px] lg:w-[199px] h-[38px] pl-4 pr-10 bg-white border border-light-gray text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all rounded-full"
                            />
                            <img 
                              src={SearchIcon} 
                              alt="Search" 
                              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 pointer-events-none" 
                            />
                          </div>

                          {/* Create Role Button - Exact same as Invite Team Member */}
                          <button
                            onClick={() => setIsCreatingRole(true)}
                            className="relative flex items-center gap-2 pl-10 pr-5 h-[38px] bg-[#FF4000] hover:bg-[#E63900] text-white text-sm rounded-full transition-all cursor-pointer whitespace-nowrap"
                            style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                          >
                            <img src={CreateEventIcon} alt="Create" className="absolute left-1 top-1/2 -translate-y-1/2 w-[26px] h-[26px]" />
                            <span>Create Role</span>
                          </button>
                        </div>
                      </div>

                      {/* Roles Table */}
                      <div className="bg-white border border-light-gray rounded-xl overflow-visible">
                    {/* Table Header - Hidden on mobile */}
                    <div className="hidden lg:grid lg:grid-cols-[3fr_3fr_0.5fr] gap-4 px-6 py-4 bg-secondary-light border-b border-light-gray rounded-t-xl">
                      <div className="text-sm font-medium text-gray">Roles</div>
                      <div className="text-sm font-medium text-gray">Permissions</div>
                      <div className="text-sm font-medium text-gray"></div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-light-gray overflow-visible">
                      {filteredRoles.length === 0 ? (
                        <div className="px-6 py-12 text-center text-gray">No roles found</div>
                      ) : (
                        filteredRoles.map((role) => (
                          <div key={role.id} className="grid grid-cols-1 lg:grid-cols-[3fr_3fr_0.5fr] gap-4 px-6 py-4 hover:bg-secondary-light transition-colors overflow-visible">
                            {/* Role Name */}
                            <div className="flex items-center min-w-0 overflow-hidden">
                              <div className="min-w-0 overflow-hidden">
                                <div className="text-sm font-medium text-black truncate">{role.name}</div>
                                <div className="lg:hidden text-xs text-gray truncate">{role.permissions}</div>
                              </div>
                            </div>
                            
                            {/* Permissions - Hidden on mobile */}
                            <div className="hidden lg:flex items-center min-w-0 overflow-hidden">
                              <span className="text-sm text-black truncate">{role.permissions}</span>
                            </div>
                            
                            {/* Actions Menu */}
                            <div className="flex items-center justify-end relative shrink-0" ref={openActionMenu === role.id ? actionMenuRef : null}>
                              <button onClick={() => setOpenActionMenu(openActionMenu === role.id ? null : role.id)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-light-gray transition-colors shrink-0">
                                <svg className="w-5 h-5 text-gray" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </button>

                              {openActionMenu === role.id && (
                                <div className="absolute right-0 bottom-10 w-48 bg-white border border-light-gray rounded-lg shadow-xl py-1" style={{ zIndex: 9999 }}>
                                  <button onClick={() => handleEditRole(role.id)} className="w-full px-4 py-2 text-left text-sm text-black hover:bg-secondary-light transition-colors">Edit Role</button>
                                  <button className="w-full px-4 py-2 text-left text-sm text-black hover:bg-secondary-light transition-colors">View Details</button>
                                  <button onClick={() => handleDuplicateRole(role.id)} className="w-full px-4 py-2 text-left text-sm text-black hover:bg-secondary-light transition-colors">Duplicate Role</button>
                                  <div className="border-t border-light-gray my-1"></div>
                                  <button 
                                    onClick={() => {
                                      setRoleToDelete(role);
                                      setIsDeleteRoleConfirmOpen(true);
                                      setOpenActionMenu(null);
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-[#FF3425] hover:bg-secondary-light transition-colors cursor-pointer"
                                  >
                                    Delete Role
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                    </>
                  ) : (
                    /* Create Role Form */
                    <div className="bg-white border border-light-gray rounded-xl p-6">
                      {/* Header */}
                      <div className="mb-6">
                        <h2 className="text-xl font-bold text-black mb-1">
                          {roleMode === 'edit' ? 'Edit Role' : 'Add a New Role'}
                        </h2>
                        <p className="text-sm text-gray">
                          {roleMode === 'edit' ? 'Update role details and permissions' : 'Create a role and choose its permissions'}
                        </p>
                      </div>

                      {/* Role Name Input */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-black mb-2">
                          Role name
                        </label>
                        <input
                          ref={roleTitleInputRef}
                          type="text"
                          value={roleFormData.roleName}
                          onChange={(e) => setRoleFormData({ ...roleFormData, roleName: e.target.value })}
                          placeholder="Add a role name"
                          className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray/40 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all"
                        />
                      </div>

                      {/* Permissions Sections */}
                      <div className="space-y-6">
                        {/* Events */}
                        <div>
                          <h3 className="text-sm font-semibold text-black mb-3">Events</h3>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={roleFormData.permissions.events.deleteEvents}
                                onChange={(e) => setRoleFormData({
                                  ...roleFormData,
                                  permissions: {
                                    ...roleFormData.permissions,
                                    events: { ...roleFormData.permissions.events, deleteEvents: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-gray focus:ring-2 focus:ring-primary/20"
                                style={{ accentColor: '#FF4000' }}
                              />
                              <span className="text-sm text-black">Delete events</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={roleFormData.permissions.events.createAndEditEvents}
                                onChange={(e) => setRoleFormData({
                                  ...roleFormData,
                                  permissions: {
                                    ...roleFormData.permissions,
                                    events: { ...roleFormData.permissions.events, createAndEditEvents: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-gray focus:ring-2 focus:ring-primary/20"
                                style={{ accentColor: '#FF4000' }}
                              />
                              <span className="text-sm text-black">Create and edit events</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={roleFormData.permissions.events.viewEvents}
                                onChange={(e) => setRoleFormData({
                                  ...roleFormData,
                                  permissions: {
                                    ...roleFormData.permissions,
                                    events: { ...roleFormData.permissions.events, viewEvents: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-gray focus:ring-2 focus:ring-primary/20"
                                style={{ accentColor: '#FF4000' }}
                              />
                              <span className="text-sm text-black">View events</span>
                            </label>
                          </div>
                        </div>

                        {/* Tickets & Pricing */}
                        <div>
                          <h3 className="text-sm font-semibold text-black mb-3">Tickets & Pricing</h3>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={roleFormData.permissions.ticketsAndPricing.viewTickets}
                                onChange={(e) => setRoleFormData({
                                  ...roleFormData,
                                  permissions: {
                                    ...roleFormData.permissions,
                                    ticketsAndPricing: { ...roleFormData.permissions.ticketsAndPricing, viewTickets: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-gray focus:ring-2 focus:ring-primary/20"
                                style={{ accentColor: '#FF4000' }}
                              />
                              <span className="text-sm text-black">View tickets</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={roleFormData.permissions.ticketsAndPricing.editTicketTypesAndPricing}
                                onChange={(e) => setRoleFormData({
                                  ...roleFormData,
                                  permissions: {
                                    ...roleFormData.permissions,
                                    ticketsAndPricing: { ...roleFormData.permissions.ticketsAndPricing, editTicketTypesAndPricing: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-gray focus:ring-2 focus:ring-primary/20"
                                style={{ accentColor: '#FF4000' }}
                              />
                              <span className="text-sm text-black">Edit ticket types & pricing</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={roleFormData.permissions.ticketsAndPricing.managePromoCodes}
                                onChange={(e) => setRoleFormData({
                                  ...roleFormData,
                                  permissions: {
                                    ...roleFormData.permissions,
                                    ticketsAndPricing: { ...roleFormData.permissions.ticketsAndPricing, managePromoCodes: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-gray focus:ring-2 focus:ring-primary/20"
                                style={{ accentColor: '#FF4000' }}
                              />
                              <span className="text-sm text-black">Manage promo codes</span>
                            </label>
                          </div>
                        </div>

                        {/* Orders & Attendees */}
                        <div>
                          <h3 className="text-sm font-semibold text-black mb-3">Orders & Attendees</h3>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={roleFormData.permissions.ordersAndAttendees.viewAttendees}
                                onChange={(e) => setRoleFormData({
                                  ...roleFormData,
                                  permissions: {
                                    ...roleFormData.permissions,
                                    ordersAndAttendees: { ...roleFormData.permissions.ordersAndAttendees, viewAttendees: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-gray focus:ring-2 focus:ring-primary/20"
                                style={{ accentColor: '#FF4000' }}
                              />
                              <span className="text-sm text-black">View attendees</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={roleFormData.permissions.ordersAndAttendees.exportAttendeeData}
                                onChange={(e) => setRoleFormData({
                                  ...roleFormData,
                                  permissions: {
                                    ...roleFormData.permissions,
                                    ordersAndAttendees: { ...roleFormData.permissions.ordersAndAttendees, exportAttendeeData: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-gray focus:ring-2 focus:ring-primary/20"
                                style={{ accentColor: '#FF4000' }}
                              />
                              <span className="text-sm text-black">Export attendee data</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={roleFormData.permissions.ordersAndAttendees.checkInAttendees}
                                onChange={(e) => setRoleFormData({
                                  ...roleFormData,
                                  permissions: {
                                    ...roleFormData.permissions,
                                    ordersAndAttendees: { ...roleFormData.permissions.ordersAndAttendees, checkInAttendees: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-gray focus:ring-2 focus:ring-primary/20"
                                style={{ accentColor: '#FF4000' }}
                              />
                              <span className="text-sm text-black">Check-in attendees</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={roleFormData.permissions.ordersAndAttendees.editAttendeeInfo}
                                onChange={(e) => setRoleFormData({
                                  ...roleFormData,
                                  permissions: {
                                    ...roleFormData.permissions,
                                    ordersAndAttendees: { ...roleFormData.permissions.ordersAndAttendees, editAttendeeInfo: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-gray focus:ring-2 focus:ring-primary/20"
                                style={{ accentColor: '#FF4000' }}
                              />
                              <span className="text-sm text-black">Edit attendee info</span>
                            </label>
                          </div>
                        </div>

                        {/* Reports & Analytics */}
                        <div>
                          <h3 className="text-sm font-semibold text-black mb-3">Reports & Analytics</h3>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={roleFormData.permissions.reportsAndAnalytics.viewAnalyticsDashboard}
                                onChange={(e) => setRoleFormData({
                                  ...roleFormData,
                                  permissions: {
                                    ...roleFormData.permissions,
                                    reportsAndAnalytics: { ...roleFormData.permissions.reportsAndAnalytics, viewAnalyticsDashboard: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-gray focus:ring-2 focus:ring-primary/20"
                                style={{ accentColor: '#FF4000' }}
                              />
                              <span className="text-sm text-black">View analytics dashboard</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={roleFormData.permissions.reportsAndAnalytics.downloadReports}
                                onChange={(e) => setRoleFormData({
                                  ...roleFormData,
                                  permissions: {
                                    ...roleFormData.permissions,
                                    reportsAndAnalytics: { ...roleFormData.permissions.reportsAndAnalytics, downloadReports: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-gray focus:ring-2 focus:ring-primary/20"
                                style={{ accentColor: '#FF4000' }}
                              />
                              <span className="text-sm text-black">Download reports</span>
                            </label>
                          </div>
                        </div>

                        {/* Email & Notifications */}
                        <div>
                          <h3 className="text-sm font-semibold text-black mb-3">Email & Notifications</h3>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={roleFormData.permissions.emailAndNotifications.viewScheduledMessages}
                                onChange={(e) => setRoleFormData({
                                  ...roleFormData,
                                  permissions: {
                                    ...roleFormData.permissions,
                                    emailAndNotifications: { ...roleFormData.permissions.emailAndNotifications, viewScheduledMessages: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-gray focus:ring-2 focus:ring-primary/20"
                                style={{ accentColor: '#FF4000' }}
                              />
                              <span className="text-sm text-black">View scheduled messages</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={roleFormData.permissions.emailAndNotifications.editEmailTemplates}
                                onChange={(e) => setRoleFormData({
                                  ...roleFormData,
                                  permissions: {
                                    ...roleFormData.permissions,
                                    emailAndNotifications: { ...roleFormData.permissions.emailAndNotifications, editEmailTemplates: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-gray focus:ring-2 focus:ring-primary/20"
                                style={{ accentColor: '#FF4000' }}
                              />
                              <span className="text-sm text-black">Edit email templates</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={roleFormData.permissions.emailAndNotifications.sendEventReminders}
                                onChange={(e) => setRoleFormData({
                                  ...roleFormData,
                                  permissions: {
                                    ...roleFormData.permissions,
                                    emailAndNotifications: { ...roleFormData.permissions.emailAndNotifications, sendEventReminders: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-gray focus:ring-2 focus:ring-primary/20"
                                style={{ accentColor: '#FF4000' }}
                              />
                              <span className="text-sm text-black">Send event reminders</span>
                            </label>
                          </div>
                        </div>

                        {/* Settings */}
                        <div>
                          <h3 className="text-sm font-semibold text-black mb-3">Settings</h3>
                          <div className="space-y-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={roleFormData.permissions.settings.viewSettings}
                                onChange={(e) => setRoleFormData({
                                  ...roleFormData,
                                  permissions: {
                                    ...roleFormData.permissions,
                                    settings: { ...roleFormData.permissions.settings, viewSettings: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-gray focus:ring-2 focus:ring-primary/20"
                                style={{ accentColor: '#FF4000' }}
                              />
                              <span className="text-sm text-black">View settings</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={roleFormData.permissions.settings.manageTeamAccess}
                                onChange={(e) => setRoleFormData({
                                  ...roleFormData,
                                  permissions: {
                                    ...roleFormData.permissions,
                                    settings: { ...roleFormData.permissions.settings, manageTeamAccess: e.target.checked }
                                  }
                                })}
                                className="w-4 h-4 rounded border-gray focus:ring-2 focus:ring-primary/20"
                                style={{ accentColor: '#FF4000' }}
                              />
                              <span className="text-sm text-black">Manage team access</span>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-light-gray">
                        <button
                          type="button"
                          onClick={() => {
                            setIsCreatingRole(false);
                            setRoleMode('create');
                            setRoleFormData({
                              roleName: '',
                              permissions: {
                                events: { deleteEvents: false, createAndEditEvents: false, viewEvents: false },
                                ticketsAndPricing: { viewTickets: false, editTicketTypesAndPricing: false, managePromoCodes: false },
                                ordersAndAttendees: { viewAttendees: false, exportAttendeeData: false, checkInAttendees: false, editAttendeeInfo: false },
                                reportsAndAnalytics: { viewAnalyticsDashboard: false, downloadReports: false },
                                emailAndNotifications: { viewScheduledMessages: false, editEmailTemplates: false, sendEventReminders: false },
                                settings: { viewSettings: false, manageTeamAccess: false }
                              }
                            });
                          }}
                          className="pl-5 pr-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleCreateRole}
                          disabled={
                            !roleFormData.roleName.trim() ||
                            !Object.values(roleFormData.permissions).some(category =>
                              Object.values(category).some(permission => permission)
                            )
                          }
                          className={`pl-5 pr-5 py-2 text-white font-medium text-sm rounded-full transition-all whitespace-nowrap cursor-pointer ${
                            !roleFormData.roleName.trim() ||
                            !Object.values(roleFormData.permissions).some(category =>
                              Object.values(category).some(permission => permission)
                            )
                              ? 'bg-gray-300 cursor-not-allowed'
                              : 'bg-[#FF4000] hover:bg-[#E63900]'
                          }`}
                          style={
                            roleFormData.roleName.trim() &&
                            Object.values(roleFormData.permissions).some(category =>
                              Object.values(category).some(permission => permission)
                            )
                              ? { boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }
                              : {}
                          }
                        >
                          {roleMode === 'edit' ? 'Save changes' : 'Create Role'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Payment & Payout Section */}
          {activeSection === 'payment-payout' && (
            <BankAccountSettings />
          )}

          {/* Email Preferences Section */}
          {activeSection === 'email-preferences' && (
            <div className="bg-white rounded-xl border border-[#EEEEEE] p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-black mb-2">Email preferences</h2>
                <p className="text-sm text-[#4F4F4F]">Choose the emails you want to receive—stay informed, not overwhelmed.</p>
              </div>
              
              {/* Organizer Preferences */}
              <div className="space-y-6">
                <div className="flex items-start justify-between py-4 border-b border-[#EEEEEE]">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-black mb-1">Event Updates & Changes</h3>
                    <p className="text-sm text-[#4F4F4F]">Get notified when attendees register or when event details are modified.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={emailPrefs.eventUpdates}
                      onChange={(e) => setEmailPrefs({ ...emailPrefs, eventUpdates: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#BCBCBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4000]"></div>
                  </label>
                </div>
                
                <div className="flex items-start justify-between py-4 border-b border-[#EEEEEE]">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-black mb-1">Ticket Sales Notifications</h3>
                    <p className="text-sm text-[#4F4F4F]">Receive alerts when tickets are purchased for your events.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={emailPrefs.ticketSales}
                      onChange={(e) => setEmailPrefs({ ...emailPrefs, ticketSales: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#BCBCBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4000]"></div>
                  </label>
                </div>
                
                <div className="flex items-start justify-between py-4 border-b border-[#EEEEEE]">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-black mb-1">Attendee Messages</h3>
                    <p className="text-sm text-[#4F4F4F]">Get notified when attendees send you messages or questions.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={emailPrefs.attendeeMessages}
                      onChange={(e) => setEmailPrefs({ ...emailPrefs, attendeeMessages: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#BCBCBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4000]"></div>
                  </label>
                </div>
                
                <div className="flex items-start justify-between py-4 border-b border-[#EEEEEE]">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-black mb-1">Payout Notifications</h3>
                    <p className="text-sm text-[#4F4F4F]">Be informed about payment processing and payout status.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={emailPrefs.payoutNotifications}
                      onChange={(e) => setEmailPrefs({ ...emailPrefs, payoutNotifications: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#BCBCBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4000]"></div>
                  </label>
                </div>
                
                <div className="flex items-start justify-between py-4 border-b border-[#EEEEEE]">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-black mb-1">Platform Updates & Features</h3>
                    <p className="text-sm text-[#4F4F4F]">Stay updated on new features and improvements to the platform.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={emailPrefs.platformUpdates}
                      onChange={(e) => setEmailPrefs({ ...emailPrefs, platformUpdates: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#BCBCBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4000]"></div>
                  </label>
                </div>
                
                <div className="flex items-start justify-between py-4 border-b border-[#EEEEEE]">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-black mb-1">Marketing Tips & Best Practices</h3>
                    <p className="text-sm text-[#4F4F4F]">Receive tips on how to promote your events and increase attendance.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={emailPrefs.marketingTips}
                      onChange={(e) => setEmailPrefs({ ...emailPrefs, marketingTips: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#BCBCBC] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FF4000]"></div>
                  </label>
                </div>
                
                <div className="flex items-start justify-between py-4">
                  <div className="flex-1">
                    <h3 className="text-base font-semibold text-black mb-1">Newsletters & Success Stories</h3>
                    <p className="text-sm text-[#4F4F4F]">Get inspired by other organizers and industry insights.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer ml-4">
                    <input
                      type="checkbox"
                      checked={emailPrefs.newsletters}
                      onChange={(e) => setEmailPrefs({ ...emailPrefs, newsletters: e.target.checked })}
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
              
              {/* Password Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-semibold text-black">Password</h3>
                  <button
                    onClick={() => setIsEditPasswordOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black hover:bg-[#F8F8F8] rounded-lg transition-colors cursor-pointer"
                  >
                    <img src={EditIcon} alt="Edit" className="w-5 h-5" />
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
            </div>
          )}
        </div>
      </div>
      
      {/* Profile Edit Modal */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-2xl shadow-2xl p-8 w-full transition-all ${showProfileSuccess ? 'max-w-md' : 'max-w-lg'}`}>
            {!showProfileSuccess && (
              <>
                <h2 className="text-2xl font-bold text-black mb-6">Edit Profile</h2>
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
                <label className="text-sm font-medium text-black">Full Name</label>
                <input
                  type="text"
                  value={profileData.fullName}
                  onChange={(e) => setProfileData({ ...profileData, fullName: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black">Profile Photo</label>
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
                      <span>Choose file or Drop here</span>
                    </label>
                    <p className="text-xs text-gray mt-1.5">PNG or JPG (max 5MB)</p>
                  </div>
                </div>
              </div>
              </div>
            )}
            {!showProfileSuccess ? (
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setProfileError('');
                    setIsProfileModalOpen(false);
                  }}
                  className="px-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleProfileSave}
                  className="px-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all whitespace-nowrap cursor-pointer"
                  style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                >
                  Save changes
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <img src={SuccessIcon} alt="Success" className="w-16 h-16 mb-4" style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }} />
                <p className="text-lg font-semibold text-black">Changes saved successfully</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Email Edit Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-2xl shadow-2xl p-8 w-full transition-all ${showEmailSuccess ? 'max-w-md' : 'max-w-lg'}`}>
            {!showEmailSuccess && (
              <>
                <h2 className="text-2xl font-bold text-black mb-6">Edit Email</h2>
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
                <label className="text-sm font-medium text-black">Current Email</label>
                <input
                  type="email"
                  value={emailData.currentEmail}
                  disabled
                  className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-gray bg-secondary-light"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black">New Email</label>
                <input
                  type="email"
                  value={emailData.newEmail}
                  onChange={(e) => setEmailData({ ...emailData, newEmail: e.target.value })}
                  placeholder="Enter new email"
                  className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black">Password</label>
                <input
                  type="password"
                  value={emailData.password}
                  onChange={(e) => setEmailData({ ...emailData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                />
              </div>
              </div>
            )}
            {!showEmailSuccess ? (
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setEmailError('');
                    setIsEmailModalOpen(false);
                  }}
                  className="px-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEmailSave}
                  className="px-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all whitespace-nowrap cursor-pointer"
                  style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                >
                  Save changes
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <img src={SuccessIcon} alt="Success" className="w-16 h-16 mb-4" style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }} />
                <p className="text-lg font-semibold text-black">Changes saved successfully</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Phone Edit Modal */}
      {isPhoneModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-2xl shadow-2xl p-8 w-full transition-all ${showPhoneSuccess ? 'max-w-md' : 'max-w-lg'}`}>
            {!showPhoneSuccess && (
              <>
                <h2 className="text-2xl font-bold text-black mb-6">Edit Phone</h2>
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
                <label className="text-sm font-medium text-black">Current Phone</label>
                <input
                  type="text"
                  value={phoneData.currentPhone}
                  disabled
                  className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-gray bg-secondary-light"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black">New Phone Number</label>
                <input
                  type="tel"
                  value={phoneData.newPhone}
                  onChange={(e) => setPhoneData({ ...phoneData, newPhone: e.target.value })}
                  placeholder="Enter new phone number"
                  className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black">Password</label>
                <input
                  type="password"
                  value={phoneData.password}
                  onChange={(e) => setPhoneData({ ...phoneData, password: e.target.value })}
                  placeholder="Enter your password"
                  className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                />
              </div>
              </div>
            )}
            {!showPhoneSuccess ? (
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setPhoneError('');
                    setIsPhoneModalOpen(false);
                  }}
                  className="px-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePhoneSave}
                  className="px-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all whitespace-nowrap cursor-pointer"
                  style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                >
                  Save changes
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <img src={SuccessIcon} alt="Success" className="w-16 h-16 mb-4" style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }} />
                <p className="text-lg font-semibold text-black">Changes saved successfully</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Location Edit Modal */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-2xl shadow-2xl p-8 w-full transition-all ${showLocationSuccess ? 'max-w-md' : 'max-w-lg'}`}>
            {!showLocationSuccess && (
              <>
                <h2 className="text-2xl font-bold text-black mb-6">Edit Location</h2>
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
                <label className="text-sm font-medium text-black">Country</label>
                <input
                  type="text"
                  value={locationData.country}
                  onChange={(e) => setLocationData({ ...locationData, country: e.target.value })}
                  placeholder="Enter country"
                  className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black">City</label>
                <input
                  type="text"
                  value={locationData.city}
                  onChange={(e) => setLocationData({ ...locationData, city: e.target.value })}
                  placeholder="Enter city"
                  className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-black">Address</label>
                <input
                  type="text"
                  value={locationData.address}
                  onChange={(e) => setLocationData({ ...locationData, address: e.target.value })}
                  placeholder="Enter address (optional)"
                  className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                />
              </div>
              </div>
            )}
            {!showLocationSuccess ? (
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setLocationError('');
                    setIsLocationModalOpen(false);
                  }}
                  className="px-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLocationSave}
                  className="px-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all whitespace-nowrap cursor-pointer"
                  style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                >
                  Save changes
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <img src={SuccessIcon} alt="Success" className="w-16 h-16 mb-4" style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }} />
                <p className="text-lg font-semibold text-black">Changes saved successfully</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Password Edit Modal */}
      {isEditPasswordOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className={`bg-white rounded-2xl shadow-2xl p-8 w-full transition-all ${showPasswordSuccess ? 'max-w-md' : 'max-w-lg'}`}>
            {!showPasswordSuccess && (
              <>
                <h2 className="text-2xl font-bold text-black mb-6">Change Password</h2>
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
                  <label className="text-sm font-medium text-black">Current Password</label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-black">New Password</label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Enter new password"
                    className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-black">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Confirm new password"
                    className="w-full px-4 py-2.5 border border-light-gray rounded-lg text-sm text-black placeholder:text-input-gray focus:outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>
            )}
            {!showPasswordSuccess ? (
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setPasswordError('');
                    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
                    setIsEditPasswordOpen(false);
                  }}
                  className="px-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordSave}
                  className="px-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all whitespace-nowrap cursor-pointer"
                  style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                >
                  Save changes
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8">
                <img src={SuccessIcon} alt="Success" className="w-16 h-16 mb-4" style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }} />
                <p className="text-lg font-semibold text-black">Changes saved successfully</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Role Confirmation Modal */}
      {isDeleteRoleConfirmOpen && roleToDelete && (
        <div 
          className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4" 
          onClick={() => !showDeleteRoleSuccess && setIsDeleteRoleConfirmOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {!showDeleteRoleSuccess ? (
                <>
                  <h2 className="text-xl font-bold text-black mb-4">Confirm Deletion</h2>
                  <p className="text-sm text-gray mb-6">
                    Are you sure you want to delete <span className="font-semibold text-black">{roleToDelete.name}</span> ?
                  </p>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => {
                        setIsDeleteRoleConfirmOpen(false);
                        setRoleToDelete(null);
                      }}
                      className="px-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        console.log('Deleting role:', roleToDelete.id);
                        setShowDeleteRoleSuccess(true);
                        setTimeout(() => {
                          setShowDeleteRoleSuccess(false);
                          setIsDeleteRoleConfirmOpen(false);
                          setRoleToDelete(null);
                        }, 3000);
                      }}
                      className="px-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all whitespace-nowrap cursor-pointer"
                      style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                    >
                      Confirm
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <img src={SuccessIcon} alt="Success" className="w-16 h-16 mb-4" style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }} />
                  <p className="text-lg font-semibold text-black">Role successfully deleted</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Remove Member Confirmation Modal */}
      {isRemoveMemberConfirmOpen && memberToRemove && (
        <div 
          className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4" 
          onClick={() => !showRemoveMemberSuccess && setIsRemoveMemberConfirmOpen(false)}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              {!showRemoveMemberSuccess ? (
                <>
                  <h2 className="text-xl font-bold text-black mb-4">Confirm Deletion</h2>
                  <p className="text-sm text-gray mb-6">
                    Are you sure you want to remove <span className="font-semibold text-black">{memberToRemove.name}</span> ?
                  </p>

                  <div className="flex items-center justify-end gap-3">
                    <button
                      onClick={() => {
                        setIsRemoveMemberConfirmOpen(false);
                        setMemberToRemove(null);
                      }}
                      className="px-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => {
                        console.log('Removing member:', memberToRemove.id);
                        setShowRemoveMemberSuccess(true);
                        setTimeout(() => {
                          setShowRemoveMemberSuccess(false);
                          setIsRemoveMemberConfirmOpen(false);
                          setMemberToRemove(null);
                        }, 3000);
                      }}
                      className="px-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all whitespace-nowrap cursor-pointer"
                      style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                    >
                      Confirm
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-8">
                  <img src={SuccessIcon} alt="Success" className="w-16 h-16 mb-4" style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }} />
                  <p className="text-lg font-semibold text-black">Member successfully removed</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Invite Confirmation Popup */}
      {showInviteConfirmation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
            {/* Success Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-[#E8F5E9] rounded-full flex items-center justify-center">
                <img src={ValidIcon} alt="Success" className="w-10 h-10" />
              </div>
            </div>

            {/* Message */}
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-black mb-3">Invite sent</h3>
              <p className="text-sm text-gray">
                Your invite is on its way! <span className="font-semibold text-black">{inviteTeamMemberData.email}</span> will get an email with instructions to join your team.
              </p>
            </div>

            {/* Back to Team Members Button - Styled like Create Event but without shadow and icon */}
            <button
              onClick={handleBackToTeamMembers}
              className="flex items-center justify-center pl-5 pr-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white text-sm font-medium rounded-full transition-all whitespace-nowrap mx-auto"
            >
              Back to Team Members
            </button>
          </div>
        </div>
      )}

      {/* Team Member Details Modal */}
      {selectedMember && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" 
          onClick={() => !showResendSuccess && !showResendError && setSelectedMember(null)}
        >
          <div 
            className={`bg-white rounded-xl shadow-2xl w-full overflow-hidden ${!showResendSuccess && !showResendError ? 'max-w-2xl' : 'max-w-md'}`}
            onClick={(e) => e.stopPropagation()}
          >
            {!showResendSuccess && !showResendError ? (
              <>
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-light-gray">
                  <h2 className="text-xl font-bold text-black">Team Member Details</h2>
                  <button 
                    onClick={() => setSelectedMember(null)}
                    className="text-gray hover:text-black transition-colors cursor-pointer"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Modal Content */}
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-6">
                    {/* Member Photo & Name */}
                    <div className="shrink-0 flex flex-col items-center gap-3">
                      {selectedMember.avatar ? (
                        <img
                          src={selectedMember.avatar}
                          alt={selectedMember.name}
                          className="w-20 h-20 rounded-full object-cover border-2 border-light-gray"
                        />
                      ) : (
                        <div 
                          className="w-20 h-20 rounded-full flex items-center justify-center text-white text-xl font-semibold border-2 border-light-gray" 
                          style={{ backgroundColor: getAvatarColor(selectedMember.id) }}
                        >
                          {getInitials(selectedMember.name)}
                        </div>
                      )}
                      <p className="text-sm font-semibold text-black text-center">{selectedMember.name}</p>
                    </div>

                    {/* Member Information */}
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Email */}
                      <div>
                        <p className="text-xs text-gray mb-1">Email</p>
                        <p className="text-sm text-black font-medium">{selectedMember.email}</p>
                      </div>

                      {/* Role */}
                      <div>
                        <p className="text-xs text-gray mb-1">Role</p>
                        <span className="inline-block px-3 py-1 bg-secondary-light text-sm font-medium text-black rounded-full">
                          {selectedMember.role}
                        </span>
                      </div>

                      {/* Status */}
                      <div>
                        <p className="text-xs text-gray mb-1">Status</p>
                        {selectedMember.status === 'active' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#10B981]/10 text-[#10B981] text-xs font-medium rounded-full">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-[#FBBC04]/10 text-[#FBBC04] text-xs font-medium rounded-full">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            Pending
                          </span>
                        )}
                      </div>

                      {/* Last Active / Enrollment Date */}
                      <div>
                        <p className="text-xs text-gray mb-1">Last Active</p>
                        <p className="text-sm text-black">{selectedMember.lastActive}</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-end gap-3 mt-4">
                    <button
                      onClick={() => {
                        setMemberToRemove(selectedMember);
                        setIsRemoveMemberConfirmOpen(true);
                        setSelectedMember(null);
                      }}
                      className="pl-5 pr-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap cursor-pointer"
                    >
                      Remove
                    </button>
                    <button
                      onClick={handleOpenChangeRole}
                      className="pl-5 pr-5 py-2 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-full transition-all whitespace-nowrap cursor-pointer"
                      style={{ boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' }}
                    >
                      Change role
                    </button>
                  </div>
                </div>
              </>
            ) : showResendSuccess ? (
              <div className="p-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <img src={SuccessIcon} alt="Success" className="w-16 h-16 mb-4" style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }} />
                  <p className="text-lg font-semibold text-black">Ticket resent successfully</p>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <img src={ErrorIcon} alt="Error" className="w-16 h-16 mb-4" />
                  <p className="text-lg font-semibold text-black">Failed to resend ticket. Please try again.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Change Role Modal */}
      {isChangeRoleOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4" 
          onClick={() => !showChangeRoleSuccess && !showChangeRoleError && handleCancelChangeRole()}
        >
          <div 
            className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-visible" 
            onClick={(e) => e.stopPropagation()}
          >
            {!showChangeRoleSuccess && !showChangeRoleError ? (
              <div className="p-6">
                <h2 className="text-xl font-bold text-black mb-6">Change Role</h2>

                {/* Current Role - Read Only */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-black mb-2">
                    Current role
                  </label>
                  <input
                    type="text"
                    value={changeRoleData.currentRole}
                    readOnly
                    className="w-full px-4 py-2 bg-[#F5F5F5] border border-light-gray rounded-lg text-sm text-gray cursor-not-allowed"
                  />
                </div>

                {/* New Role - Dropdown */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-black mb-2">
                    New role
                  </label>
                  <div className="relative" ref={newRoleDropdownRef}>
                    <button
                      onClick={() => setIsNewRoleDropdownOpen(!isNewRoleDropdownOpen)}
                      className="w-full px-4 py-2 bg-white border border-light-gray rounded-lg text-sm text-left flex items-center justify-between hover:border-primary transition-all cursor-pointer"
                    >
                      <span className={changeRoleData.newRole ? 'text-black' : 'text-input-gray'}>
                        {changeRoleData.newRole || 'Select a role'}
                      </span>
                      <svg 
                        className={`w-4 h-4 text-gray transition-transform ${isNewRoleDropdownOpen ? 'rotate-180' : ''}`} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>

                    {isNewRoleDropdownOpen && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-light-gray rounded-lg shadow-lg max-h-48 overflow-y-auto">
                        {mockRoles.map((role) => (
                          <button
                            key={role.id}
                            onClick={() => handleNewRoleSelect(role.name)}
                            className="w-full px-4 py-2 text-sm text-left hover:bg-secondary-light transition-colors cursor-pointer text-black"
                          >
                            {role.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={handleCancelChangeRole}
                    className="px-5 py-2 border border-primary text-primary rounded-full text-sm font-medium hover:bg-primary-light transition-all whitespace-nowrap cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmChangeRole}
                    disabled={!changeRoleData.newRole}
                    className={`px-5 py-2 text-white font-medium text-sm rounded-full transition-all whitespace-nowrap ${
                      changeRoleData.newRole
                        ? 'bg-[#FF4000] hover:bg-[#E63900] cursor-pointer'
                        : 'bg-gray/30 cursor-not-allowed'
                    }`}
                    style={changeRoleData.newRole ? { boxShadow: '0 4px 12px rgba(255, 64, 0, 0.25)' } : {}}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            ) : showChangeRoleSuccess ? (
              <div className="p-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <img 
                    src={SuccessIcon} 
                    alt="Success" 
                    className="w-16 h-16 mb-4" 
                    style={{ filter: 'invert(48%) sepia(79%) saturate(2476%) hue-rotate(86deg) brightness(118%) contrast(119%)' }} 
                  />
                  <p className="text-lg font-semibold text-black">Role changed successfully</p>
                </div>
              </div>
            ) : (
              <div className="p-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <img 
                    src={ErrorIcon} 
                    alt="Error" 
                    className="w-16 h-16 mb-4"
                  />
                  <p className="text-lg font-semibold text-black">Failed to change role. Please try again</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Duplicate Role Warning Modal */}
      {isDuplicateRoleWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            {/* Warning Icon */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-[#FFF4E6] rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-[#FF4000]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            {/* Message */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold text-black mb-2">Rôle existant</h3>
              <p className="text-sm text-gray">
                Ce rôle existe déjà. Veuillez modifier le nom pour créer ce rôle.
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setIsDuplicateRoleWarning(false)}
              className="w-full px-6 py-3 bg-[#FF4000] hover:bg-[#E63900] text-white font-medium text-sm rounded-lg transition-all"
            >
              Compris
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountSettingsOrganizer;
