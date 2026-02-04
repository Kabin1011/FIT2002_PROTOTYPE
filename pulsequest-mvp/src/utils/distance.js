const toRad = (value) => (value * Math.PI) / 180

// Returns distance in meters between two lat/lng points
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371000 // meters
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function formatDistance(meters) {
  if (meters < 1000) {
    return `${Math.round(meters)} m away`
  }
  const km = meters / 1000
  return `${km.toFixed(1)} km away`
}

