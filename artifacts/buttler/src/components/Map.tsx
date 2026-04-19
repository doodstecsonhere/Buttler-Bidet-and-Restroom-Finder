import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
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

// ─── Icons ─────────────────────────────────────────────────────────────────

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

// Pulsing green dot — strictly required per spec to stand out against gold/blue-gray markers.
const greenUserIcon = L.divIcon({
  className: 'bg-transparent border-none',
  html: `
    <div style="position:relative;display:flex;align-items:center;justify-content:center;width:28px;height:28px;">
      <div style="position:absolute;width:28px;height:28px;border-radius:50%;background:rgba(34,197,94,0.35);animation:buttler-pulse 1.8s ease-out infinite;"></div>
      <div style="position:absolute;width:22px;height:22px;border-radius:50%;background:rgba(34,197,94,0.2);animation:buttler-pulse 1.8s ease-out 0.4s infinite;"></div>
      <div style="position:relative;width:14px;height:14px;border-radius:50%;background:#22c55e;border:2.5px solid white;box-shadow:0 2px 8px rgba(34,197,94,0.6);z-index:1;"></div>
    </div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
});

// Inject the keyframe animation once into the document head.
if (typeof document !== 'undefined' && !document.getElementById('buttler-pulse-style')) {
  const style = document.createElement('style');
  style.id = 'buttler-pulse-style';
  style.textContent = `
    @keyframes buttler-pulse {
      0%   { transform: scale(0.8); opacity: 0.9; }
      50%  { transform: scale(1.4); opacity: 0.4; }
      100% { transform: scale(1.9); opacity: 0;   }
    }
    @keyframes buttler-spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes buttler-fadein {
      from { opacity: 0; transform: translateX(-50%) translateY(6px); }
      to   { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
  `;
  document.head.appendChild(style);
}

// ─── Map bounds fitter (fires once on first data load) ──────────────────────

function MapBounds({ restrooms, userLocation, defaultCenter }: {
  restrooms: Restroom[];
  userLocation: Location | null;
  defaultCenter: [number, number];
}) {
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

// ─── FAB: "Show Your Location" ──────────────────────────────────────────────
// Rendered via portal into the Leaflet map container so it never causes
// re-renders of the 1168 restroom markers.

const LOCATE_ERROR_MSG = 'Location access needed to show user location.';

function LocateButton() {
  const map = useMap();
  const [locatedPos, setLocatedPos] = useState<[number, number] | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      showToast(LOCATE_ERROR_MSG);
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setLocatedPos(coords);
        setLocating(false);
        // Smooth fly-to; zoom 17 gives a tight neighbourhood view.
        map.flyTo(coords, 17, { animate: true, duration: 1.2 });
      },
      () => {
        setLocating(false);
        showToast(LOCATE_ERROR_MSG);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, [map, showToast]);

  const container = map.getContainer();

  return (
    <>
      {/* FAB — portaled into the Leaflet container so it sits in the map DOM hierarchy */}
      {createPortal(
        <button
          onClick={handleLocate}
          disabled={locating}
          title="Show your location"
          aria-label="Show your location"
          style={{
            position: 'absolute',
            bottom: 80,
            right: 10,
            zIndex: 400,
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: locating ? '#f0fdf4' : 'white',
            border: '2px solid rgba(0,0,0,0.12)',
            boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: locating ? 'default' : 'pointer',
            transition: 'box-shadow 0.15s, background 0.15s',
            outline: 'none',
          }}
        >
          {locating ? (
            /* Spinner while acquiring GPS */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#22c55e"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ animation: 'buttler-spin 1s linear infinite' }}
            >
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          ) : (
            /* GPS crosshair / location target icon */
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke={locatedPos ? '#22c55e' : '#374151'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M1 12h4M19 12h4" />
            </svg>
          )}
        </button>,
        container,
      )}

      {/* Toast — portaled into document.body so it floats above everything */}
      {toast &&
        createPortal(
          <div
            style={{
              position: 'fixed',
              bottom: 24,
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 99999,
              background: 'rgba(17,24,39,0.92)',
              color: 'white',
              fontSize: 13,
              fontWeight: 500,
              padding: '10px 18px',
              borderRadius: 10,
              boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              animation: 'buttler-fadein 0.2s ease',
            }}
          >
            {toast}
          </div>,
          document.body,
        )}

      {/* Green pulsing dot marker — only re-renders this single marker, not the 1168 restrooms */}
      {locatedPos && (
        <Marker position={locatedPos} icon={greenUserIcon} zIndexOffset={1000}>
          <Popup className="font-sans">
            <div style={{ fontWeight: 700, textAlign: 'center', fontSize: 13 }}>You are here</div>
            <div style={{ fontSize: 11, color: '#6b7280', textAlign: 'center', marginTop: 2 }}>
              Hold it in, we found help.
            </div>
          </Popup>
        </Marker>
      )}
    </>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

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

// ─── Main Map component ───────────────────────────────────────────────────────

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

      {/* FAB + green dot + toast — all isolated from restroom rendering */}
      <LocateButton />

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
