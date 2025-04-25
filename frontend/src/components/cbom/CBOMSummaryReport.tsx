import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image
} from '@react-pdf/renderer';
import React from 'react';

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

// QVS-Pro logo content as Base64 (for react-pdf compatibility)
const logoBase64 = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAiIGhlaWdodD0iMzAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTIgMTZDMTQuMjA5MSAxNiAxNiAxNC4yMDkxIDE2IDEyQzE2IDkuNzkwODYgMTQuMjA5MSA4IDEyIDhDOS43OTA4NiA4IDggOS43OTA4NiA4IDEyQzggMTQuMjA5MSA5Ljc5MDg2IDE2IDEyIDE2WiIgZmlsbD0iIzNCODJGNiIvPjxwYXRoIGQ9Ik0xMiAyQzEyLjU1MjMgMiAxMyAyLjQ0NzcyIDEzIDNWNEMxMyA0LjU1MjI4IDEyLjU1MjMgNSAxMiA1QzExLjQ0NzcgNSAxMSA0LjU1MjI4IDExIDRWM0MxMSAyLjQ0NzcyIDExLjQ0NzcgMiAxMiAyWiIgZmlsbD0iIzhCNUNGNiIvPjxwYXRoIGQ9Ik0xMiAxOUMxMi41NTIzIDE5IDEzIDE5LjQ0NzcgMTMgMjBWMjFDMTMgMjEuNTUyMyAxMi41NTIzIDIyIDEyIDIyQzExLjQ0NzcgMjIgMTEgMjEuNTUyMyAxMSAyMVYyMEMxMSAxOS40NDc3IDExLjQ0NzcgMTkgMTIgMTlaIiBmaWxsPSIjOEI1Q0Y2Ii8+PHBhdGggZD0iTTIxIDEyQzIxLjU1MjMgMTIgMjIgMTIuNDQ3NyAyMiAxM0MyMiAxMy41NTIzIDIxLjU1MjMgMTQgMjEgMTRIMjBDMTkuNDQ3NyAxNCAxOSAxMy41NTIzIDE5IDEzQzE5IDEyLjQ0NzcgMTkuNDQ3NyAxMiAyMCAxMkgyMVoiIGZpbGw9IiM4QjVDRjYiLz48cGF0aCBkPSJNNSAxMkM1LjU1MjI4IDEyIDYgMTIuNDQ3NyA2IDEzQzYgMTMuNTUyMyA1LjU1MjI4IDE0IDUgMTRINEM0IDE0IDMgMTQgMyAxM0MzIDEyIDQgMTIgNCAxMkg1WiIgZmlsbD0iIzhCNUNGNiIvPjxwYXRoIGQ9Ik0xNy42NSA3Ljc1OEMxOC4wNDYxIDcuNDEyMTggMTguNjU1MyA3LjQ1MzE3IDE5LjAwMTEgNy44NDkyOEMxOS4zNDY5IDguMjQ1MzkgMTkuMzA2IDguODU0NTcgMTguOTA5OSA5LjIwMDM2TDE4LjA2NDMgMTBDMTcuNjY4MiAxMC4zNDU4IDE3LjA1OSAxMC4zMDQ4IDE2LjcxMzIgOS45MDg2OEMxNi4zNjczIDkuNTEyNTcgMTYuNDA4MyA4LjkwMzM5IDE2LjgwNDQgOC41NTc2MUwxNy42NSA3Ljc1OFoiIGZpbGw9IiM4QjVDRjYiLz48cGF0aCBkPSJNNy4yMDAxIDE2LjA5OTZDNy41OTYyMSAxNS43NTM4IDguMjA1MzkgMTUuNzk0OCA4LjU1MTE4IDE2LjE5MDlDOC44OTY5NiAxNi41ODcgOC44NTU5NyAxNy4xOTYyIDguNDU5ODYgMTcuNTQyTDcuNjE0MzEgMTguMzQxNkM3LjIxODIgMTguNjg3NCA2LjYwOTAyIDE4LjY0NjQgNi4yNjMyNCAxOC4yNTAzQzUuOTE3NDUgMTcuODU0MiA1Ljk1ODQ0IDE3LjI0NSA2LjM1NDU1IDE2Ljg5OTJMNy4yMDAxIDE2LjA5OTZaIiBmaWxsPSIjOEI1Q0Y2Ii8+PHBhdGggZD0iTTE4LjA2NDEgMTRDMTguNDYwMiAxMy42NTQyIDE5LjA2OTQgMTMuNjk1MiAxOS40MTUyIDE0LjA5MTNDMTkuNzYxIDE0LjQ4NzQgMTkuNzIgMTUuMDk2NiAxOS4zMjM5IDE1LjQ0MjNMMTguNDc4MyAxNi4yNDJDMTguMDgyMiAxNi41ODc3IDE3LjQ3MyAxNi41NDY4IDE3LjEyNzIgMTYuMTUwN0MxNi43ODE0IDE1Ljc1NDYgMTYuODIyNCAxNS4xNDU0IDE3LjIxODUgMTQuNzk5NkwxOC4wNjQxIDE0WiIgZmlsbD0iIzhCNUNGNiIvPjxwYXRoIGQ9Ik03LjE5OTg4IDcuOTAwMzJDNy41OTU5OSA4LjI0NjEgNy41NTUgOC44NTUyOCA3LjIwOTIxIDkuMjUxMzlDNi44NjM0MyA5LjY0NzUgNi4yNTQyNSA5LjYwNjUxIDUuODU4MTQgOS4yNjA3M0w1LjAxMjU5IDguNDYxMDhDNC42MTY0OCA4LjExNTMgNC42NTc0NyA3LjUwNjEyIDUuMDAzMjUgNy4xMTAwMUM1LjM0OTA0IDYuNzEzOSA1Ljk1ODIyIDYuNzU0ODkgNi4zNTQzMyA3LjEwMDY3TDcuMTk5ODggNy45MDAzMloiIGZpbGw9IiM4QjVDRjYiLz48L3N2Zz4=";

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
        {/* Use base64 encoded image directly */}
        <Image src={logoBase64} style={styles.logo} />
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
