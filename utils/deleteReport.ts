import { toast } from 'react-toastify';

export async function deleteReport(reportId: string): Promise<void> {
    try {
      const res = await fetch(`http://localhost:4000/api/report/${reportId}`, {
        method: 'DELETE',
      });
  
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to delete report');
      }
  
      toast.success(`Report ${reportId} deleted successfully!`)
    } catch (error) {
      toast.error(`Error deleting report: ${reportId}`);
      throw error;
    }
}
  