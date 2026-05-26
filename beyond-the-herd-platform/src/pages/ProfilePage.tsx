import React, { useState } from 'react';
import { useAuthStore } from '../store/auth';
import { supabase, authErrorMessage } from '../lib/supabase';
import { updateProfile } from '../lib/data';
import { uploadAvatar } from '../lib/storage';
import { User, Mail, MapPin, Phone, Edit3, Settings, AlertCircle, Key } from 'lucide-react';

export function ProfilePage() {
  const { user, refreshProfile } = useAuthStore();
  const [activeTab, setActiveTab] = useState('personal');
  const [name, setName] = useState(user?.name || '');
  const [photoUrl, setPhotoUrl] = useState(user?.photoUrl || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [location, setLocation] = useState(user?.location || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [resetMessage, setResetMessage] = useState({ text: '', type: '' });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ text: '', type: '' });

  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingPhoto(true);
    try {
      const publicUrl = await uploadAvatar(user.id, file);
      setPhotoUrl(publicUrl);
      await updateProfile({ photo_url: publicUrl });
      await refreshProfile();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to upload profile picture.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ text: 'Password must be at least 6 characters.', type: 'error' });
      return;
    }
    setPasswordLoading(true);
    setPasswordMessage({ text: '', type: '' });
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordMessage({ text: 'Password updated successfully.', type: 'success' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMessage({ text: authErrorMessage(err), type: 'error' });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setMessage({ text: '', type: '' });
    try {
      await updateProfile({ name, bio, location, phone, photo_url: photoUrl });
      await refreshProfile();
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch {
      setMessage({ text: 'Failed to update profile.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setResetMessage({ text: 'Password reset email sent! Check your inbox.', type: 'success' });
    } catch {
      setResetMessage({ text: 'Failed to send password reset email.', type: 'error' });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-black text-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-display font-bold">Account Settings</h1>
          <p className="text-gray-400 mt-2">Manage your profile details and account security.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="bg-[#0B0F19] border border-white/5 rounded-2xl p-6 flex flex-col items-center">
              <div className="w-32 h-32 bg-zinc-800 rounded-lg flex items-center justify-center text-4xl font-bold overflow-hidden border border-white/10 mb-4">
                {photoUrl ? (
                  <img src={photoUrl} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user.name.charAt(0).toUpperCase()
                )}
              </div>
              <h2 className="text-xl font-bold text-center">{user.name}</h2>
              <label className={`mt-4 w-full flex items-center justify-center gap-2 border border-white/10 hover:bg-white/5 text-sm py-2 rounded-lg cursor-pointer text-gray-300 ${uploadingPhoto ? 'opacity-50 pointer-events-none' : ''}`}>
                <Edit3 size={14} /> {uploadingPhoto ? 'Uploading…' : 'Upload Profile Picture'}
                <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handlePhotoUpload} disabled={uploadingPhoto} />
              </label>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-yellow-500 w-full bg-yellow-500/10 py-2 rounded-lg">
                <Mail size={14} />
                <span className="truncate">{user.email}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 space-y-6">
            <div className="border-b border-white/10 mb-6 flex gap-8">
              {(['personal', 'password', 'notifications'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 border-b-2 text-sm font-medium capitalize cursor-pointer ${
                    activeTab === tab
                      ? 'border-yellow-500 text-white'
                      : 'border-transparent text-gray-400'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {activeTab === 'personal' && (
              <div className="bg-[#0B0F19] border border-white/5 rounded-2xl p-8">
                <form onSubmit={handleUpdate} className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Edit3 size={20} className="text-yellow-500" /> Personal Information
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-gray-400 mb-2">Email</label>
                      <input
                        type="email"
                        value={user.email}
                        disabled
                        className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-yellow-500"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm text-gray-400 mb-2">Bio</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white h-24 resize-none focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Location</label>
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-yellow-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-2">Phone</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white focus:border-yellow-500"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-800">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-yellow-500 text-black px-8 py-3 rounded-xl font-bold hover:bg-yellow-400 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                    {message.text && (
                      <span
                        className={`text-sm ${message.type === 'success' ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {message.text}
                      </span>
                    )}
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'password' && (
              <div className="bg-[#0B0F19] border border-white/5 rounded-2xl p-8">
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Key size={20} className="text-yellow-500" /> Change Password
                  </h3>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">Confirm Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-black border border-gray-800 rounded-xl px-4 py-3 text-white"
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className="bg-yellow-500 text-black px-6 py-2.5 rounded-xl font-bold disabled:opacity-50"
                    >
                      {passwordLoading ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      className="text-yellow-500 hover:text-yellow-400 text-sm font-medium"
                    >
                      Send Reset Email
                    </button>
                    {passwordMessage.text && (
                      <span
                        className={`text-sm ${passwordMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {passwordMessage.text}
                      </span>
                    )}
                    {resetMessage.text && (
                      <span
                        className={`text-sm ${resetMessage.type === 'success' ? 'text-green-400' : 'text-red-400'}`}
                      >
                        {resetMessage.text}
                      </span>
                    )}
                  </div>
                </form>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="bg-[#0B0F19] border border-white/5 rounded-2xl p-8">
                <h3 className="text-xl font-bold flex items-center gap-2 mb-6">
                  <Settings size={20} className="text-yellow-500" /> Notifications
                </h3>
                <p className="text-gray-500 text-sm">Notification preferences coming soon.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
