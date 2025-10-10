import React, { createContext, useContext, useEffect } from 'react';
import {socketService} from '../services';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) throw new Error('useSocket must be used within SocketProvider');
  return context;
};

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      socketService.initialize(user.token || user.accessToken);
    }

    return () => {
      socketService.disconnect();
    };
  }, [user]);

  return <SocketContext.Provider value={socketService}>{children}</SocketContext.Provider>;
};

export default SocketContext;
