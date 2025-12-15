// lib/fetcher.ts
export const fetcher = async (url: string, token?: string) => {
  const res = await fetch(url, {
    headers: token
      ? { Authorization: `Bearer ${token}` }
      : undefined,
  });

  if (!res.ok) {
    throw new Error(`An error occurred while fetching the data: ${res.statusText}`);
  }

  return res.json();
};
