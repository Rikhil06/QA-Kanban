import { toast } from 'react-toastify';

export async function deleteReport(reportId: string, reportName: string): Promise<void> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/report/${reportId}`,
      {
        method: 'DELETE',
      },
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to delete report');
    }

    toast.success(`Report ${reportName} deleted successfully!`);
  } catch (error) {
    toast.error(`Error deleting report: ${reportName}`);
    throw error;
  }
}
