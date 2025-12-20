"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

interface OfficeMapInnerProps {
  location: {
    lat: number;
    lng: number;
  };
}

// Create custom office marker icon
function createOfficeMarkerIcon(): L.DivIcon {
  return L.divIcon({
    className: "custom-marker",
    html: `
      <div style="
        background-color: #1e3a5f;
        width: 40px;
        height: 40px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid #d4a853;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="white"
          style="transform: rotate(45deg);"
        >
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  });
}

export function OfficeMapInner({ location }: OfficeMapInnerProps) {
  const markerIcon = createOfficeMarkerIcon();

  return (
    <MapContainer
      center={[location.lat, location.lng]}
      zoom={16}
      scrollWheelZoom={false}
      style={{ height: "300px", width: "100%" }}
      className="z-0 rounded-2xl"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[location.lat, location.lng]} icon={markerIcon}>
        <Popup>
          <div className="text-center">
            <strong className="text-primary">Trimurti Real Estate</strong>
            <br />
            <span className="text-sm text-muted-foreground">
              Kandivali West, Mumbai
            </span>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
