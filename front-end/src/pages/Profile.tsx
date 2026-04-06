import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement profile update API call
    console.log('Profile update:', formData);
    setIsEditing(false);
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
                  alt="Profile" 
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#FF4000]/20 to-[#FF4000]/40 flex items-center justify-center">
                  <span className="text-3xl font-bold text-[#FF4000]">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
              <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#FF4000] rounded-full flex items-center justify-center text-white hover:bg-[#E63900] transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-black mb-1">{user?.name || 'User'}</h1>
              <p className="text-[#757575] text-sm mb-2">{user?.email}</p>
              <span className="inline-block px-3 py-1 bg-[#FF4000]/10 text-[#FF4000] text-xs font-medium rounded-full">
                {user?.roles?.includes('organizer') ? 'Organizer' : 'Attendee'}
              </span>
            </div>

            {/* Edit Button */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2.5 bg-[#FF4000] text-white font-semibold rounded-full hover:bg-[#E63900] transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Profile Form */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-black mb-6">Personal Information</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                Full Name
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
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!isEditing}
                className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg text-black disabled:bg-[#F8F8F8] disabled:cursor-not-allowed focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={!isEditing}
                placeholder="Add your phone number"
                className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg text-black disabled:bg-[#F8F8F8] disabled:cursor-not-allowed focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-[#4F4F4F] mb-2">
                Bio
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                disabled={!isEditing}
                placeholder="Tell us about yourself"
                rows={4}
                className="w-full px-4 py-3 border border-[#EEEEEE] rounded-lg text-black disabled:bg-[#F8F8F8] disabled:cursor-not-allowed focus:outline-none focus:border-[#FF4000] focus:ring-2 focus:ring-[#FF4000]/10 transition-all resize-none"
              />
            </div>

            {/* Action Buttons */}
            {isEditing && (
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-[#FF4000] text-white font-semibold rounded-full hover:bg-[#E63900] transition-colors"
                >
                  Save Changes
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
                  Cancel
                </button>
              </div>
            )}
          </form>
        </div>

        {/* Account Settings */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
          <h2 className="text-xl font-bold text-black mb-6">Account Settings</h2>
          
          <div className="space-y-4">
            <button className="w-full flex items-center justify-between px-4 py-3 border border-[#EEEEEE] rounded-lg hover:bg-[#F8F8F8] transition-colors">
              <span className="text-sm font-medium text-[#4F4F4F]">Change Password</span>
              <svg className="w-5 h-5 text-[#BCBCBC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button className="w-full flex items-center justify-between px-4 py-3 border border-[#EEEEEE] rounded-lg hover:bg-[#F8F8F8] transition-colors">
              <span className="text-sm font-medium text-[#4F4F4F]">Privacy Settings</span>
              <svg className="w-5 h-5 text-[#BCBCBC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button className="w-full flex items-center justify-between px-4 py-3 border border-[#EEEEEE] rounded-lg hover:bg-[#F8F8F8] transition-colors">
              <span className="text-sm font-medium text-[#4F4F4F]">Notification Preferences</span>
              <svg className="w-5 h-5 text-[#BCBCBC]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
