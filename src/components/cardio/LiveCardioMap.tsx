import { useEffect, useMemo, useRef } from "react";
import { Circle, CircleMarker, MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { CardioGpsPoint } from "@/hooks/useCardioGpsRecorder";

/** Carto Voyager — aspecto limpio similar a Strava (calles + terreno suave). */
const STRAVA_STYLE_TILE =
  "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
const STRAVA_ORANGE = "#FC4C02";
const POSITION_BLUE = "#2D8CFF";

type Props = {
  points: CardioGpsPoint[];
  className?: string;
  /** Si true, la cámara sigue el último punto (grabación en vivo). */
  followUser?: boolean;
};

function MapInvalidateSize() {
  const map = useMap();
  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize(), 80);
    return () => window.clearTimeout(t);
  }, [map]);
  return null;
}

/** Sigue al usuario sin reencuadrar todo el trayecto (comportamiento tipo Strava live). */
function MapFollowUser({
  positions,
  enabled,
}: {
  positions: L.LatLngExpression[];
  enabled: boolean;
}) {
  const map = useMap();
  const lastLenRef = useRef(0);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (!enabled || positions.length === 0) return;
    const last = positions[positions.length - 1] as L.LatLngTuple;
    const grew = positions.length > lastLenRef.current;
    lastLenRef.current = positions.length;

    if (!initializedRef.current) {
      initializedRef.current = true;
      map.setView(last, 16, { animate: false });
      return;
    }

    if (grew) {
      map.panTo(last, { animate: true, duration: 0.45 });
    }
  }, [map, positions, enabled]);

  return null;
}

function CurrentPositionMarker({ lat, lng }: { lat: number; lng: number }) {
  const icon = useMemo(
    () =>
      L.divIcon({
        className: "live-cardio-pos-icon",
        html: `<span class="live-cardio-pos-pulse"></span><span class="live-cardio-pos-dot"></span>`,
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      }),
    [],
  );

  return (
    <>
      <Circle
        center={[lat, lng]}
        radius={22}
        pathOptions={{
          color: POSITION_BLUE,
          weight: 1,
          opacity: 0.3,
          fillColor: POSITION_BLUE,
          fillOpacity: 0.1,
        }}
      />
      <Marker position={[lat, lng]} icon={icon} interactive={false} zIndexOffset={1000} />
    </>
  );
}

export function LiveCardioMap({ points, className, followUser = true }: Props) {
  const linePositions = useMemo(
    (): L.LatLngExpression[] => points.map((p) => [p.lat, p.lng]),
    [points],
  );
  const last = points.length > 0 ? points[points.length - 1] : null;
  const start = points.length > 0 ? points[0] : null;
  const center: [number, number] = last ? [last.lat, last.lng] : [40.4168, -3.7038];

  return (
    <div className={className}>
      <style>{`
        .live-cardio-pos-icon {
          background: transparent !important;
          border: none !important;
        }
        .live-cardio-pos-pulse {
          position: absolute;
          inset: 0;
          border-radius: 9999px;
          background: ${POSITION_BLUE};
          opacity: 0.35;
          animation: live-cardio-pulse 1.6s ease-out infinite;
        }
        .live-cardio-pos-dot {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 14px;
          height: 14px;
          margin: -7px 0 0 -7px;
          border-radius: 9999px;
          background: ${POSITION_BLUE};
          border: 3px solid #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.35);
        }
        @keyframes live-cardio-pulse {
          0% { transform: scale(0.45); opacity: 0.45; }
          70% { transform: scale(1.15); opacity: 0; }
          100% { transform: scale(1.15); opacity: 0; }
        }
        .leaflet-container.live-cardio-map {
          background: #e8eef2;
          font: inherit;
        }
      `}</style>
      <MapContainer
        center={center}
        zoom={linePositions.length ? 16 : 13}
        className="live-cardio-map h-full min-h-55 w-full z-0"
        scrollWheelZoom
        zoomControl={false}
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url={STRAVA_STYLE_TILE}
          maxZoom={20}
        />
        <MapInvalidateSize />
        <MapFollowUser positions={linePositions} enabled={followUser} />

        {linePositions.length > 1 ? (
          <>
            {/* Contorno claro para contraste sobre el mapa (técnica Strava) */}
            <Polyline
              positions={linePositions}
              pathOptions={{
                color: "#ffffff",
                weight: 8,
                opacity: 0.95,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
            <Polyline
              positions={linePositions}
              pathOptions={{
                color: STRAVA_ORANGE,
                weight: 5,
                opacity: 1,
                lineCap: "round",
                lineJoin: "round",
              }}
            />
          </>
        ) : null}

        {start && points.length > 1 ? (
          <CircleMarker
            center={[start.lat, start.lng]}
            radius={6}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: "#22c55e",
              fillOpacity: 1,
            }}
          />
        ) : null}

        {last ? <CurrentPositionMarker lat={last.lat} lng={last.lng} /> : null}
      </MapContainer>
    </div>
  );
}
