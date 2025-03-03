/**
 * Intellex Framework Utilities
 * 
 * This module provides utility functions used throughout the Intellex framework.
 * 
 * @module intellex/utils
 */

/**
 * Generate a random ID with a specified prefix
 * 
 * @param {string} prefix - Prefix for the ID
 * @returns {string} - Generated ID
 */
function generateId(prefix = 'id') {
  const timestamp = Date.now().toString(36);
  const randomStr = Math.random().toString(36).substring(2, 10);
  return `${prefix}-${timestamp}-${randomStr}`;
}

/**
 * Format a timestamp as an ISO string
 * 
 * @param {number|Date} timestamp - Timestamp to format
 * @returns {string} - Formatted timestamp
 */
function formatTimestamp(timestamp = Date.now()) {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  return date.toISOString();
}

/**
 * Validate an Ethereum address
 * 
 * @param {string} address - Ethereum address to validate
 * @returns {boolean} - Whether the address is valid
 */
function isValidEthereumAddress(address) {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Validate a NEAR account ID
 * 
 * @param {string} accountId - NEAR account ID to validate
 * @returns {boolean} - Whether the account ID is valid
 */
function isValidNearAccountId(accountId) {
  // NEAR account IDs must be at least 2 characters, only lowercase alphanumeric characters,
  // and can contain hyphens and underscores, but cannot start or end with them
  return /^(?=[a-z0-9])[a-z0-9-_]{2,}(?<=[a-z0-9])$/.test(accountId);
}

/**
 * Truncate a string to a specified length
 * 
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add if truncated
 * @returns {string} - Truncated string
 */
function truncateString(str, maxLength = 20, suffix = '...') {
  if (str.length <= maxLength) {
    return str;
  }
  
  return str.substring(0, maxLength - suffix.length) + suffix;
}

/**
 * Deep clone an object
 * 
 * @param {Object} obj - Object to clone
 * @returns {Object} - Cloned object
 */
function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * Sleep for a specified duration
 * 
 * @param {number} ms - Duration in milliseconds
 * @returns {Promise<void>} - Promise that resolves after the duration
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 * 
 * @param {Function} fn - Function to retry
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} initialDelay - Initial delay in milliseconds
 * @returns {Promise<any>} - Promise that resolves with the function result
 */
async function retry(fn, maxRetries = 3, initialDelay = 1000) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const delay = initialDelay * Math.pow(2, i);
      console.log(`Retry ${i + 1}/${maxRetries} failed. Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
  
  throw lastError;
}

/**
 * Format a number as a currency string
 * 
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code
 * @param {string} locale - Locale for formatting
 * @returns {string} - Formatted currency string
 */
function formatCurrency(amount, currency = 'USD', locale = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount);
}

/**
 * Convert from yoctoNEAR to NEAR
 * 
 * @param {string|number} yoctoNear - Amount in yoctoNEAR
 * @returns {string} - Amount in NEAR
 */
function yoctoToNear(yoctoNear) {
  const yoctoNearBigInt = BigInt(yoctoNear);
  const nearAmount = Number(yoctoNearBigInt) / 1e24;
  return nearAmount.toString();
}

/**
 * Convert from NEAR to yoctoNEAR
 * 
 * @param {string|number} near - Amount in NEAR
 * @returns {string} - Amount in yoctoNEAR
 */
function nearToYocto(near) {
  const nearFloat = parseFloat(near);
  const yoctoNearBigInt = BigInt(Math.round(nearFloat * 1e24));
  return yoctoNearBigInt.toString();
}

module.exports = {
  generateId,
  formatTimestamp,
  isValidEthereumAddress,
  isValidNearAccountId,
  truncateString,
  deepClone,
  sleep,
  retry,
  formatCurrency,
  yoctoToNear,
  nearToYocto,
}; 