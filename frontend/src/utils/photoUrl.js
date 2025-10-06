// frontend/src/utils/photoUrl.js
export const resolvePhotoUrl = (value) => {
  if (!value) return null;
  const s = String(value).trim();
  if (!s) return null;
  if (/^https?:\/\//i.test(s)) return s;
  const host = (typeof window !== 'undefined' && window.location && window.location.hostname) ? window.location.hostname : 'localhost';
  const backendRoot = process.env.REACT_APP_BACKEND_URL || `http://${host}:3001`;
  if (s.startsWith('/')) return backendRoot + s;
  return `${backendRoot}/uploads/${s}`;
};

export const withCacheBuster = (url, ts) => {
  if (!url) return url;
  const t = typeof ts === 'number' ? ts : (Number(localStorage.getItem('profilePhotoUpdatedAt')) || Date.now());
  return `${url}${url.includes('?') ? '&' : '?'}t=${t}`;
};
