/**
 * Utility functions for managing cooldown periods for UI components
 */

/**
 * Check if a component is in cooldown period
 * @param key - Unique identifier for the component
 * @param cooldownMinutes - Number of minutes for cooldown period
 * @returns boolean - Whether the component should be shown or not
 */
export function shouldShowComponent(key: string, cooldownMinutes: number): boolean {
  // Skip cooldown check if running on server
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return true;
  }

  const lastShownTimestamp = localStorage.getItem(`${key}_last_shown`);
  
  // If no timestamp exists, component should be shown
  if (!lastShownTimestamp) {
    return true;
  }

  const lastShownDate = new Date(parseInt(lastShownTimestamp, 10));
  const currentDate = new Date();
  
  // Calculate difference in minutes
  const diffTime = currentDate.getTime() - lastShownDate.getTime();
  const diffMinutes = diffTime / (1000 * 60);
  
  // Return true if cooldown period has passed
  return diffMinutes >= cooldownMinutes;
}

/**
 * Mark a component as shown, starting its cooldown period
 * @param key - Unique identifier for the component
 */
export function markComponentAsShown(key: string): void {
  // Skip if running on server
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }

  localStorage.setItem(`${key}_last_shown`, Date.now().toString());
}

/**
 * Reset the cooldown period for a component
 * @param key - Unique identifier for the component
 */
export function resetComponentCooldown(key: string): void {
  // Skip if running on server
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
    return;
  }

  localStorage.removeItem(`${key}_last_shown`);
}
