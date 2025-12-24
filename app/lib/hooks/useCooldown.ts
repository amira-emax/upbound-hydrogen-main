import {useState, useEffect} from 'react';
import {shouldShowComponent, markComponentAsShown, resetComponentCooldown} from '../cooldown';

/**
 * Hook to manage component cooldown periods
 * @param key - Unique identifier for the component
 * @param cooldownMinutes - Number of minutes for cooldown period
 * @param initialDelay - Optional delay in ms before showing the component
 * @returns [isVisible, setIsVisible, resetCooldown] - State and functions to control visibility
 */
export function useCooldown(
  key: string,
  cooldownMinutes: number,
  initialDelay = 0
): [boolean, (value: boolean) => void, () => void] {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if we should show the component based on cooldown period
    const shouldShow = shouldShowComponent(key, cooldownMinutes);
    
    if (shouldShow) {
      // If there's an initial delay, use setTimeout
      if (initialDelay > 0) {
        const timer = setTimeout(() => {
          setIsVisible(true);
          markComponentAsShown(key);
        }, initialDelay);
        
        return () => clearTimeout(timer);
      } else {
        // Otherwise show immediately
        setIsVisible(true);
        markComponentAsShown(key);
      }
    }
  }, [key, cooldownMinutes, initialDelay]);

  // Function to hide the component
  const hideComponent = (value: boolean) => {
    setIsVisible(value);
  };

  // Function to reset the cooldown
  const resetCooldown = () => {
    resetComponentCooldown(key);
  };

  return [isVisible, hideComponent, resetCooldown];
}
