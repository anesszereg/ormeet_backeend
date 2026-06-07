import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import organizerService from '../services/organizerService';
import Navbar from '../components/Navbar';

const Profile = () => {
  const { t } = useTranslation(['attendee', 'common']);
  const { user, setUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });

  // Avatar upload
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Change password modal
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);
    try {
      const updated = await authService.updateProfile({
        name: formData.name,
        phone: formData.phone || undefined,
        bio: formData.bio || undefined,
      });
      setUser({ ...(user as any), ...updated });
      setIsEditing(false);
      setFeedback({ type: 'success', message: t('profile.updateSuccess', { defaultValue: 'Profile updated successfully.' }) });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || t('profile.updateError', { defaultValue: 'Failed to update profile. Please try again.' }),
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    setFeedback(null);
    try {
      const urls = await organizerService.uploadImages([file]);
      if (urls.length > 0) {
        const updated = await authService.updateProfile({ avatarUrl: urls[0] });
        setUser({ ...(user as any), ...updated });
        setFeedback({ type: 'success', message: t('profile.photoUpdated', { defaultValue: 'Profile photo updated.' }) });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.response?.data?.message || t('profile.photoError', { defaultValue: 'Failed to upload photo.' }),
      });
    } finally {
      setIsUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (passwordData.newPassword.length < 8) {
      setPasswordError(t('profile.passwordTooShort', { defaultValue: 'New password must be at least 8 characters.' }));
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError(t('profile.passwordMismatch', { defaultValue: 'Passwords do not match.' }));
      return;
    }
    setIsChangingPassword(true);
    try {
      await authService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });
      setIsPasswordModalOpen(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setFeedback({ type: 'success', message: t('profile.passwordChanged', { defaultValue: 'Password changed successfully.' }) });
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message || t('profile.passwordChangeError', { defaultValue: 'Failed to change password.' }));
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex items-center gap-6">
            {/* Profile Photo */}
            <div className="relative">
              {user?.avatarUrl ? (
                <img 
                  src={user.avatarUrl} 
                  alt={t('profile.photoAlt')} 
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF4000]/20 to-[#FF4000]/40 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#FF4000]">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={handleAvatarClick}
                disabled={isUploadingAvatar}
                className="absolute bottom-0 end-0 w-8 h-8 bg-[#FF4000] rounded-full flex items-center justify-center text-white hover:bg-[#E63900] transition-colors disabled:opacity-60"
              >
                {isUploadingAvatar ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                  </svg>
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                className="hidden"
              />
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-black mb-1">{user?.name || 'User'}</h1>
              <p className="text-[#757575] text-sm mb-2">{user?.email}</p>
              <span className="inline-block px-3 py-1 bg-[#FF4000]/10 text-[#FF4000] text-xs font-medium rounded-full">
                {user?.role === 'organizer' ? t('profile.roleOrganizer') : t('profile.roleAttendee')}
              </span>
            </div>

            {/* Edit Button */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-[#FF4000] text-white font-semibold rounded-full hover:bg-[#E63900] transition-colors"
              >
                {t('profile.editProfile')}
              </button>
            )}
          </div>
        </div>

        {/* Feedback banner */}
        {feedback && (
          <div
            className={`mb-6 px-4 py-3 rounded-lg text-sm font-medium ${
              feedback.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}
          >
            {feedback.message}
          </div>
        )}

        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-black mb-6">{t('profile.personalInfo')}</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                {t('profile.fullName')}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg text-black disabled:bg-[#F8F8F8] disabled:cursor-not-allowed focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                {t('profile.emailAddress')}
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                title={t('profile.emailLocked', { defaultValue: 'Email cannot be changed here.' })}
                className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg text-black bg-[#F8F8F8] cursor-not-allowed focus:outline-none transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                {t('profile.phoneNumber')}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                placeholder={t('profile.phonePlaceholder')}
                className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg text-black disabled:bg-[#F8F8F8] disabled:cursor-not-allowed focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                {t('profile.bio')}
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                placeholder={t('profile.bioPlaceholder')}
                rows={4}
                className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg text-black disabled:bg-[#F8F8F8] disabled:cursor-not-allowed focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all resize-none"
              />
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-6 py-3 bg-[#FF4000] text-white font-semibold rounded-full hover:bg-[#E63900] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isSaving ? t('profile.saving', { defaultValue: 'Saving...' }) : t('profile.saveChanges')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || '',
                      email: user?.email || '',
                      phone: user?.phone || '',
                      bio: user?.bio || '',
                    });
                  }}
                  className="flex-1 px-6 py-3 bg-white text-black font-semibold rounded-full border-2 border-[#EEEEEE] hover:bg-[#F8F8F8] transition-colors"
                >
                  {t('common:cta.cancel')}
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
          <h2 className="text-xl font-bold text-black mb-6">{t('profile.accountSettings')}</h2>
          
          <div className="space-y-4">
            <button
              onClick={() => { setIsPasswordModalOpen(true); setPasswordError(''); }}
              className="w-full flex items-center justify-between px-4 py-3 border border-[#EEEEEE] rounded-lg hover:bg-[#F8F8F8] transition-colors"
            >
              <span className="text-sm font-medium text-[#4F4F4F]">{t('profile.changePassword')}</span>
              <svg className="w-5 h-5 text-[#BCBCBC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button className="w-full flex items-center justify-between px-4 py-3 border border-[#EEEEEE] rounded-lg hover:bg-[#F8F8F8] transition-colors">
              <span className="text-sm font-medium text-[#4F4F4F]">{t('profile.privacySettings')}</span>
              <svg className="w-5 h-5 text-[#BCBCBC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button className="w-full flex items-center justify-between px-4 py-3 border border-[#EEEEEE] rounded-lg hover:bg-[#F8F8F8] transition-colors">
              <span className="text-sm font-medium text-[#4F4F4F]">{t('profile.notificationPreferences')}</span>
              <svg className="w-5 h-5 text-[#BCBCBC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          role="dialog"
          aria-modal="true"
          onClick={() => setIsPasswordModalOpen(false)}
        >
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-black mb-4">{t('profile.changePassword')}</h2>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                  {t('profile.currentPassword', { defaultValue: 'Current Password' })}
                </label>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg text-black focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                  {t('profile.newPassword', { defaultValue: 'New Password' })}
                </label>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg text-black focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                  {t('profile.confirmPassword', { defaultValue: 'Confirm New Password' })}
                </label>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg text-black focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all"
                />
              </div>
              {passwordError && <p className="text-sm text-[#FF3425]">{passwordError}</p>}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="flex-1 px-6 py-3 bg-[#FF4000] text-white font-semibold rounded-full hover:bg-[#E63900] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? t('profile.saving', { defaultValue: 'Saving...' }) : t('profile.changePassword')}
                </button>
                <button
                  type="button"
                  onClick={() => { setIsPasswordModalOpen(false); setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' }); }}
                  className="flex-1 px-6 py-3 bg-white text-black font-semibold rounded-full border-2 border-[#EEEEEE] hover:bg-[#F8F8F8] transition-colors"
                >
                  {t('common:cta.cancel')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
