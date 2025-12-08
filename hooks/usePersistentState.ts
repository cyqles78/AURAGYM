import React, { useState, useEffect } from 'react';

export function usePersistentState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
    }
    return defaultValue;
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn(`Error writing localStorage key "${key}":`, error);
    }
  }, [key, value]);

  return [value, setValue];
}