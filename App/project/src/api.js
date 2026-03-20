export function getApiBaseUrl() {
  const configuredUrl = (import.meta.env.VITE_API_URL || '').trim();
  const hostname = window.location.hostname;

  if (!configuredUrl) {
    return `http://${hostname}:5000`;
  }

  try {
    const url = new URL(configuredUrl);
    const usesLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    const isCurrentHostLocal = hostname === 'localhost' || hostname === '127.0.0.1';

    if (usesLocalhost && hostname && !isCurrentHostLocal) {
      url.hostname = hostname;
    }

    return url.toString().replace(/\/$/, '');
  } catch {
    return configuredUrl.replace(/\/$/, '');
  }
}