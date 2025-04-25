/**
 * TypeScript declaration for xlsx module
 * This ensures TypeScript understands the xlsx module imports
 */

declare module 'xlsx/dist/xlsx.full.min.js' {
  // Re-export all the types from the original xlsx module
  export * from 'xlsx';
  
  // Also export the default export
  import * as XLSX from 'xlsx';
  export default XLSX;
} 