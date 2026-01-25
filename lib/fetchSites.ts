// lib/fetchSites.ts

export async function fetchSites(token: string | undefined) {
  try {
    const res = await fetch(`${process.env.BACKEND_URL}/api/sites`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      throw new Error('Failed to fetch sites');
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    return [];
  }
}
