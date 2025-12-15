export function stripTLD(url: string): string {
  try {
    // Ensure the URL has a protocol
    const formattedUrl = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`;

    const hostname: string = new URL(formattedUrl).hostname.toLowerCase();

    // Remove 'www.' prefix
    const cleanHost = hostname.startsWith('www.') ? hostname.slice(4) : hostname;

    // Split into parts
    const parts: string[] = cleanHost.split('.');

    if (parts.length <= 1) return cleanHost; // nothing to strip

    // Remove the last part (TLD)
    parts.pop();

    // Handle common second-level TLDs like 'co.uk', 'org.uk'
    const secondLevelTLDs = ['co', 'org', 'net', 'gov', 'ac', 'edu'];
    if (parts.length > 1 && secondLevelTLDs.includes(parts[parts.length - 1])) {
      parts.pop();
    }

    return parts.join('.');
  } catch (e) {
    console.error('Invalid URL:', url);
    return url;
  }
}
