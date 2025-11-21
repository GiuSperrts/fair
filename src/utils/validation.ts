// Input validation and sanitization utilities

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitizedValue?: string;
}

export interface ValidationOptions {
  maxLength?: number;
  minLength?: number;
  required?: boolean;
  pattern?: RegExp;
  customValidator?: (value: string) => ValidationResult;
}

// Sanitization functions
export const sanitize = {
  // Remove potentially dangerous characters
  text: (input: string): string => {
    return input
      .replace(/[<>]/g, '') // Remove angle brackets
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/data:/gi, '') // Remove data: protocol
      .trim();
  },

  // Sanitize URL
  url: (input: string): string => {
    try {
      const url = new URL(input.startsWith('http') ? input : `https://${input}`);
      return url.toString();
    } catch {
      return input.replace(/[^a-zA-Z0-9:/?._-]/g, '');
    }
  },

  // Sanitize email
  email: (input: string): string => {
    return input.toLowerCase().trim().replace(/[^a-zA-Z0-9@._-]/g, '');
  },

  // Sanitize phone number
  phone: (input: string): string => {
    return input.replace(/[^+\d\s\-\(\)\.]/g, '').trim();
  },

  // Sanitize WiFi credentials
  wifi: (input: string): string => {
    return input.replace(/[;"]/g, '').trim();
  },

  // Sanitize contact info
  contact: (input: string): string => {
    return input.replace(/[;"]/g, '').trim();
  }
};

// Validation functions
export const validate = {
  // Generic text validation
  text: (input: string, options: ValidationOptions = {}): ValidationResult => {
    const sanitized = sanitize.text(input);

    if (options.required && !sanitized) {
      return { isValid: false, error: 'This field is required' };
    }

    if (options.minLength && sanitized.length < options.minLength) {
      return { isValid: false, error: `Minimum length is ${options.minLength} characters` };
    }

    if (options.maxLength && sanitized.length > options.maxLength) {
      return { isValid: false, error: `Maximum length is ${options.maxLength} characters` };
    }

    if (options.pattern && !options.pattern.test(sanitized)) {
      return { isValid: false, error: 'Invalid format' };
    }

    if (options.customValidator) {
      return options.customValidator(sanitized);
    }

    return { isValid: true, sanitizedValue: sanitized };
  },

  // URL validation
  url: (input: string): ValidationResult => {
    const sanitized = sanitize.url(input);

    try {
      new URL(sanitized);
      return { isValid: true, sanitizedValue: sanitized };
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  },

  // Email validation
  email: (input: string): ValidationResult => {
    const sanitized = sanitize.email(input);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(sanitized)) {
      return { isValid: false, error: 'Invalid email format' };
    }

    return { isValid: true, sanitizedValue: sanitized };
  },

  // Phone validation
  phone: (input: string): ValidationResult => {
    const sanitized = sanitize.phone(input);

    // Basic phone validation (allows international formats)
    const phoneRegex = /^[\+]?[\d\s\-\(\)\.]{7,}$/;

    if (!phoneRegex.test(sanitized)) {
      return { isValid: false, error: 'Invalid phone number format' };
    }

    return { isValid: true, sanitizedValue: sanitized };
  },

  // WiFi validation
  wifi: (input: string): ValidationResult => {
    const sanitized = sanitize.wifi(input);
    const parts = sanitized.split(',');

    if (parts.length < 3) {
      return { isValid: false, error: 'Please provide: NetworkName,Password,SecurityType' };
    }

    const [ssid, password, security] = parts.map(p => p.trim());

    if (!ssid) {
      return { isValid: false, error: 'Network name is required' };
    }

    if (!password) {
      return { isValid: false, error: 'Password is required' };
    }

    const validSecurity = ['WPA', 'WPA2', 'WPA3', 'WEP', 'NONE'];
    if (!validSecurity.includes(security.toUpperCase())) {
      return { isValid: false, error: 'Security type must be: WPA, WPA2, WPA3, WEP, or NONE' };
    }

    return { isValid: true, sanitizedValue: sanitized };
  },

  // Contact validation
  contact: (input: string): ValidationResult => {
    const sanitized = sanitize.contact(input);
    const parts = sanitized.split(',');

    if (parts.length < 3) {
      return { isValid: false, error: 'Please provide: Name,Phone,Email' };
    }

    const [name, phone, email] = parts.map(p => p.trim());

    if (!name) {
      return { isValid: false, error: 'Name is required' };
    }

    // Validate phone if provided
    if (phone) {
      const phoneValidation = validate.phone(phone);
      if (!phoneValidation.isValid) {
        return { isValid: false, error: `Invalid phone: ${phoneValidation.error}` };
      }
    }

    // Validate email if provided
    if (email) {
      const emailValidation = validate.email(email);
      if (!emailValidation.isValid) {
        return { isValid: false, error: `Invalid email: ${emailValidation.error}` };
      }
    }

    return { isValid: true, sanitizedValue: sanitized };
  }
};

// Browser compatibility checks
export const checkBrowserSupport = {
  webRTC: () => typeof RTCPeerConnection !== 'undefined',
  webGL: () => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  },
  serviceWorker: () => 'serviceWorker' in navigator,
  indexedDB: () => 'indexedDB' in window,
  audioContext: () => typeof (window.AudioContext || (window as any).webkitAudioContext) !== 'undefined',
  camera: () => navigator.mediaDevices && navigator.mediaDevices.getUserMedia,
  notifications: () => 'Notification' in window,
  clipboard: () => navigator.clipboard !== undefined,
  share: () => navigator.share !== undefined,
  vibration: () => 'vibrate' in navigator,
  geolocation: () => 'geolocation' in navigator,
  localStorage: () => {
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      return true;
    } catch {
      return false;
    }
  }
};

// Network error handling
export class NetworkError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'NetworkError';
  }
}

export const handleNetworkError = (error: any): ValidationResult => {
  if (!navigator.onLine) {
    return { isValid: false, error: 'No internet connection. Please check your network.' };
  }

  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return { isValid: false, error: 'Network request failed. Please try again.' };
  }

  if (error instanceof NetworkError) {
    return { isValid: false, error: error.message };
  }

  return { isValid: false, error: 'An unexpected error occurred. Please try again.' };
};

// Retry mechanism
export const withRetry = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> => {
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        break;
      }

      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt - 1)));
    }
  }

  throw lastError;
};

// Data persistence with error handling
export const safeLocalStorage = {
  get: (key: string, defaultValue: any = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('localStorage read failed:', error);
      return defaultValue;
    }
  },

  set: (key: string, value: any): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn('localStorage write failed:', error);
      return false;
    }
  },

  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn('localStorage remove failed:', error);
      return false;
    }
  }
};

// Permission management
export const permissionManager = {
  camera: async (): Promise<PermissionState> => {
    try {
      const result = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return result.state;
    } catch {
      return 'prompt';
    }
  },

  microphone: async (): Promise<PermissionState> => {
    try {
      const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return result.state;
    } catch {
      return 'prompt';
    }
  },

  notifications: async (): Promise<NotificationPermission> => {
    if (!('Notification' in window)) return 'denied';
    return Notification.permission;
  }
};

// Utility functions
export const utils = {
  // Debounce function for input handling
  debounce: <T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): ((...args: Parameters<T>) => void) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  // Throttle function for performance
  throttle: <T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): ((...args: Parameters<T>) => void) => {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Generate unique ID
  generateId: (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },

  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
};