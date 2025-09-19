import { useState, useEffect, useCallback } from 'react';
import { safeParseJSON, safeStringifyJSON } from '../utils/helpers';

const useLocalStorage = (key, initialValue) => {
  // Get value from localStorage or use initial value
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? safeParseJSON(item, initialValue) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage
  const setValue = useCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to localStorage
      if (typeof window !== 'undefined') {
        if (valueToStore === undefined || valueToStore === null) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, safeStringifyJSON(valueToStore));
        }
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Listen for changes to this key in other tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== null) {
        try {
          const newValue = safeParseJSON(e.newValue, initialValue);
          setStoredValue(newValue);
        } catch (error) {
          console.warn(`Error parsing localStorage change for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};

export default useLocalStorage;

// Hook for managing multiple localStorage keys
export const useLocalStorageState = (keys) => {
  const [state, setState] = useState({});

  useEffect(() => {
    const initialState = {};
    keys.forEach(({ key, initialValue }) => {
      try {
        const item = localStorage.getItem(key);
        initialState[key] = item ? safeParseJSON(item, initialValue) : initialValue;
      } catch (error) {
        console.warn(`Error reading localStorage key "${key}":`, error);
        initialState[key] = initialValue;
      }
    });
    setState(initialState);
  }, []);

  const updateState = useCallback((key, value) => {
    setState(prev => {
      const newState = { ...prev, [key]: value };
      
      try {
        if (value === undefined || value === null) {
          localStorage.removeItem(key);
        } else {
          localStorage.setItem(key, safeStringifyJSON(value));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
      
      return newState;
    });
  }, []);

  const removeState = useCallback((key) => {
    setState(prev => {
      const newState = { ...prev };
      delete newState[key];
      
      try {
        localStorage.removeItem(key);
      } catch (error) {
        console.warn(`Error removing localStorage key "${key}":`, error);
      }
      
      return newState;
    });
  }, []);

  return [state, updateState, removeState];
};

// Hook for localStorage with expiration
export const useLocalStorageWithExpiry = (key, initialValue, ttl = 86400000) => { // default 24 hours
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = localStorage.getItem(key);
      if (!item) return initialValue;

      const parsed = safeParseJSON(item);
      if (parsed && parsed.expiry && Date.now() > parsed.expiry) {
        localStorage.removeItem(key);
        return initialValue;
      }

      return parsed ? parsed.value : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);

      if (typeof window !== 'undefined') {
        const item = {
          value: valueToStore,
          expiry: Date.now() + ttl
        };
        localStorage.setItem(key, safeStringifyJSON(item));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue, ttl]);

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
};
