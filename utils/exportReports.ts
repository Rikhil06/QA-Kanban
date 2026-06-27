import { Report } from '@/types/types';

function statusLabel(status: string): string {
  if (status === 'inProgress') return 'In Progress';
  if (status === 'new') return 'New';
  if (status === 'done') return 'Done';
  return status;
}

function escapeCSV(val: string): string {
  return `"${(val ?? '').toString().replace(/"/g, '""')}"`;
}

export function exportToCSV(reports: Report[], siteName: string): void {
  const headers = ['Title', 'Status', 'Priority', 'Type', 'Assignee', 'Page', 'URL', 'Due Date', 'Created'];

  const rows = reports.map((r) => [
    r.title,
    statusLabel(r.status),
    r.priority,
    r.type || '',
    r.userName || '',
    r.pagePath || '',
    r.url || '',
    r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '',
    new Date(r.timestamp).toLocaleDateString(),
  ]);

  const csv = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${siteName}-reports-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function exportToPDF(reports: Report[], siteName: string): Promise<void> {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({ orientation: 'landscape' });

  doc.setFontSize(18);
  doc.setTextColor(40, 40, 40);
  doc.text(`${siteName} — Issue Report`, 14, 22);

  doc.setFontSize(10);
  doc.setTextColor(120, 120, 120);
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  doc.text(`Exported ${dateStr} · ${reports.length} issue${reports.length !== 1 ? 's' : ''}`, 14, 30);

  const body = reports.map((r) => [
    r.title,
    statusLabel(r.status),
    r.priority,
    r.type || '—',
    r.userName || '—',
    r.pagePath || '—',
    r.dueDate ? new Date(r.dueDate).toLocaleDateString() : '—',
    new Date(r.timestamp).toLocaleDateString(),
  ]);

  autoTable(doc, {
    startY: 36,
    head: [['Title', 'Status', 'Priority', 'Type', 'Assignee', 'Page', 'Due Date', 'Created']],
    body,
    styles: { fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [109, 40, 217], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [245, 245, 250] },
    columnStyles: {
      0: { cellWidth: 70 },
    },
  });

  doc.save(`${siteName}-reports-${new Date().toISOString().slice(0, 10)}.pdf`);
}
