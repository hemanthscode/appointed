import { useEffect, useState } from 'react';
import { useAuth as useAuthContext } from '../contexts/AuthContext';

export default function useAuth() {
  const { user, loading, authLoading, login, register, logout, updateUserProfile } = useAuthContext();
  return { user, loading, authLoading, login, register, logout, updateUserProfile };
}
