import { useState, useEffect } from 'react';

/**
 * Debounce hook to limit the rate of invoking a function
 * @param value - The value to debounce
 * @param delay - Delay in ms
 */
export const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
