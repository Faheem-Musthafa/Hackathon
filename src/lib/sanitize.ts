import DOMPurify from 'dompurify';

/**
 * Configuration for different sanitization levels
 */
const SANITIZE_CONFIGS = {
  // Strict: Only allow basic text formatting
  strict: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  },
  
  // Basic: Allow common formatting tags
  basic: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'br', 'p', 'span', 'div'],
    ALLOWED_ATTR: ['class'],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  },
  
  // Rich: Allow more formatting but still safe
  rich: {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'br', 'p', 'span', 'div', 
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote'
    ],
    ALLOWED_ATTR: ['class', 'id'],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  },
  
  // Text only: Strip all HTML
  textOnly: {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
  }
} as const;

type SanitizeLevel = keyof typeof SANITIZE_CONFIGS;

/**
 * Sanitize HTML content to prevent XSS attacks
 * @param dirty - The potentially unsafe HTML string
 * @param level - The sanitization level to apply
 * @returns Sanitized HTML string
 */
export function sanitizeHtml(dirty: string, level: SanitizeLevel = 'basic'): string {
  if (!dirty || typeof dirty !== 'string') {
    return '';
  }

  const config = SANITIZE_CONFIGS[level];
  return DOMPurify.sanitize(dirty, config);
}

/**
 * Sanitize text input by removing all HTML tags
 * @param input - The input string that may contain HTML
 * @returns Plain text string with HTML stripped
 */
export function sanitizeText(input: string): string {
  return sanitizeHtml(input, 'textOnly');
}

/**
 * Sanitize user input for display in reports
 * Allows basic formatting but removes dangerous content
 * @param input - User input that may contain HTML
 * @returns Sanitized HTML safe for display
 */
export function sanitizeUserContent(input: string): string {
  return sanitizeHtml(input, 'basic');
}

/**
 * Sanitize rich content like descriptions that may need more formatting
 * @param input - Rich content input
 * @returns Sanitized HTML with rich formatting allowed
 */
export function sanitizeRichContent(input: string): string {
  return sanitizeHtml(input, 'rich');
}

/**
 * Validate and sanitize email addresses
 * @param email - Email address to validate
 * @returns Sanitized email or empty string if invalid
 */
export function sanitizeEmail(email: string): string {
  if (!email || typeof email !== 'string') {
    return '';
  }

  // Basic email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const sanitized = sanitizeText(email.trim().toLowerCase());
  
  return emailRegex.test(sanitized) ? sanitized : '';
}

/**
 * Sanitize location strings to prevent injection
 * @param location - Location string
 * @returns Sanitized location string
 */
export function sanitizeLocation(location: string): string {
  if (!location || typeof location !== 'string') {
    return '';
  }

  // Remove HTML and limit to reasonable characters for locations
  const sanitized = sanitizeText(location);
  
  // Allow letters, numbers, spaces, commas, periods, hyphens, and common location characters
  return sanitized.replace(/[^a-zA-Z0-9\s,.\-#()]/g, '').trim();
}

/**
 * Sanitize phone numbers
 * @param phone - Phone number string
 * @returns Sanitized phone number
 */
export function sanitizePhone(phone: string): string {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remove HTML and keep only numbers, spaces, hyphens, parentheses, and plus
  const sanitized = sanitizeText(phone);
  return sanitized.replace(/[^0-9\s\-()+ ]/g, '').trim();
}

/**
 * Sanitize URLs to prevent javascript: and other dangerous protocols
 * @param url - URL string to sanitize
 * @returns Safe URL or empty string if dangerous
 */
export function sanitizeUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const sanitized = sanitizeText(url.trim());
  
  // Allow only http, https, and mailto protocols
  const allowedProtocols = /^(https?:\/\/|mailto:)/i;
  const dangerousProtocols = /^(javascript:|data:|vbscript:|file:|ftp:)/i;
  
  if (dangerousProtocols.test(sanitized)) {
    return '';
  }
  
  // If no protocol, assume https
  if (!sanitized.includes('://') && !sanitized.startsWith('mailto:')) {
    return `https://${sanitized}`;
  }
  
  return allowedProtocols.test(sanitized) ? sanitized : '';
}

/**
 * Sanitize form data object
 * @param data - Object containing form data
 * @returns Sanitized form data object
 */
export function sanitizeFormData<T extends Record<string, any>>(data: T): T {
  const sanitized = {} as T;
  
  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      // Apply appropriate sanitization based on field name
      if (key.toLowerCase().includes('email')) {
        sanitized[key as keyof T] = sanitizeEmail(value) as T[keyof T];
      } else if (key.toLowerCase().includes('phone')) {
        sanitized[key as keyof T] = sanitizePhone(value) as T[keyof T];
      } else if (key.toLowerCase().includes('url') || key.toLowerCase().includes('website')) {
        sanitized[key as keyof T] = sanitizeUrl(value) as T[keyof T];
      } else if (key.toLowerCase().includes('location') || key.toLowerCase().includes('address')) {
        sanitized[key as keyof T] = sanitizeLocation(value) as T[keyof T];
      } else if (key.toLowerCase().includes('description') || key.toLowerCase().includes('content')) {
        sanitized[key as keyof T] = sanitizeUserContent(value) as T[keyof T];
      } else {
        sanitized[key as keyof T] = sanitizeText(value) as T[keyof T];
      }
    } else {
      sanitized[key as keyof T] = value;
    }
  }
  
  return sanitized;
}

/**
 * React hook for sanitizing content in components
 * @param content - Content to sanitize
 * @param level - Sanitization level
 * @returns Sanitized content
 */
export function useSanitizedContent(content: string, level: SanitizeLevel = 'basic'): string {
  return sanitizeHtml(content, level);
}

/**
 * Component prop for safely rendering HTML content
 * Use this with dangerouslySetInnerHTML
 * @param html - HTML content to sanitize
 * @param level - Sanitization level
 * @returns Object with __html property for dangerouslySetInnerHTML
 */
export function createSafeHtml(html: string, level: SanitizeLevel = 'basic'): { __html: string } {
  return { __html: sanitizeHtml(html, level) };
}

// Export types for TypeScript
export type { SanitizeLevel };
export { SANITIZE_CONFIGS };
