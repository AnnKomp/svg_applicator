import React, { useState, useEffect } from 'react';

const GeolocationComponent = () => {
  const [location, setLocation] = useState<{ latitude: number, longitude: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getLocation();
  }, []);

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          setLoading(false);
        },
        (err) => {
          setError(err.message);
          setLoading(false);
        }
      );
    } else {
      setError('Геолокация не поддерживается вашим браузером');
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Загрузка...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return location ? (
    <div>
      <p>Широта: {location.latitude}</p>
      <p>Долгота: {location.longitude}</p>
    </div>
  ) : null;
};

export default GeolocationComponent;
