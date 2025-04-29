type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  level: LogLevel;
  enableRemoteLogging: boolean;
  remoteLoggingUrl?: string;
}

class Logger {
  private options: LoggerOptions;
  
  constructor(options: Partial<LoggerOptions> = {}) {
    this.options = {
      level: (import.meta.env.VITE_LOG_LEVEL as LogLevel) || 'info',
      enableRemoteLogging: import.meta.env.MODE === 'production',
      remoteLoggingUrl: import.meta.env.VITE_LOGGING_URL,
      ...options
    };
  }
  
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    
    return levels[level] >= levels[this.options.level];
  }
  
  private async sendToRemoteLogger(level: LogLevel, ...args: any[]) {
    if (!this.options.enableRemoteLogging || !this.options.remoteLoggingUrl) {
      return;
    }
    
    try {
      const body = JSON.stringify({
        level,
        message: args.map(arg => {
          if (arg instanceof Error) {
            return {
              name: arg.name,
              message: arg.message,
              stack: arg.stack
            };
          } else if (typeof arg === 'object') {
            return JSON.stringify(arg);
          }
          return String(arg);
        }).join(' '),
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      });
      
      // Use sendBeacon if available for reliability during page unload
      if (navigator.sendBeacon) {
        navigator.sendBeacon(this.options.remoteLoggingUrl, body);
      } else {
        // Fall back to fetch
        await fetch(this.options.remoteLoggingUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body,
          // Keep-alive to ensure the request completes even if page unloads
          keepalive: true
        });
      }
    } catch (e) {
      // Silent fail for logging errors
      console.error('Failed to send logs to remote server:', e);
    }
  }
  
  debug(...args: any[]) {
    if (this.shouldLog('debug')) {
      console.debug(...args);
      this.sendToRemoteLogger('debug', ...args);
    }
  }
  
  info(...args: any[]) {
    if (this.shouldLog('info')) {
      console.info(...args);
      this.sendToRemoteLogger('info', ...args);
    }
  }
  
  warn(...args: any[]) {
    if (this.shouldLog('warn')) {
      console.warn(...args);
      this.sendToRemoteLogger('warn', ...args);
    }
  }
  
  error(...args: any[]) {
    if (this.shouldLog('error')) {
      console.error(...args);
      this.sendToRemoteLogger('error', ...args);
    }
  }
}

export const logger = new Logger();