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

const sprSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M6 7h4a1 1 0 0 1 1 1v1a1 1 0 0 1-1 1H6a2 2 0 0 1-2-2 2 2 0 0 1 2-2z"/>
  <path d="M10 9h2"/>
  <path d="M12 9c1.5 0 2.5 1 2.5 2.5S13.5 14 12 14H9"/>
  <path d="M9 14v3a1 1 0 0 0 1 1h1"/>
  <path d="M11 18h2"/>
  <circle cx="14" cy="18" r="1" fill="#2563eb" stroke="none"/>
  <path d="M5 8H3"/>
  <path d="M3 6l1 2-1 2"/>
</svg>`;

const bidetIcon = L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div style="width:38px;height:38px;background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.20);border:2.5px solid #2563eb;">${sprSvg}</div>`,
  iconSize: [38, 38],
  iconAnchor: [19, 38],
  popupAnchor: [0, -38],
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
