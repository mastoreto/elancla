const EARTH_RADIUS_METERS = 6_371_000;
const DEGREES_TO_RADIANS = Math.PI / 180;

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Great-circle distance in meters between two points (haversine). */
export function distanceInMeters(from: Coordinates, to: Coordinates): number {
  const deltaLatitude = (to.latitude - from.latitude) * DEGREES_TO_RADIANS;
  const deltaLongitude = (to.longitude - from.longitude) * DEGREES_TO_RADIANS;
  const a =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(from.latitude * DEGREES_TO_RADIANS) *
      Math.cos(to.latitude * DEGREES_TO_RADIANS) *
      Math.sin(deltaLongitude / 2) ** 2;

  return 2 * EARTH_RADIUS_METERS * Math.asin(Math.sqrt(a));
}

/** "850 m" under a kilometer, "2,4 km" above it. */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toLocaleString("es-UY", { maximumFractionDigits: 1 })} km`;
}
