import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import type { Location } from '@/hooks/use-geolocation';

export interface Restroom {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  address: string | null;
  access: string;
  fee: string;
  bidet: boolean;
  distance?: number;
}

interface MapProps {
  restrooms: Restroom[];
  userLocation: Location | null;
  defaultCenter: [number, number];
  auditedIds: Set<number>;
  isAuthenticated: boolean;
  onAuditClick: (restroom: Restroom) => void;
}

const dropSvg = (color: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="${color}" stroke="none"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/></svg>`;

const checkSvg = `<div style="position:absolute;top:-4px;right:-4px;width:14px;height:14px;background:#22c55e;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;"><svg xmlns="http://www.w3.org/2000/svg" width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>`;

function makeIcon(color: string, borderColor: string, audited: boolean) {
  return L.divIcon({
    className: 'bg-transparent border-none',
    html: `<div style="position:relative;width:36px;height:36px;background:white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.22);border:2.5px solid ${borderColor};">${dropSvg(color)}${audited ? checkSvg : ''}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -38],
  });
}

const bidetIcon = makeIcon('#d97706', '#d97706', false);
const bidetAuditedIcon = makeIcon('#d97706', '#d97706', true);
const noDropIcon = makeIcon('#64748b', '#94a3b8', false);
const noDropAuditedIcon = makeIcon('#64748b', '#94a3b8', true);

const userIcon = L.divIcon({
  className: 'bg-transparent border-none',
  html: `<div class="relative flex items-center justify-center w-8 h-8"><div class="absolute w-full h-full bg-secondary rounded-full animate-ping-slow"></div><div class="relative w-6 h-6 bg-secondary rounded-full flex items-center justify-center shadow-md border-2 border-white"><svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10"/></svg></div></div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

function MapBounds({ restrooms, userLocation, defaultCenter }: { restrooms: Restroom[]; userLocation: Location | null; defaultCenter: [number, number] }) {
  const map = useMap();
  const hasFit = useRef(false);

  useEffect(() => {
    if (hasFit.current) return;
    if (!restrooms || restrooms.length === 0) {
      map.setView(defaultCenter, 14);
      return;
    }
    hasFit.current = true;
    const bounds = L.latLngBounds(restrooms.map(r => [r.latitude, r.longitude]));
    if (userLocation) bounds.extend([userLocation.lat, userLocation.lng]);
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
  }, [restrooms, userLocation, map, defaultCenter]);

  return null;
}

function accessLabel(access: string) {
  if (access === 'public') return { label: 'Public', color: '#22c55e' };
  if (access === 'customers') return { label: 'Customer-Only', color: '#f59e0b' };
  return { label: access, color: '#94a3b8' };
}

function feeLabel(fee: string) {
  if (fee === 'no') return 'Free';
  if (fee === 'yes') return 'Fee required';
  if (fee === 'unknown') return 'Fee unknown';
  return fee;
}

export function Map({ restrooms, userLocation, defaultCenter, auditedIds, isAuthenticated, onAuditClick }: MapProps) {
  return (
    <MapContainer
      center={userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter}
      zoom={14}
      className="w-full h-full z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions" target="_blank" rel="noopener noreferrer">CARTO</a>'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />

      <MapBounds restrooms={restrooms} userLocation={userLocation} defaultCenter={defaultCenter} />

      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup className="font-sans">
            <div className="font-bold text-center text-sm">You are here!</div>
            <div className="text-xs text-gray-500 text-center">Hold it in, we found help.</div>
          </Popup>
        </Marker>
      )}

      {restrooms.map((restroom) => {
        const audited = auditedIds.has(restroom.id);
        const icon = restroom.bidet
          ? (audited ? bidetAuditedIcon : bidetIcon)
          : (audited ? noDropAuditedIcon : noDropIcon);
        const access = accessLabel(restroom.access);

        return (
          <Marker
            key={restroom.id}
            position={[restroom.latitude, restroom.longitude]}
            icon={icon}
          >
            <Popup className="font-sans" minWidth={220}>
              <div className="py-1 px-0.5" style={{ minWidth: 200 }}>
                <div className="flex items-start gap-2 mb-2">
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: restroom.bidet ? '#d97706' : '#64748b', flexShrink: 0, marginTop: 4, display: 'inline-block' }} />
                  <h3 className="font-bold text-sm leading-tight text-gray-900">{restroom.name}</h3>
                </div>

                {restroom.address && (
                  <p className="text-xs text-gray-500 mb-2 leading-tight">{restroom.address}</p>
                )}

                <div className="flex flex-wrap gap-1.5 mb-2">
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: access.color + '20', color: access.color }}>
                    {access.label}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: '#f1f5f9', color: '#475569' }}>
                    {feeLabel(restroom.fee)}
                  </span>
                  {restroom.bidet && (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 99, background: '#fef3c7', color: '#b45309' }}>
                      Bidet ✓
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5 mb-2">
                  {audited ? (
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: '#dcfce7', color: '#16a34a', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span>✓</span> Verified by Guardian
                    </span>
                  ) : (
                    <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 99, background: '#f1f5f9', color: '#94a3b8' }}>
                      Unverified / Community Data
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${restroom.latitude},${restroom.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12, fontWeight: 600, color: '#0ea5e9', textDecoration: 'none' }}
                  >
                    Get Directions →
                  </a>

                  {isAuthenticated && (
                    <button
                      onClick={() => onAuditClick(restroom)}
                      style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 8, background: '#f59e0b', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                      Audit this Restroom
                    </button>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
