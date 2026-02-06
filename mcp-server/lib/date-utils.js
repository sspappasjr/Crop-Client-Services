/**
 * Date Utilities for CropClient Irrigation System
 * Handles M/D/YY format parsing and formatting
 */

/**
 * Parse date in M/D/YY format to proper Date object
 * @param {string} dateStr - Date string in M/D/YY format (e.g., "9/23/25")
 * @returns {Date} Parsed Date object
 */
function parseEventDate(dateStr) {
  if (!dateStr || typeof dateStr !== 'string') {
    throw new Error('Invalid date string');
  }
  
  const parts = dateStr.split('/');
  if (parts.length !== 3) {
    throw new Error(`Invalid date format: ${dateStr}. Expected M/D/YY`);
  }
  
  const month = parseInt(parts[0]);
  const day = parseInt(parts[1]);
  const year = 2000 + parseInt(parts[2]);
  
  if (isNaN(month) || isNaN(day) || isNaN(year)) {
    throw new Error(`Invalid date components in: ${dateStr}`);
  }
  
  const result = new Date(year, month - 1, day);
  
  // Validate the date is real
  if (isNaN(result.getTime())) {
    throw new Error(`Invalid date: ${dateStr}`);
  }
  
  return result;
}

/**
 * Format Date object to M/D/YY string
 * @param {Date} date - Date object to format
 * @returns {string} Formatted date string (e.g., "9/23/25")
 */
function formatDate(date) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid Date object');
  }
  
  const year = String(date.getFullYear()).slice(-2);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  return `${month}/${day}/${year}`;
}

/**
 * Add days to a date
 * @param {Date} date - Starting date
 * @param {number} days - Number of days to add (can be decimal, will be rounded)
 * @returns {Date} New date with days added
 */
function addDaysToDate(date, days) {
  if (!(date instanceof Date) || isNaN(date.getTime())) {
    throw new Error('Invalid Date object');
  }
  
  const roundedDays = Math.round(parseFloat(days) || 0);
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + roundedDays);
  
  return newDate;
}

/**
 * Compare two dates
 * @param {Date} date1 - First date
 * @param {Date} date2 - Second date
 * @returns {number} -1 if date1 < date2, 0 if equal, 1 if date1 > date2
 */
function compareDates(date1, date2) {
  const time1 = date1.getTime();
  const time2 = date2.getTime();
  
  if (time1 < time2) return -1;
  if (time1 > time2) return 1;
  return 0;
}

/**
 * Get today's date in M/D/YY format
 * @returns {string} Today's date formatted
 */
function getTodayFormatted() {
  return formatDate(new Date());
}

/**
 * Check if a date string is valid M/D/YY format
 * @param {string} dateStr - Date string to validate
 * @returns {boolean} True if valid
 */
function isValidDateFormat(dateStr) {
  try {
    parseEventDate(dateStr);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  parseEventDate,
  formatDate,
  addDaysToDate,
  compareDates,
  getTodayFormatted,
  isValidDateFormat
};
