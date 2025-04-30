/**
 * Format a date string to a localized date representation
 * @param dateString The date string to format
 * @returns A formatted date string or "N/A" if not provided
 */
export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return 'N/A';
  
  // Create date options for consistent formatting
  const options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  return new Date(dateString).toLocaleDateString(undefined, options);
};

/**
 * Format a duration in seconds to a human-readable time string
 * @param durationInSeconds The duration in seconds
 * @returns A formatted duration string (e.g., "2 hours 30 minutes")
 */
export const formatDuration = (durationInSeconds: number): string => {
  if (durationInSeconds < 60) {
    return `${durationInSeconds} sec`;
  }
  
  const minutes = Math.floor(durationInSeconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
  }
  
  return `${hours} ${hours === 1 ? 'hour' : 'hours'} ${remainingMinutes} min`;
};