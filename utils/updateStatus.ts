// utils/updateStatus.ts
export async function updateStatus(
  token: string | undefined,
  reportId: string,
  newStatus: string,
) {
  try {
    const res = await fetch(
      `${process.env.BACKEND_URL}/api/report/${reportId}/status`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      },
    );

    if (!res.ok) throw new Error('Failed to update status');
    return await res.json();
  } catch (err) {
    console.error('Error updating status:', err);
  }
}
