import { format, parseISO } from 'date-fns';

export const formatDate = (dateString, fmt = 'PP') => {
  try {
    return format(parseISO(dateString), fmt);
  } catch {
    return dateString;
  }
};

export const formatTime = (timeString) => {
  try {
    return format(parseISO(timeString), 'p');
  } catch {
    return timeString;
  }
};
