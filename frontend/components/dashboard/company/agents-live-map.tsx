"use client";

import * as React from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export type AgentMapAgent = {
  id: string;
  currentLat: number | null;
  currentLng: number | null;
  user: { name?: string | null; email: string };
  hub: { name: string; city: string };
};

export type AgentMapHub = {
  id: string;
  name: string;
  city: string;
  lat: number;
  lng: number;
};

function fixLeafletDefaultIcons() {
  type IconProto = { _getIconUrl?: unknown };
  const proto = L.Icon.Default.prototype as unknown as IconProto;
  delete proto._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

function FitBounds({ points }: { points: L.LatLngExpression[] }) {
  const map = useMap();
  React.useEffect(() => {
    if (points.length === 0) return;
    const b = L.latLngBounds(points);
    map.fitBounds(b, { padding: [48, 48], maxZoom: 13 });
  }, [map, points]);
  return null;
}

export function AgentsLiveMap(props: {
  agents: AgentMapAgent[];
  hubs: AgentMapHub[];
}) {
  const { agents, hubs } = props;

  React.useEffect(() => {
    fixLeafletDefaultIcons();
  }, []);

  const agentPoints: L.LatLngExpression[] = agents
    .filter(
      (a) =>
        a.currentLat != null &&
        a.currentLng != null &&
        !Number.isNaN(a.currentLat) &&
        !Number.isNaN(a.currentLng)
    )
    .map((a) => [a.currentLat as number, a.currentLng as number]);

  const hubPoints: L.LatLngExpression[] = hubs.map((h) => [h.lat, h.lng]);
  const allPoints = [...agentPoints, ...hubPoints];

  const defaultCenter: L.LatLngExpression = [20, 0];
  const center = allPoints.length === 1 ? allPoints[0]! : defaultCenter;
  const zoom = allPoints.length === 0 ? 2 : allPoints.length === 1 ? 11 : 3;

  const tileAttribution =
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className="z-0 h-[min(70vh,560px)] w-full rounded-xl border border-border/60"
      scrollWheelZoom
    >
      <TileLayer attribution={tileAttribution} url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {allPoints.length > 0 ? <FitBounds points={allPoints} /> : null}

      {hubs.map((h) => (
        <CircleMarker
          key={`hub-${h.id}`}
          center={[h.lat, h.lng]}
          radius={10}
          pathOptions={{
            color: "#64748b",
            fillColor: "#94a3b8",
            fillOpacity: 0.5,
          }}
        >
          <Popup>
            <span className="font-medium">Hub</span>
            <br />
            {h.name} — {h.city}
          </Popup>
        </CircleMarker>
      ))}

      {agents
        .filter(
          (a) =>
            a.currentLat != null &&
            a.currentLng != null &&
            !Number.isNaN(a.currentLat) &&
            !Number.isNaN(a.currentLng)
        )
        .map((a) => (
          <CircleMarker
            key={a.id}
            center={[a.currentLat as number, a.currentLng as number]}
            radius={12}
            pathOptions={{
              color: "#2563eb",
              fillColor: "#3b82f6",
              fillOpacity: 0.85,
            }}
          >
            <Popup>
              <span className="font-medium">Driver</span>
              <br />
              {a.user.name || a.user.email}
              <br />
              <span className="text-muted-foreground text-xs">
                Usually works from: {a.hub.name}
              </span>
            </Popup>
          </CircleMarker>
        ))}
    </MapContainer>
  );
}

export default AgentsLiveMap;
