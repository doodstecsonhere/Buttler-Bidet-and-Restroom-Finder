import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Location } from '@/hooks/use-geolocation';

interface BidetLocation {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  distance?: number;
}

interface MapProps {
  bidets: BidetLocation[];
  userLocation: Location | null;
  defaultCenter: [number, number];
}

// Generate an inline SVG for the bidet marker (Water Drop)
const bidetSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>
  </svg>
`;

const bidetIcon = L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div class="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg border-2 border-primary transition-transform hover:scale-110">${bidetSvg}</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -40],
});

// Generate an inline SVG for the user marker (Solid Dot with Ping)
const userSvg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" class="text-white">
    <circle cx="12" cy="12" r="10"/>
  </svg>
`;

const userIcon = L.divIcon({
  className: 'bg-transparent border-none',
  html: `
    <div class="relative flex items-center justify-center w-8 h-8">
      <div class="absolute w-full h-full bg-secondary rounded-full animate-ping-slow"></div>
      <div class="relative w-6 h-6 bg-secondary rounded-full flex items-center justify-center shadow-md border-2 border-white">${userSvg}</div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

// Component to handle auto-fitting bounds when data or location changes
function MapBounds({ bidets, userLocation, defaultCenter }: MapProps) {
  const map = useMap();

  useEffect(() => {
    if (!bidets || bidets.length === 0) {
      if (userLocation) {
        map.setView([userLocation.lat, userLocation.lng], 15);
      } else {
        map.setView(defaultCenter, 14);
      }
      return;
    }

    const bounds = L.latLngBounds(bidets.map(b => [b.latitude, b.longitude]));
    if (userLocation) {
      bounds.extend([userLocation.lat, userLocation.lng]);
    }
    
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
  }, [bidets, userLocation, map, defaultCenter]);

  return null;
}

export function Map({ bidets, userLocation, defaultCenter }: MapProps) {
  return (
    <MapContainer 
      center={userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter} 
      zoom={14} 
      className="w-full h-full z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      
      <MapBounds bidets={bidets} userLocation={userLocation} defaultCenter={defaultCenter} />

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup className="font-sans">
            <div className="font-bold text-center">You are here!</div>
            <div className="text-xs text-muted-foreground text-center">Hold it in, we found help.</div>
          </Popup>
        </Marker>
      )}

      {bidets.map((bidet) => (
        <Marker 
          key={bidet.id} 
          position={[bidet.latitude, bidet.longitude]} 
          icon={bidetIcon}
        >
          <Popup className="font-sans rounded-xl">
            <div className="p-1">
              <h3 className="font-bold text-base mb-1 leading-tight">{bidet.name}</h3>
              <a 
                href={`https://www.google.com/maps/dir/?api=1&destination=${bidet.latitude},${bidet.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-semibold text-primary hover:underline"
              >
                Get Directions →
              </a>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
