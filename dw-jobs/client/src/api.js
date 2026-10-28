export const api = async (path, method = 'GET', body) => {
  const res = await fetch('/api' + path, {
    method, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + (localStorage.getItem('token') || '') },
    body: body ? JSON.stringify(body) : undefined });
  const data = await res.json();
  if (!res.ok) throw new Error(data.msg || 'Error');
  return data;
};
export const getPosition = () => new Promise((ok, fail) =>
  navigator.geolocation ? navigator.geolocation.getCurrentPosition(
    p => ok({ lat: p.coords.latitude, lng: p.coords.longitude }), fail, { enableHighAccuracy: true, timeout: 15000 })
  : fail(new Error('No geolocation')));
