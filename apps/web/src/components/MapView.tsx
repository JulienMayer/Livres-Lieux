import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet';
import L from 'leaflet';

// Correction pour les icônes Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type MarkerDef = { 
  id: string; 
  name: string; 
  position: LatLngExpression;
  isFromList?: boolean;
};

// Composant pour mettre à jour le centre de la carte
function MapUpdater({ center }: { center: LatLngExpression }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  
  return null;
}

interface MapViewProps {
  markers: MarkerDef[];
  center: LatLngExpression;
}

export function MapView({ markers, center }: MapViewProps) {
  const defaultCenter: LatLngExpression = [48.8566, 2.3522]; // Paris par défaut
  
  return (
    <MapContainer 
      center={center || defaultCenter} 
      zoom={12} 
      style={{ height: '100%', width: '100%', paddingBottom: '0.1rem' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <MapUpdater center={center || defaultCenter} />
      
      {markers.map(m => (
        <Marker 
          key={m.id} 
          position={m.position}
          icon={m.isFromList ? 
            new L.Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            }) : 
            new L.Icon({
              iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
              shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
              shadowSize: [41, 41]
            })
          }
        >
          <Popup>
            <div>
              <strong>{m.name}</strong>
              {m.isFromList && (
                <div className="text-xs text-red-600 mt-1">
                  📚 Point de votre liste
                </div>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

