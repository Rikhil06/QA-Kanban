// lib/fetchSites.ts

export async function fetchSites(teamId?: string) {
  try {
    const url = new URL(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/sites`);
    if (teamId) url.searchParams.set('teamId', teamId);
    const res = await fetch(url.toString(), { credentials: 'include' });

    if (!res.ok) {
      throw new Error('Failed to fetch sites');
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
}
