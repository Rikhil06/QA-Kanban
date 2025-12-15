// lib/fetchSites.ts

export async function fetchSites(token: string | null) {
  try {
    const res = await fetch('http://127.0.0.1:4000/api/sites', {
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
