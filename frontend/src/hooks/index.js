// Export all hooks
export { useAuth, AuthProvider } from './useAuth';
export { default as useLocalStorage, useLocalStorageState, useLocalStorageWithExpiry } from './useLocalStorage';
export { 
  default as useApi, 
  useAppointments, 
  useTeachers, 
  useMessages, 
  useProfile,
  useMutation,
  useCreateAppointment,
  useUpdateAppointment,
  useDeleteAppointment,
  useSendMessage,
  useUpdateProfile,
  usePaginatedApi,
  useOptimisticMutation
} from './useApi';

