// QVS Basic Export Utility (HTML print-to-PDF)
// src/utils/qvsBasicExportUtils.ts

/**
 * Creates and opens a new window with HTML content for printing/saving as PDF
 * @param {string} content - HTML content to display in the new window
 * @param {Object} options - Export options
 * @returns {Window} The new window object
 */
export const exportQvsToPdf = (content: string, options: any = {}) => {
    const config = {
        title: options.title || 'Export',
        printAutomatically: options.printAutomatically !== false,
        ...options
    };

    try {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            throw new Error('Pop-up blocked. Please allow pop-ups to export as PDF.');
        }
        printWindow.document.write(content);
        printWindow.document.close();
        if (config.printAutomatically) {
            printWindow.document.addEventListener('load', () => {
                setTimeout(() => {
                    printWindow.print();
                }, 1000);
            });
            setTimeout(() => {
                if (printWindow.document.readyState === 'complete') {
                    printWindow.print();
                }
            }, 2000);
        }
        return printWindow;
    } catch (error) {
        console.error('Error exporting to PDF:', error);
        throw error;
    }
};
