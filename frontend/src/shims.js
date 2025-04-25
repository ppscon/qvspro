/**
 * Global shims for package compatibility
 */

// Process shim for xlsx and other packages
if (typeof window !== 'undefined') {
  window.process = window.process || {};
  window.process.browser = true;
  window.process.version = '';
  window.process.env = window.process.env || {};
}

// Global utility shims
if (typeof global === 'undefined' && typeof window !== 'undefined') {
  window.global = window;
} 