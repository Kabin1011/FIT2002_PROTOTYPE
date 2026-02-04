import { useEffect, useState } from 'react'

const MELBOURNE_CBD = {
  lat: -37.8136,
  lng: 144.9631,
  city: 'Melbourne',
  suburb: 'CBD',
}

export function useGeolocation(requestOnMount = false) {
  const [location, setLocation] = useState(null)
  const [error, setError] = useState(null)
  const [isRequesting, setIsRequesting] = useState(false)
  const [hasAttempted, setHasAttempted] = useState(false)

  const requestLocation = () => {
    if (!('geolocation' in navigator)) {
      setError('Geolocation is not supported in this browser.')
      setLocation(MELBOURNE_CBD)
      setHasAttempted(true)
      return
    }

    setIsRequesting(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords
        setLocation({ lat: latitude, lng: longitude })
        setIsRequesting(false)
        setHasAttempted(true)
      },
      (err) => {
        console.warn('Geolocation error', err)
        setError('Location permission denied. Using Melbourne CBD instead.')
        setLocation(MELBOURNE_CBD)
        setIsRequesting(false)
        setHasAttempted(true)
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000,
      },
    )
  }

  useEffect(() => {
    if (requestOnMount) {
      requestLocation()
    }
  }, [requestOnMount])

  return {
    location,
    error,
    isRequesting,
    hasAttempted,
    requestLocation,
    fallbackLocation: MELBOURNE_CBD,
  }
}

