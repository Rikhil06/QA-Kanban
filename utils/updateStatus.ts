// utils/updateStatus.ts
export async function updateStatus(reportId: string, newStatus: string) {
    try {
      const res = await fetch(`http://localhost:4000/api/report/${reportId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
  
      if (!res.ok) throw new Error('Failed to update status');
      return await res.json();
    } catch (err) {
      console.error('Error updating status:', err);
    }
  }
  