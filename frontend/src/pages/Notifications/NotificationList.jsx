import React, { useEffect, useState } from 'react';
import * as notificationService from '../../api/notificationService';
import Loader from '../../components/common/Loader';

const NotificationList = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    setLoading(true);
    notificationService
      .fetchNotifications()
      .then(({ data }) => setNotifications(data.data.notifications))
      .catch(() => setError('Failed to load notifications'))
      .finally(() => setLoading(false));
  };

  if (loading) return <Loader className="mx-auto mt-20" />;
  if (error) return <p className="text-red-600">{error}</p>;
  if (notifications.length === 0) return <p className="text-black p-4">No notifications.</p>;

  return (
    <main className="p-4 max-w-md mx-auto text-black">
      <h1 className="text-3xl font-bold mb-6">Notifications</h1>
      <ul className="space-y-3">
        {notifications.map(({ _id, title, message, isRead }) => (
          <li key={_id} className={`border border-black rounded p-3 ${isRead ? 'bg-white' : 'bg-gray-200'}`}>
            <h3 className="font-semibold">{title}</h3>
            <p>{message}</p>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default NotificationList;
