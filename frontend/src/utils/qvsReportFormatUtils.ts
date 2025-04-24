// QVS Report HTML Generator (adapted from Aqua, branding/colors removed)
// src/utils/qvsReportFormatUtils.ts

/**
 * Generates HTML wrapper for QVS report content
 * @param {string} content - HTML content for the report
 * @param {Object} options - Configuration options
 * @returns {string} Complete HTML document
 */
export const generateQVSReportHtml = (content: string, options: any = {}) => {
    const config = {
        title: options.title || 'QVS Security Report',
        includeStyles: options.includeStyles !== false,
        darkMode: options.darkMode || false,
        customerName: options.customerName || 'Not specified',
        assessmentDate: options.assessmentDate || new Date(),
        username: options.username || 'QVS Security',
        ...options
    };

    const dateFormatted = typeof config.assessmentDate === 'string'
        ? new Date(config.assessmentDate).toLocaleDateString('en-GB', {
            year: 'numeric', month: 'long', day: 'numeric'
        })
        : config.assessmentDate.toLocaleDateString('en-GB', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

    // Header logo (large, left-aligned)
    const headerLogoHtml = `<div style="display: flex; align-items: center; margin-bottom: 12px;"><img src="/images/logo-qvs.png" alt="QVS Logo" style="height: 72px; max-width: 240px; margin-right: 24px;" /></div>`;

    // Styles: blue-accented, print-friendly, QVS-branded
    const styles = `
    body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
        line-height: 1.6;
        color: #0f1c45;
        max-width: 900px;
        margin: 0 auto;
        padding: 32px 24px 96px 24px;
        background: #fff;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
    }
    h1 {
        color: #0f1c45;
        border-bottom: 2px solid #2563eb;
        padding-bottom: 10px;
        margin-top: 0;
        margin-bottom: 12px;
        font-size: 2.2rem;
        letter-spacing: -0.02em;
    }
    h2 {
        color: #2563eb;
        margin-top: 32px;
        margin-bottom: 8px;
        font-size: 1.35rem;
        font-weight: 600;
        position: relative;
        padding-left: 18px;
    }
    h2::before {
        content: "";
        position: absolute;
        left: 0;
        top: 7px;
        bottom: 7px;
        width: 6px;
        background-color: #2563eb;
        border-radius: 3px;
    }
    .audience-callout {
        background: #e8f0fe;
        border-left: 6px solid #2563eb;
        padding: 16px 18px;
        margin: 18px 0 24px 0;
        border-radius: 6px;
        color: #0f1c45;
        font-size: 1rem;
    }
    table {
        width: 100%;
        border-collapse: collapse;
        margin: 24px 0;
        background: #fff;
    }
    th, td {
        border: 1px solid #2563eb;
        padding: 10px 8px;
        text-align: left;
        font-size: 0.98rem;
    }
    th {
        background: #f1f5fb;
        color: #0f1c45;
        font-weight: 600;
    }
    tr:nth-child(even) td {
        background: #f7fafc;
    }
    .footer {
        position: fixed;
        left: 0;
        right: 0;
        bottom: 0;
        width: 100%;
        text-align: center;
        color: #2563eb;
        font-size: 0.98rem;
        padding: 12px 0 8px 0;
        border-top: 1.5px solid #e5e7eb;
        background: #fff;
    }
    @media print {
        .footer { position: fixed; bottom: 0; }
    }
    .page-break {
        page-break-before: always;
    }
    .no-break {
        page-break-inside: avoid;
    }
    @media print {
        body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
        }
        .page-break {
            page-break-before: always;
        }
    }
    `;

    // Intended Audience callout
    const audienceHtml = `
      <div class="audience-callout">
        <strong>Intended Audience</strong><br />
        This report is designed for security professionals and IT leaders responsible for cryptographic security. It provides a detailed assessment of your current cryptographic posture, including risk metrics, vulnerability analysis, and actionable recommendations.<br />
        <span style="font-size:0.97em; color:#2563eb; display:block; margin-top:6px;">
          <strong>Primary audience:</strong> CISOs, Security Architects, DevSecOps Leads, Security Teams
        </span>
      </div>
    `;

    // Executive Summary section (parameterized by options.execSummary)
    const executiveSummaryHtml = `
      <section style="margin: 28px 0 28px 0;">
        <h2 style="color: #2563eb; font-size: 1.23rem; margin-bottom: 8px;">Executive Summary</h2>
        <div style="font-size: 1.02rem; color: #0f1c45;">
          ${options.execSummary || 'This assessment provides an overview of cryptographic risks and vulnerabilities identified in your environment. Key findings, risk levels, and actionable recommendations are summarized below. Please review the detailed results for context-specific insights.'}
        </div>
      </section>
    `;

    // Compose the full HTML
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>${config.title}</title>
            ${config.includeStyles ? `<style>${styles}</style>` : ''}
        </head>
        <body>
            ${headerLogoHtml}
            <h1>${config.title}</h1>
            <div style="margin-bottom: 8px; color: #4b5563; font-size: 1.02rem;">
                Assessment Date: <strong>${dateFormatted}</strong> &nbsp; | &nbsp; Generated by: <strong>${config.username}</strong>
            </div>
            ${audienceHtml}
            ${executiveSummaryHtml}
            ${content}
            <footer class="footer" style="display: flex; flex-direction: column; align-items: center; justify-content: center; margin-top: 40px; padding: 18px 0 0 0; border-top: 1.5px solid #e5e7eb; background: #fff; font-size: 1.01rem; text-align: center;">
              <img src="/images/logo-qvs.png" alt="QVS Logo" style="height: 38px; width: auto; margin-bottom: 6px;" />
              <div>
                Quantum Vulnerability Scanner &copy; 2025 &nbsp;|&nbsp; <a href="https://qvspro.app" style="color: #2563eb; text-decoration: none;">qvspro.app</a>
              </div>
            </footer>
        </body>
        </html>
    `;
};
