/**
 * Logger Utility for Intellex Framework
 * 
 * Provides standardized logging functionality across the framework.
 * Can be configured for different log levels and output formats.
 */

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
  TRACE: 4
};

// Default configuration
const DEFAULT_CONFIG = {
  level: process.env.LOG_LEVEL || 'INFO',
  colored: true,
  timestamp: true,
  prefix: 'INTELLEX'
};

// Current configuration
let config = { ...DEFAULT_CONFIG };

// Color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  underscore: '\x1b[4m',
  blink: '\x1b[5m',
  reverse: '\x1b[7m',
  hidden: '\x1b[8m',
  
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  
  bgBlack: '\x1b[40m',
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgWhite: '\x1b[47m'
};

// Map log levels to colors
const LEVEL_COLORS = {
  ERROR: COLORS.red,
  WARN: COLORS.yellow,
  INFO: COLORS.green,
  DEBUG: COLORS.cyan,
  TRACE: COLORS.magenta
};

/**
 * Configure the logger
 * @param {Object} options - Configuration options
 */
function configure(options = {}) {
  config = {
    ...config,
    ...options
  };
  
  // Convert string level to uppercase
  if (typeof config.level === 'string') {
    config.level = config.level.toUpperCase();
  }
}

/**
 * Format a log message
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 * @returns {string} - Formatted log message
 */
function formatLogMessage(level, message, data) {
  let logMessage = '';
  
  // Add timestamp if enabled
  if (config.timestamp) {
    const now = new Date();
    const timestamp = now.toISOString();
    logMessage += `[${timestamp}] `;
  }
  
  // Add prefix if configured
  if (config.prefix) {
    logMessage += `[${config.prefix}] `;
  }
  
  // Add log level
  logMessage += `[${level}] `;
  
  // Add color if enabled
  if (config.colored && LEVEL_COLORS[level]) {
    logMessage = LEVEL_COLORS[level] + logMessage;
  }
  
  // Add message
  logMessage += message;
  
  // Add data if provided
  if (data !== undefined) {
    if (typeof data === 'object') {
      try {
        logMessage += '\n' + JSON.stringify(data, null, 2);
      } catch (e) {
        logMessage += '\n[Object cannot be stringified]';
      }
    } else {
      logMessage += ' ' + data;
    }
  }
  
  // Reset color if enabled
  if (config.colored) {
    logMessage += COLORS.reset;
  }
  
  return logMessage;
}

/**
 * Log a message at the specified level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @param {Object} data - Additional data to log
 */
function log(level, message, data) {
  const levelValue = LOG_LEVELS[level] || 0;
  const configLevelValue = LOG_LEVELS[config.level] || 0;
  
  // Only log if the level is less than or equal to the configured level
  if (levelValue <= configLevelValue) {
    const formattedMessage = formatLogMessage(level, message, data);
    
    // Use the appropriate console method
    switch (level) {
      case 'ERROR':
        console.error(formattedMessage);
        break;
      case 'WARN':
        console.warn(formattedMessage);
        break;
      case 'DEBUG':
      case 'TRACE':
        console.debug(formattedMessage);
        break;
      case 'INFO':
      default:
        console.log(formattedMessage);
        break;
    }
  }
}

/**
 * Log an error message
 * @param {string} message - Error message
 * @param {Object|Error} data - Error object or additional data
 */
function error(message, data) {
  // If data is an Error, format it differently
  if (data instanceof Error) {
    log('ERROR', message, {
      message: data.message,
      stack: data.stack,
      name: data.name
    });
  } else {
    log('ERROR', message, data);
  }
}

/**
 * Log a warning message
 * @param {string} message - Warning message
 * @param {Object} data - Additional data
 */
function warn(message, data) {
  log('WARN', message, data);
}

/**
 * Log an info message
 * @param {string} message - Info message
 * @param {Object} data - Additional data
 */
function info(message, data) {
  log('INFO', message, data);
}

/**
 * Log a debug message
 * @param {string} message - Debug message
 * @param {Object} data - Additional data
 */
function debug(message, data) {
  log('DEBUG', message, data);
}

/**
 * Log a trace message
 * @param {string} message - Trace message
 * @param {Object} data - Additional data
 */
function trace(message, data) {
  log('TRACE', message, data);
}

module.exports = {
  configure,
  error,
  warn,
  info,
  debug,
  trace,
  LOG_LEVELS
}; 