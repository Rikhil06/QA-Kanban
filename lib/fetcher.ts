// lib/fetcher.ts
export const fetcher = async (url: string) => {
  const res = await fetch(url, {
    credentials: 'include',
  });

  if (!res.ok) {
    throw new Error(`An error occurred while fetching the data: ${res.statusText}`);
  }

  return res.json();
};
