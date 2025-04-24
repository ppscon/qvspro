// Philip: Custom type declarations for @react-pdf/renderer JSX components
// This allows TypeScript to recognize Document, Page, Text, View, Image as valid JSX components

declare module '@react-pdf/renderer' {
  import * as React from 'react';
  export const Document: React.ComponentType<any>;
  export const Page: React.ComponentType<any>;
  export const Text: React.ComponentType<any>;
  export const View: React.ComponentType<any>;
  export const Image: React.ComponentType<any>;
  export const StyleSheet: any;
  export const PDFDownloadLink: React.ComponentType<any>;
}
