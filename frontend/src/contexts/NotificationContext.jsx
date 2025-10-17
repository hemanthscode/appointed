import React, { createContext, useContext, useState, useCallback } from 'react';
import { toast } from 'react-toastify';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    setNotifications((prev) => [...prev, notification]);
    toast.info(notification.message || notification.title || 'Notification');
  }, []);

  const notifyError = useCallback((message) => {
    toast.error(message);
  }, []);

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const value = { notifications, addNotification, notifyError, removeNotification };

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

export default NotificationContext;
