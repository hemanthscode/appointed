import React, { useEffect, useState } from 'react';
import * as userService from '../../api/userService';
import Loader from '../../components/common/Loader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/common/Button';
import { formatDate } from '../../utils/formatDate';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Calendar, Clock, CheckCircle, Star, Phone, MapPin, FileText, BookOpen, MessageSquare, Settings } from 'lucide-react';

const InfoItem = ({ label, value, icon: Icon }) => (
  <div className="flex gap-3 items-center">
    <Icon className="w-6 h-6 text-gray-500 flex-shrink-0" aria-hidden="true" />
    <div className="flex-1 min-w-0">
      <p className="text-[10px] font-bold text-gray-500 uppercase mb-0.5">{label}</p>
      <p className="text-sm text-black font-medium truncate">{value || '—'}</p>
    </div>
  </div>
);

const StatCard = ({ label, value, icon: Icon }) => (
  <div className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
    <div>
      <p className="text-[10px] font-bold text-gray-500 uppercase">{label}</p>
      <p className="text-sm font-bold text-black mt-0.5 truncate">{value}</p>
    </div>
    <Icon className="w-6 h-6 text-gray-600" aria-hidden="true" />
  </div>
);

const ProfileView = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    userService.getProfile()
      .then(({ data }) => setProfile(data.data))
      .catch(() => toast.error('Failed to load profile'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <Loader size="xl" />
    </div>
  );

  if (!profile) return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-600 select-none">Profile not available</p>
    </div>
  );

  return (
    <main className="h-screen bg-gray-50 p-4 md:p-8 flex flex-col select-none max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="bg-white border-2 border-black rounded-3xl p-6 md:p-8 flex items-center gap-8 max-w-full">
        <Avatar
          src={profile.avatar ? `/uploads/avatars/${profile.avatar}` : null}
          alt={profile.name}
          size={112}
          className="border-4 border-black shadow-lg flex-shrink-0"
          showBorder
        />
        <div className="flex flex-col justify-center min-w-0 max-w-xl">
          <h1
            className="text-4xl font-extrabold text-black truncate"
            title={profile.name}
          >
            {profile.name}
          </h1>
          <p
            className="text-gray-600 text-base truncate max-w-full"
            title={profile.email}
          >
            {profile.email}
          </p>
          <div className="flex flex-wrap gap-3 mt-4">
            <Badge variant="primary">{profile.role.toUpperCase()}</Badge>
            <Badge variant={profile.status === 'active' ? 'success' : 'secondary'}>
              {profile.status.toUpperCase()}
            </Badge>
            {profile.isVerified && (
              <Badge variant="info" aria-label="Verified">VERIFIED</Badge>
            )}
          </div>
        </div>
        <div className="ml-auto flex flex-col gap-3">
          <Button
            onClick={() => navigate('/profile/edit')}
            size="md"
            aria-label="Edit Profile"
          >
            Edit Profile
          </Button>
          <Button
            onClick={() => navigate('/profile/change-password')}
            variant="outline"
            size="md"
            aria-label="Change Password"
          >
            Change Password
          </Button>
        </div>
      </section>

      {/* Details Section - Grid Layout */}
      <section className="mt-8 grid grid-cols-12 gap-8 flex-1 overflow-visible">

        {/* Main Content: Bio, Academic, Contact */}
        <div className="col-span-8 flex flex-col gap-6">

          {/* Bio */}
          {profile.bio && (
            <article className="bg-white border-2 border-black rounded-2xl p-6 max-h-[12rem] overflow-auto">
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5" aria-hidden="true" /> About
              </h2>
              <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap">
                {profile.bio}
              </p>
            </article>
          )}

          {/* Academic */}
          <article className="bg-white border-2 border-black rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <BookOpen className="w-5 h-5" aria-hidden="true" /> Academic
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <InfoItem label="Department" value={profile.department} icon={Calendar} />
              {profile.year && <InfoItem label="Year" value={profile.year} icon={BookOpen} />}
              <InfoItem label="Appointments" value={profile.appointmentsCount} icon={Calendar} />
              {profile.rating > 0 && (
                <InfoItem label="Rating" value={`${profile.rating.toFixed(1)} ⭐`} icon={Star} />
              )}
            </div>
          </article>

          {/* Contact */}
          <article className="bg-white border-2 border-black rounded-2xl p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5" aria-hidden="true" /> Contact
            </h2>
            <div className="grid grid-cols-2 gap-6">
              <InfoItem label="Email" value={profile.email} icon={Mail} />
              {profile.phone && <InfoItem label="Phone" value={profile.phone} icon={Phone} />}
              {profile.address && (
                <div className="col-span-2">
                  <InfoItem label="Address" value={profile.address} icon={MapPin} />
                </div>
              )}
            </div>
          </article>
        </div>

        {/* Sidebar with Activity and Quick Actions */}
        <aside className="col-span-4 flex flex-col gap-6 max-h-[42rem] overflow-visible border-2 border-black rounded-2xl p-6 bg-white">

          <article>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5" aria-hidden="true" /> Activity
            </h2>
            <div className="flex flex-col gap-4">
              <StatCard label="Joined" value={formatDate(profile.joinedDate)} icon={Calendar} />
              <StatCard label="Last Login" value={formatDate(profile.lastLogin, 'PPpp')} icon={Clock} />
              <StatCard
                label="Status"
                value={profile.status === 'active' ? '🟢 Active' : '🔴 Inactive'}
                icon={CheckCircle}
              />
            </div>
          </article>

          <article>
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5" aria-hidden="true" /> Quick Actions
            </h2>
            <div className="flex flex-col gap-3">
              <Button variant="outline" fullWidth onClick={() => navigate('/appointments')} aria-label="Go to Appointments">
                <Calendar className="inline w-4 h-4 mr-2" /> Appointments
              </Button>
              <Button variant="outline" fullWidth onClick={() => navigate('/messages')} aria-label="Go to Messages">
                <MessageSquare className="inline w-4 h-4 mr-2" /> Messages
              </Button>
              <Button variant="outline" fullWidth onClick={() => navigate('/settings')} aria-label="Go to Settings">
                <Settings className="inline w-4 h-4 mr-2" /> Settings
              </Button>
            </div>
          </article>

        </aside>
      </section>
    </main>
  );
};

export default ProfileView;
  