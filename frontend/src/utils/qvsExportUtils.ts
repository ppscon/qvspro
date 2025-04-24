// src/utils/qvsExportUtils.ts
// Compatibility layer for QVS report export utilities

import {
    exportQvsToPdf,
    // (add future QVS export utilities here)
} from './qvsBasicExportUtils';
import {
    generateQVSReportHtml,
    // (add future QVS report formatting utilities here)
} from './qvsReportFormatUtils';

// Re-export for compatibility
export {
    exportQvsToPdf,
    generateQVSReportHtml,
    // (add future QVS exports here)
};
