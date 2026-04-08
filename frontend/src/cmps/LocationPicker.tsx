import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icon issue in Leaflet + React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
}

const LocationPicker: React.FC<LocationPickerProps> = ({ lat, lng, onChange }) => {
  const [position, setPosition] = useState<L.LatLng | null>(
    lat !== 0 && lng !== 0 ? new L.LatLng(lat, lng) : null
  );

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setPosition(e.latlng);
        onChange(e.latlng.lat, e.latlng.lng);
      },
    });
    return position ? <Marker position={position} /> : null;
  };

  return (
    <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--secondary-bg)' }}>
      <MapContainer 
        center={[32.0853, 34.7818]} // Center of Israel
        zoom={7} 
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapEvents />
      </MapContainer>
      <div className="p-2 bg-dark text-center">
        <small className="text-accent">Click on the coastline to pin your dive location</small>
      </div>
    </div>
  );
};

export default LocationPicker;
