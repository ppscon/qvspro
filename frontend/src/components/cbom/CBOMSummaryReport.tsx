import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image
} from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#fff',
    padding: 32,
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#222',
    lineHeight: 1.5,
  },
  logo: {
    width: 120,
    height: 36,
    marginBottom: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#003366',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 4,
    color: '#003366',
  },
  paragraph: {
    marginBottom: 8,
    color: '#222',
  },
  table: {
    width: 'auto',
    marginVertical: 8,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableHeader: {
    backgroundColor: '#f3f4f6',
    fontWeight: 'bold',
  },
  tableCell: {
    padding: 6,
    borderRightWidth: 1,
    borderRightColor: '#e5e7eb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    minWidth: 70,
  },
  tableCellHeader: {
    fontWeight: 'bold',
    color: '#003366',
  },
  footer: {
    position: 'absolute',
    bottom: 32,
    left: 32,
    right: 32,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
  },
});

interface CBOMSummaryReportProps {
  summaryStats: any;
  scanMeta: { date: string; scanId: string };
  recipient?: string;
}

export function CBOMSummaryReport({ summaryStats, scanMeta, recipient }: CBOMSummaryReportProps) {
  // @ts-ignore: PDF primitives are valid in @react-pdf/renderer context
  return (
        <Document>
      {/* @ts-ignore */}
      <Page size="A4" style={styles.page}>
        {/* @ts-ignore */}
        <Image src="/images/logo-qvs.png" style={styles.logo} />
        {/* @ts-ignore */}
        <Text style={styles.header}>Quantum Vulnerability Scan Report</Text>
        {/* @ts-ignore */}
        <Text style={styles.paragraph}>Date: {scanMeta.date} | Scan ID: {scanMeta.scanId}</Text>
        {/* @ts-ignore */}
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        {/* @ts-ignore */}
        <Text style={styles.paragraph}>
          This report summarizes the findings of the latest quantum vulnerability scan. The assessment provides a breakdown of risk levels, asset types, and vulnerabilities detected, supporting informed decisions on quantum-safe adoption and remediation priorities.
        </Text>
        {/* @ts-ignore */}
        <Text style={styles.sectionTitle}>Intended Audience</Text>
        {/* @ts-ignore */}
        <Text style={styles.paragraph}>
          {recipient || `This report is designed for security professionals and IT leaders responsible for quantum security. It provides a detailed assessment of your current quantum vulnerability posture, including risk metrics, threat analysis, and actionable recommendations.\n\nPrimary audience: CISOs, Security Architects, DevSecOps Leads, Security Teams`}
        </Text>
        {/* Main Report Details: Risk Breakdown Table */}
        <Text style={styles.sectionTitle}>Risk Level Breakdown</Text>
        {/* @ts-ignore */}
        <View style={styles.table}>
          {/* @ts-ignore */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.tableCellHeader]}>Risk Level</Text>
            <Text style={[styles.tableCell, styles.tableCellHeader]}>Count</Text>
          </View>
          {(Object.entries(summaryStats.riskBreakdown || {})).map(([risk, count]) => (
                        <View style={styles.tableRow} key={risk}>
              <Text style={styles.tableCell}>{risk.charAt(0).toUpperCase() + risk.slice(1)}</Text>
              <Text style={styles.tableCell}>{count}</Text>
            </View>
          ))}
        </View>
        {/* Asset Type Table */}
        <Text style={styles.sectionTitle}>Asset Type Summary</Text>
        {/* @ts-ignore */}
        <View style={styles.table}>
          {/* @ts-ignore */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.tableCellHeader]}>Asset Type</Text>
            <Text style={[styles.tableCell, styles.tableCellHeader]}>Count</Text>
          </View>
          {(Object.entries(summaryStats.assetTypeBreakdown || {})).map(([type, count]) => (
                        <View style={styles.tableRow} key={type}>
              <Text style={styles.tableCell}>{type}</Text>
              <Text style={styles.tableCell}>{count}</Text>
            </View>
          ))}
        </View>
        {/* Vulnerability Type Table */}
        <Text style={styles.sectionTitle}>Vulnerability Type Summary</Text>
        {/* @ts-ignore */}
        <View style={styles.table}>
          {/* @ts-ignore */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.tableCell, styles.tableCellHeader]}>Vulnerability Type</Text>
            <Text style={[styles.tableCell, styles.tableCellHeader]}>Count</Text>
          </View>
          {(Object.entries(summaryStats.vulnTypeBreakdown || {})).map(([type, count]) => (
                        <View style={styles.tableRow} key={type}>
              {/* @ts-ignore */}
              <Text style={styles.tableCell}>{type}</Text>
              {/* @ts-ignore */}
              <Text style={styles.tableCell}>{count}</Text>
            </View>
          ))}
        </View>
        {/* Summary & Recommendations */}
        {/* @ts-ignore */}
        <Text style={styles.sectionTitle}>Summary & Recommendations</Text>
        {/* @ts-ignore */}
        <Text style={styles.paragraph}>
          Review the detailed findings above to prioritize remediation of critical and high-risk assets. Ensure that quantum-safe cryptographic implementations are adopted where possible, and monitor for emerging threats.
        </Text>
        {/* Footer */}
        {/* @ts-ignore */}
        <Text style={styles.footer}>
          {new Date().getFullYear()} Quantum Vulnerability Scanner (QVS). All rights reserved. | For more information, visit https://qvs-pro.com
        </Text>
      </Page>
    </Document>
  );
}
