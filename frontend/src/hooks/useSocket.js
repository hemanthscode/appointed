import { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import socketService from '../services/socket';

const useSocket = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      socketService.initialize(user.token || user.accessToken);
    } else {
      socketService.disconnect();
    }

    return () => {
      socketService.disconnect();
    };
  }, [user]);

  return socketService;
};

export default useSocket;
