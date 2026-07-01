export const fetchUsersForSite = async (siteId: string) => {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/site/${siteId}/users`,
      { credentials: 'include' },
    );

    if (!res.ok) {
      console.warn('Failed to fetch users, falling back to empty array');
      return [];
    }

    return await res.json();
  } catch (error) {
    console.error('Error fetching users for site:', error);
    return [];
  }
};
