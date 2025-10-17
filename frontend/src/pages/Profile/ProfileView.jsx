import React, { useEffect, useState } from 'react';
import * as userService from '../../api/userService';
import Loader from '../../components/common/Loader';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/common/Button';
import { formatDate } from '../../utils/formatDate';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const ProfileView = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    userService
      .getProfile()
      .then(({ data }) => setProfile(data.data))
      .catch(() => {
        setError('Failed to load profile');
        toast.error('Failed to load profile');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader className="mx-auto mt-20" />;
  if (error) return <p className="text-red-600 text-center mt-10">{error}</p>;
  if (!profile) return <p className="text-center mt-10">Profile not available.</p>;

  return (
    <main className="max-w-lg mx-auto mt-12 p-6 bg-white border border-black rounded shadow-sm text-black">
      <header className="flex flex-col items-center mb-6">
        <Avatar
          src={profile.avatar ? `/uploads/avatars/${profile.avatar}` : null}
          alt={profile.name}
          size={96}
          className="mb-4"
        />
        <h1 className="text-4xl font-bold">{profile.name}</h1>
        <div className="flex space-x-2 mt-2">
          <Badge color="black">{profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}</Badge>
          <Badge color={profile.status === 'active' ? 'black' : 'white'}>
            {profile.status.charAt(0).toUpperCase() + profile.status.slice(1)}
          </Badge>
        </div>
      </header>
      <section className="space-y-4 text-base">
        <div>
          <strong>Email:</strong> <span className="ml-2">{profile.email}</span>
        </div>
        <div>
          <strong>Department:</strong> <span className="ml-2">{profile.department}</span>
        </div>
        {profile.year && (
          <div>
            <strong>Year:</strong> <span className="ml-2">{profile.year}</span>
          </div>
        )}
        {profile.bio && (
          <div>
            <strong>Bio:</strong>
            <p className="mt-1 whitespace-pre-wrap">{profile.bio}</p>
          </div>
        )}
        {profile.phone && (
          <div>
            <strong>Phone:</strong> <span className="ml-2">{profile.phone}</span>
          </div>
        )}
        {profile.address && (
          <div>
            <strong>Address:</strong> <span className="ml-2">{profile.address}</span>
          </div>
        )}
        <div>
          <strong>Appointments:</strong> <span className="ml-2">{profile.appointmentsCount}</span>
        </div>
        <div>
          <strong>Joined:</strong> <span className="ml-2">{formatDate(profile.joinedDate)}</span>
        </div>
        <div>
          <strong>Last Login:</strong>{' '}
          <span className="ml-2">{formatDate(profile.lastLogin, 'PPpp')}</span>
        </div>
      </section>
      <footer className="mt-8 flex justify-center space-x-4">
        <Button onClick={() => navigate('/profile/edit')} ariaLabel="Edit Profile" className="min-w-[120px]">
          Edit Profile
        </Button>
        <Button
          onClick={() => navigate('/profile/change-password')}
          ariaLabel="Change Password"
          className="bg-white text-black border border-black hover:bg-black hover:text-white transition min-w-[140px]"
        >
          Change Password
        </Button>
      </footer>
    </main>
  );
};

export default ProfileView;
