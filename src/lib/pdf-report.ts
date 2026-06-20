import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { UrlAnalysis } from './url-analyzer';

export function generatePdfReport(history: UrlAnalysis[]) {
  const doc = new jsPDF();

  // Header
  doc.setFillColor(15, 20, 30);
  doc.rect(0, 0, 210, 40, 'F');
  doc.setTextColor(0, 255, 140);
  doc.setFontSize(22);
  doc.text('PhishShield AI', 14, 20);
  doc.setFontSize(10);
  doc.setTextColor(150, 160, 180);
  doc.text('Security Scan Report', 14, 28);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 34);

  // Summary
  const safe = history.filter(h => h.level === 'safe').length;
  const suspicious = history.filter(h => h.level === 'suspicious').length;
  const dangerous = history.filter(h => h.level === 'dangerous').length;

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(12);
  doc.text('Summary', 14, 52);
  doc.setFontSize(10);
  doc.text(`Total Scans: ${history.length}`, 14, 60);
  doc.setTextColor(0, 180, 80);
  doc.text(`Safe: ${safe}`, 14, 67);
  doc.setTextColor(220, 160, 0);
  doc.text(`Suspicious: ${suspicious}`, 60, 67);
  doc.setTextColor(220, 50, 50);
  doc.text(`Dangerous: ${dangerous}`, 120, 67);

  // Table
  const tableData = history.map(h => [
    h.url.length > 50 ? h.url.slice(0, 47) + '...' : h.url,
    h.score.toString(),
    h.level.toUpperCase(),
    h.reasons[0] || 'No threats',
    h.timestamp.toLocaleString(),
  ]);

  autoTable(doc, {
    startY: 75,
    head: [['URL', 'Score', 'Level', 'Primary Finding', 'Date']],
    body: tableData,
    theme: 'grid',
    styles: { fontSize: 7, cellPadding: 2 },
    headStyles: { fillColor: [15, 20, 30], textColor: [0, 255, 140] },
    columnStyles: {
      0: { cellWidth: 60 },
      1: { cellWidth: 15, halign: 'center' },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 55 },
      4: { cellWidth: 30 },
    },
    didParseCell(data) {
      if (data.column.index === 2 && data.section === 'body') {
        const val = data.cell.raw as string;
        if (val === 'DANGEROUS') data.cell.styles.textColor = [220, 50, 50];
        else if (val === 'SUSPICIOUS') data.cell.styles.textColor = [220, 160, 0];
        else data.cell.styles.textColor = [0, 180, 80];
      }
    },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150, 150, 150);
    doc.text(`PhishShield AI Report — Page ${i}/${pageCount}`, 14, 290);
  }

  doc.save('phishshield-report.pdf');
}
