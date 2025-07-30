const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor(level = 'INFO') {
    this.level = LOG_LEVELS[level.toUpperCase()] || LOG_LEVELS.INFO;
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };
    return JSON.stringify(logEntry);
  }

  writeToFile(level, message) {
    const filename = `${level.toLowerCase()}.log`;
    const filepath = path.join(logsDir, filename);
    
    fs.appendFileSync(filepath, message + '\n', 'utf8');
  }

  log(level, message, meta = {}) {
    const logLevel = LOG_LEVELS[level.toUpperCase()];
    
    if (logLevel <= this.level) {
      const formattedMessage = this.formatMessage(level, message, meta);
      
      // Console output with colors
      if (process.env.NODE_ENV !== 'production') {
        const colors = {
          ERROR: '\x1b[31m', // Red
          WARN: '\x1b[33m',  // Yellow
          INFO: '\x1b[36m',  // Cyan
          DEBUG: '\x1b[35m'  // Magenta
        };
        
        console.log(
          `${colors[level]}[${level}]\x1b[0m ${new Date().toISOString()} - ${message}`,
          Object.keys(meta).length > 0 ? meta : ''
        );
      }
      
      // Write to file
      this.writeToFile(level, formattedMessage);
    }
  }

  error(message, meta = {}) {
    this.log('ERROR', message, meta);
  }

  warn(message, meta = {}) {
    this.log('WARN', message, meta);
  }

  info(message, meta = {}) {
    this.log('INFO', message, meta);
  }

  debug(message, meta = {}) {
    this.log('DEBUG', message, meta);
  }
}

// Create logger instance
const logger = new Logger(process.env.LOG_LEVEL || 'INFO');

// Express middleware for request logging
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip
    };
    
    if (res.statusCode >= 400) {
      logger.warn(`HTTP ${res.statusCode}`, logData);
    } else {
      logger.info(`HTTP ${res.statusCode}`, logData);
    }
  });
  
  next();
};

module.exports = {
  logger,
  requestLogger
};
