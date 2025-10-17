import { useContext, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useSocket } from '../contexts/SocketContext';

export const useSocketEvents = (events) => {
  const { on, off } = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    Object.entries(events).forEach(([event, handler]) => {
      on(event, handler);
    });

    return () => {
      Object.entries(events).forEach(([event, handler]) => {
        off(event, handler);
      });
    };
  }, [on, off, events, user]);
};
