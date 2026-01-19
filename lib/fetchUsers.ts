export const fetchUsersForSite = async (siteId: string) => {
  try {
    const res = await fetch(
      `https://qa-backend-105l.onrender.com/api/site/${siteId}/users`,
    );

    // If response is not OK, fallback immediately
    if (!res.ok) {
      console.warn('Failed to fetch users, falling back to empty array');
      return [];
    }

    return await res.json();
  } catch (error) {
    // Network / parsing / unexpected errors land here
    console.error('Error fetching users for site:', error);
    return [];
  }
};
