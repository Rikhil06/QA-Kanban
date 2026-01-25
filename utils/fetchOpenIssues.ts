type OpenIssuesResponse = {
  openIssues: number;
};

export async function fetchOpenIssues(
  token: string | null,
): Promise<OpenIssuesResponse> {
  try {
    const res = await fetch(
      `${process.env.BACKEND_URL}/api/stats/open-issues`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!res.ok) {
      throw new Error('Failed to fetch open issues');
    }

    return (await res.json()) as OpenIssuesResponse;
  } catch (err) {
    console.error('Failed to load open issues:', err);
    throw err; // ✅ guarantees function never resolves to undefined
  }
}
