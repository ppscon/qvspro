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

    // Header logo (large, left-aligned) with fallback SVG
    const headerLogoHtml = `<div style="display: flex; align-items: center; margin-bottom: 12px;"><img src="/images/logo-qvs.png" onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMTZDMTQuMjA5MSAxNiAxNiAxNC4yMDkxIDE2IDEyQzE2IDkuNzkwODYgMTQuMjA5MSA4IDEyIDhDOS43OTA4NiA4IDggOS43OTA4NiA4IDEyQzggMTQuMjA5MSA5Ljc5MDg2IDE2IDEyIDE2WiIgZmlsbD0iIzNCODJGNiIvPjxwYXRoIGQ9Ik0xMiAyQzEyLjU1MjMgMiAxMyAyLjQ0NzcyIDEzIDNWNEMxMyA0LjU1MjI4IDEyLjU1MjMgNSAxMiA1QzExLjQ0NzcgNSAxMSA0LjU1MjI4IDExIDRWM0MxMSAyLjQ0NzcyIDExLjQ0NzcgMiAxMiAyWiIgZmlsbD0iIzhCNUNGNiIvPjxwYXRoIGQ9Ik0xMiAxOUMxMi41NTIzIDE5IDEzIDE5LjQ0NzcgMTMgMjBWMjFDMTMgMjEuNTUyMyAxMi41NTIzIDIyIDEyIDIyQzExLjQ0NzcgMjIgMTEgMjEuNTUyMyAxMSAyMVYyMEMxMSAxOS40NDc3IDExLjQ0NzcgMTkgMTIgMTlaIiBmaWxsPSIjOEI1Q0Y2Ii8+PHBhdGggZD0iTTIxIDEyQzIxLjU1MjMgMTIgMjIgMTIuNDQ3NyAyMiAxM0MyMiAxMy41NTIzIDIxLjU1MjMgMTQgMjEgMTRIMjBDMTkuNDQ3NyAxNCAxOSAxMy41NTIzIDE5IDEzQzE5IDEyLjQ0NzcgMTkuNDQ3NyAxMiAyMCAxMkgyMVoiIGZpbGw9IiM4QjVDRjYiLz48cGF0aCBkPSJNNSAxMkM1LjU1MjI4IDEyIDYgMTIuNDQ3NyA2IDEzQzYgMTMuNTUyMyA1LjU1MjI4IDE0IDUgMTRINEM0IDE0IDMgMTQgMyAxM0MzIDEyIDQgMTIgNCAxMkg1WiIgZmlsbD0iIzhCNUNGNiIvPjxwYXRoIGQ9Ik0xNy42NSA3Ljc1OEMxOC4wNDYxIDcuNDEyMTggMTguNjU1MyA3LjQ1MzE3IDE5LjAwMTEgNy44NDkyOEMxOS4zNDY5IDguMjQ1MzkgMTkuMzA2IDguODU0NTcgMTguOTA5OSA5LjIwMDM2TDE4LjA2NDMgMTBDMTcuNjY4MiAxMC4zNDU4IDE3LjA1OSAxMC4zMDQ4IDE2LjcxMzIgOS45MDg2OEMxNi4zNjczIDkuNTEyNTcgMTYuNDA4MyA4LjkwMzM5IDE2LjgwNDQgOC41NTc2MUwxNy42NSA3Ljc1OFoiIGZpbGw9IiM4QjVDRjYiLz48cGF0aCBkPSJNNy4yMDAxIDE2LjA5OTZDNy41OTYyMSAxNS43NTM4IDguMjA1MzkgMTUuNzk0OCA4LjU1MTE4IDE2LjE5MDlDOC44OTY5NiAxNi41ODcgOC44NTU5NyAxNy4xOTYyIDguNDU5ODYgMTcuNTQyTDcuNjE0MzEgMTguMzQxNkM3LjIxODIgMTguNjg3NCA2LjYwOTAyIDE4LjY0NjQgNi4yNjMyNCAxOC4yNTAzQzUuOTE3NDUgMTcuODU0MiA1Ljk1ODQ0IDE3LjI0NSA2LjM1NDU1IDE2Ljg5OTJMNy4yMDAxIDE2LjA5OTZaIiBmaWxsPSIjOEI1Q0Y2Ii8+PHBhdGggZD0iTTE4LjA2NDEgMTRDMTguNDYwMiAxMy42NTQyIDE5LjA2OTQgMTMuNjk1MiAxOS40MTUyIDE0LjA5MTNDMTkuNzYxIDE0LjQ4NzQgMTkuNzIgMTUuMDk2NiAxOS4zMjM5IDE1LjQ0MjNMMTguNDc4MyAxNi4yNDJDMTguMDgyMiAxNi41ODc3IDE3LjQ3MyAxNi41NDY4IDE3LjEyNzIgMTYuMTUwN0MxNi43ODE0IDE1Ljc1NDYgMTYuODIyNCAxNS4xNDU0IDE3LjIxODUgMTQuNzk5NkwxOC4wNjQxIDE0WiIgZmlsbD0iIzhCNUNGNiIvPjxwYXRoIGQ9Ik03LjE5OTg4IDcuOTAwMzJDNy41OTU5OSA4LjI0NjEgNy41NTUgOC44NTUyOCA3LjIwOTIxIDkuMjUxMzlDNi44NjM0MyA5LjY0NzUgNi4yNTQyNSA5LjYwNjUxIDUuODU4MTQgOS4yNjA3M0w1LjAxMjU5IDguNDYxMDhDNC42MTY0OCA4LjExNTMgNC42NTc0NyA3LjUwNjEyIDUuMDAzMjUgNy4xMTAwMUM1LjM0OTA0IDYuNzEzOSA1Ljk1ODIyIDYuNzU0ODkgNi4zNTQzMyA3LjEwMDY3TDcuMTk5ODggNy45MDAzMloiIGZpbGw9IiM4QjVDRjYiLz48L3N2Zz4='" alt="QVS Logo" style="height: 72px; max-width: 240px; margin-right: 24px;" /></div>`;

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
              <img src="/images/logo-qvs.png" onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMTZDMTQuMjA5MSAxNiAxNiAxNC4yMDkxIDE2IDEyQzE2IDkuNzkwODYgMTQuMjA5MSA4IDEyIDhDOS43OTA4NiA4IDggOS43OTA4NiA4IDEyQzggMTQuMjA5MSA5Ljc5MDg2IDE2IDEyIDE2WiIgZmlsbD0iIzNCODJGNiIvPjxwYXRoIGQ9Ik0xMiAyQzEyLjU1MjMgMiAxMyAyLjQ0NzcyIDEzIDNWNEMxMyA0LjU1MjI4IDEyLjU1MjMgNSAxMiA1QzExLjQ0NzcgNSAxMSA0LjU1MjI4IDExIDRWM0MxMSAyLjQ0NzcyIDExLjQ0NzcgMiAxMiAyWiIgZmlsbD0iIzhCNUNGNiIvPjxwYXRoIGQ9Ik0xMiAxOUMxMi41NTIzIDE5IDEzIDE5LjQ0NzcgMTMgMjBWMjFDMTMgMjEuNTUyMyAxMi41NTIzIDIyIDEyIDIyQzExLjQ0NzcgMjIgMTEgMjEuNTUyMyAxMSAyMVYyMEMxMSAxOS40NDc3IDExLjQ0NzcgMTkgMTIgMTlaIiBmaWxsPSIjOEI1Q0Y2Ii8+PHBhdGggZD0iTTIxIDEyQzIxLjU1MjMgMTIgMjIgMTIuNDQ3NyAyMiAxM0MyMiAxMy41NTIzIDIxLjU1MjMgMTQgMjEgMTRIMjBDMTkuNDQ3NyAxNCAxOSAxMy41NTIzIDE5IDEzQzE5IDEyLjQ0NzcgMTkuNDQ3NyAxMiAyMCAxMkgyMVoiIGZpbGw9IiM4QjVDRjYiLz48cGF0aCBkPSJNNSAxMkM1LjU1MjI4IDEyIDYgMTIuNDQ3NyA2IDEzQzYgMTMuNTUyMyA1LjU1MjI4IDE0IDUgMTRINEM0IDE0IDMgMTQgMyAxM0MzIDEyIDQgMTIgNCAxMkg1WiIgZmlsbD0iIzhCNUNGNiIvPjxwYXRoIGQ9Ik0xNy42NSA3Ljc1OEMxOC4wNDYxIDcuNDEyMTggMTguNjU1MyA3LjQ1MzE3IDE5LjAwMTEgNy44NDkyOEMxOS4zNDY5IDguMjQ1MzkgMTkuMzA2IDguODU0NTcgMTguOTA5OSA5LjIwMDM2TDE4LjA2NDMgMTBDMTcuNjY4MiAxMC4zNDU4IDE3LjA1OSAxMC4zMDQ4IDE2LjcxMzIgOS45MDg2OEMxNi4zNjczIDkuNTEyNTcgMTYuNDA4MyA4LjkwMzM5IDE2LjgwNDQgOC41NTc2MUwxNy42NSA3Ljc1OFoiIGZpbGw9IiM4QjVDRjYiLz48cGF0aCBkPSJNNy4yMDAxIDE2LjA5OTZDNy41OTYyMSAxNS43NTM4IDguMjA1MzkgMTUuNzk0OCA4LjU1MTE4IDE2LjE5MDlDOC44OTY5NiAxNi41ODcgOC44NTU5NyAxNy4xOTYyIDguNDU5ODYgMTcuNTQyTDcuNjE0MzEgMTguMzQxNkM3LjIxODIgMTguNjg3NCA2LjYwOTAyIDE4LjY0NjQgNi4yNjMyNCAxOC4yNTAzQzUuOTE3NDUgMTcuODU0MiA1Ljk1ODQ0IDE3LjI0NSA2LjM1NDU1IDE2Ljg5OTJMNy4yMDAxIDE2LjA5OTZaIiBmaWxsPSIjOEI1Q0Y2Ii8+PHBhdGggZD0iTTE4LjA2NDEgMTRDMTguNDYwMiAxMy42NTQyIDE5LjA2OTQgMTMuNjk1MiAxOS40MTUyIDE0LjA5MTNDMTkuNzYxIDE0LjQ4NzQgMTkuNzIgMTUuMDk2NiAxOS4zMjM5IDE1LjQ0MjNMMTguNDc4MyAxNi4yNDJDMTguMDgyMiAxNi41ODc3IDE3LjQ3MyAxNi41NDY4IDE3LjEyNzIgMTYuMTUwN0MxNi43ODE0IDE1Ljc1NDYgMTYuODIyNCAxNS4xNDU0IDE3LjIxODUgMTQuNzk5NkwxOC4wNjQxIDE0WiIgZmlsbD0iIzhCNUNGNiIvPjxwYXRoIGQ9Ik03LjE5OTg4IDcuOTAwMzJDNy41OTU5OSA4LjI0NjEgNy41NTUgOC44NTUyOCA3LjIwOTIxIDkuMjUxMzlDNi44NjM0MyA5LjY0NzUgNi4yNTQyNSA5LjYwNjUxIDUuODU4MTQgOS4yNjA3M0w1LjAxMjU5IDguNDYxMDhDNC42MTY0OCA4LjExNTMgNC42NTc0NyA3LjUwNjEyIDUuMDAzMjUgNy4xMTAwMUM1LjM0OTA0IDYuNzEzOSA1Ljk1ODIyIDYuNzU0ODkgNi4zNTQzMyA3LjEwMDY3TDcuMTk5ODggNy45MDAzMloiIGZpbGw9IiM4QjVDRjYiLz48L3N2Zz4='" alt="QVS Logo" style="height: 38px; width: auto; margin-bottom: 6px;" />
              <div>
                Quantum Vulnerability Scanner &copy; 2025 &nbsp;|&nbsp; <a href="https://qvspro.app" style="color: #2563eb; text-decoration: none;">qvspro.app</a>
              </div>
            </footer>
        </body>
        </html>
    `;
};
