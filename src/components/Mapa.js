import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
     iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

//Coordenadas de Tapachula
const UBICACION_DEL_COMERCIO = [14.9081, -92.2574];

function Mapa() {
    return(
        <div>
      <h2>Ubicación del Comercio</h2>
      <MapContainer
        center={UBICACION_DEL_COMERCIO}
        zoom={15}
        style={{ height: '400px', width: '100%', borderRadius: '8px' }}
      >
        {/* Capa del mapa de OpenStreetMap */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; OpenStreetMap contributors'
        />

        {/* Marcador en la ubicación del comercio */}
        <Marker position={UBICACION_DEL_COMERCIO}>
          <Popup>
            Comercio Local Tapachula <br />
            ¡Bienvenido! Haz tu pedido digital aquí.
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}

export default Mapa;  