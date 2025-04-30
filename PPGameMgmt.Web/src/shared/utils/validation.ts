/**
 * Check if a string is a valid email
 * @param email Email address to validate
 * @returns Whether the email is valid
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Check if a string is empty or contains only whitespace
 * @param value String to check
 * @returns Whether the string is empty or whitespace-only
 */
export const isEmptyString = (value: string | null | undefined): boolean => {
  return value === null || value === undefined || value.trim() === '';
};

/**
 * Check if a value is a valid number
 * @param value Value to check
 * @returns Whether the value is a valid number
 */
export const isValidNumber = (value: any): boolean => {
  if (typeof value === 'number') {
    return !isNaN(value) && isFinite(value);
  }
  if (typeof value === 'string') {
    const num = Number(value);
    return !isNaN(num) && isFinite(num);
  }
  return false;
};

/**
 * Check if a value is a valid positive number
 * @param value Value to check
 * @returns Whether the value is a valid positive number
 */
export const isPositiveNumber = (value: any): boolean => {
  return isValidNumber(value) && Number(value) > 0;
};

/**
 * Check if a value is a valid date
 * @param value Value to check
 * @returns Whether the value is a valid date
 */
export const isValidDate = (value: any): boolean => {
  if (value instanceof Date) {
    return !isNaN(value.getTime());
  }
  if (typeof value === 'string') {
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
  return false;
};

/**
 * Check if a date is in the future
 * @param date Date to check
 * @returns Whether the date is in the future
 */
export const isFutureDate = (date: Date | string): boolean => {
  if (!isValidDate(date)) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj > new Date();
};

/**
 * Check if a date is in the past
 * @param date Date to check
 * @returns Whether the date is in the past
 */
export const isPastDate = (date: Date | string): boolean => {
  if (!isValidDate(date)) return false;
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj < new Date();
};

/**
 * Validate a string has a minimum length
 * @param value String to check
 * @param minLength Minimum length required
 * @returns Whether the string meets the minimum length
 */
export const hasMinLength = (value: string, minLength: number): boolean => {
  return value?.length >= minLength;
};

/**
 * Validate a string doesn't exceed a maximum length
 * @param value String to check
 * @param maxLength Maximum length allowed
 * @returns Whether the string meets the maximum length
 */
export const hasMaxLength = (value: string, maxLength: number): boolean => {
  return value?.length <= maxLength;
};