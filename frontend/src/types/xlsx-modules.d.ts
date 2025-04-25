/**
 * TypeScript declarations for all xlsx module paths
 */

// Normal xlsx imports
declare module 'xlsx' {
  const XLSX: any;
  export = XLSX;
}

// Full minified bundle
declare module 'xlsx/dist/xlsx.full.min.js' {
  const XLSX: any;
  export = XLSX;
}

// Any other path that might be imported
declare module '*.xlsx.js' {
  const XLSX: any;
  export = XLSX;
} 