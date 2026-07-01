// utils/updateStatus.ts
export async function updateStatus(
  reportId: string,
  newStatus: string,
) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/report/${reportId}/status`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: newStatus }),
      },
    );

    if (!res.ok) throw new Error('Failed to update status');
    return await res.json();
  } catch (err) {
    console.error('Error updating status:', err);
  }
}
