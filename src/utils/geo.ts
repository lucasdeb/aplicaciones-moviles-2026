export type Cinema = {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  distanceKm: number;
};
 
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}


export async function fetchNearbyCinemas(lat: number, lng: number, radiusM = 15000): Promise<Cinema[]> {
  const query = `[out:json][timeout:25];nwr["amenity"="cinema"](around:${radiusM},${lat},${lng});out center tags;`;
  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  });
  if (!res.ok) throw new Error(`Overpass respondió ${res.status}`);
  const json = await res.json();
 
  return json.elements
    .map((el: any) => ({ el, cLat: el.lat ?? el.center?.lat, cLng: el.lon ?? el.center?.lon }))
    .filter(({ cLat, cLng }) => cLat != null && cLng != null)
    .map(({ el, cLat, cLng }) => {
      const t = el.tags ?? {};
      const street = [t['addr:street'], t['addr:housenumber']].filter(Boolean).join(' ');
      return {
        id: `${el.type}/${el.id}`,
        name: t.name ?? 'Cine sin nombre',
        address: street || null,
        lat: cLat,
        lng: cLng,
        distanceKm: distanceKm(lat, lng, cLat, cLng),
      };
    })
    .sort((a: Cinema, b: Cinema) => a.distanceKm - b.distanceKm)
    .slice(0, 20);
}
 