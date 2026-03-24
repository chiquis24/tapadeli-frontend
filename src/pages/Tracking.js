import { useNavigate, useParams } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import axios from 'axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const iconoMoto = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/2972/2972185.png',
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

function MoverMapa({ posicion }) {
  const map = useMap();
  useEffect(() => {
    if (posicion) map.flyTo(posicion, 16, { duration: 0.5 });
  }, [posicion]);
  return null;
}

const ESTADOS = [
  { key: 'pendiente', label: 'Esperando confirmación' },
  { key: 'aceptado',  label: 'Pedido aceptado' },
  { key: 'en_camino', label: 'En camino' },
  { key: 'entregado', label: 'Entregado' },
];

const ESTADO_COLORS = {
  pendiente: '#f59e0b',
  aceptado:  '#3b82f6',
  en_camino: '#7c3aed',
  entregado: '#10b981',
};

export default function Tracking() {
  const navigate = useNavigate();
  const { pedidoId } = useParams();
  const [pedido, setPedido] = useState(null);
  const [posRepartidor, setPosRepartidor] = useState(null);
  const [estado, setEstado] = useState('pendiente');
  const simulacionRef = useRef(null);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/pedidos`)
      .then(res => {
        const p = res.data.find(p => p._id === pedidoId);
        if (p) {
          setPedido(p);
          setEstado(p.estado);
          if (p.restauranteId?.coordenadas) iniciarSimulacion(p);
        }
      });
    return () => {
      if (simulacionRef.current) cancelAnimationFrame(simulacionRef.current);
    };
  }, [pedidoId]);

  const moverSuave = (origen, destino, duracion, callback) => {
    let inicio = null;
    const animar = (timestamp) => {
      if (!inicio) inicio = timestamp;
      const progreso = (timestamp - inicio) / duracion;
      if (progreso >= 1) {
        setPosRepartidor(destino);
        callback && callback();
        return;
      }
      setPosRepartidor([
        origen[0] + (destino[0] - origen[0]) * progreso,
        origen[1] + (destino[1] - origen[1]) * progreso,
      ]);
      simulacionRef.current = requestAnimationFrame(animar);
    };
    simulacionRef.current = requestAnimationFrame(animar);
  };

  const iniciarSimulacion = (pedidoData) => {
    const restaurante = [
      pedidoData.restauranteId.coordenadas.lat,
      pedidoData.restauranteId.coordenadas.lng
    ];
    const cliente = [
      restaurante[0] + (Math.random() * 0.01 - 0.005),
      restaurante[1] + (Math.random() * 0.01 - 0.005)
    ];
    const inicio = [restaurante[0] + 0.01, restaurante[1] + 0.01];
    setPosRepartidor(inicio);
    setTimeout(() => setEstado('aceptado'), 2000);
    moverSuave(inicio, restaurante, 4000, () => {
      setEstado('en_camino');
      moverSuave(restaurante, cliente, 5000, () => setEstado('entregado'));
    });
  };

  const indexActual = ESTADOS.findIndex(e => e.key === estado);
  const colorActual = ESTADO_COLORS[estado];

  return (
    <div style={styles.container}>
      <div style={styles.inner}>

        {/* Header */}
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>Rastreando en tiempo real</p>
            <h1 style={styles.titulo}>Tu pedido está en camino</h1>
            <p style={styles.pedidoId}>Pedido #{pedidoId?.slice(-6).toUpperCase()}</p>
          </div>
        </div>

        {/* Stepper de estados */}
        <div style={styles.stepper}>
          {ESTADOS.map((e, i) => {
            const activo = i <= indexActual;
            const esCurrent = i === indexActual;
            return (
              <div key={e.key} style={styles.stepItem}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '28px', height: '28px',
                    borderRadius: '50%',
                    background: activo ? colorActual : '#1a1a1a',
                    border: `1px solid ${activo ? colorActual : '#2a2a2a'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    transition: 'all 0.3s',
                  }}>
                    {activo && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <p style={{
                      margin: 0,
                      fontSize: '13px',
                      fontWeight: esCurrent ? '600' : '400',
                      color: esCurrent ? '#f1f1f1' : activo ? '#888' : '#444',
                      transition: 'color 0.3s',
                    }}>{e.label}</p>
                  </div>
                </div>
                {i < ESTADOS.length - 1 && (
                  <div style={{
                    width: '1px',
                    height: '20px',
                    background: i < indexActual ? colorActual : '#2a2a2a',
                    marginLeft: '14px',
                    transition: 'background 0.3s',
                  }} />
                )}
              </div>
            );
          })}
        </div>

        {/* Mapa */}
        <div style={styles.mapaWrapper}>
          {posRepartidor ? (
            <MapContainer
              center={posRepartidor}
              zoom={16}
              style={{ height: '360px', width: '100%' }}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MoverMapa posicion={posRepartidor} />
              <Marker position={posRepartidor} icon={iconoMoto}>
                <Popup>Tu repartidor</Popup>
              </Marker>
              {pedido?.restauranteId?.coordenadas && (
                <Marker position={[
                  pedido.restauranteId.coordenadas.lat,
                  pedido.restauranteId.coordenadas.lng
                ]}>
                  <Popup>{pedido.restauranteId.nombre}</Popup>
                </Marker>
              )}
            </MapContainer>
          ) : (
            <div style={styles.mapaPlaceholder}>
              <p style={{ color: '#555', fontSize: '13px' }}>Cargando mapa...</p>
            </div>
          )}
        </div>

        {/* Entregado */}
        {estado === 'entregado' && (
          <div style={styles.entregadoCard}>
            <div style={styles.entregadoIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M4 12l5 5L20 7" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <p style={{ color: '#f1f1f1', fontWeight: '600', margin: '0 0 4px', fontSize: '15px' }}>¡Pedido entregado!</p>
              <p style={{ color: '#555', fontSize: '13px', margin: 0 }}>Gracias por usar TapaDeli</p>
            </div>
            <button
              style={styles.btnFinal}
              onClick={() => navigate('/')}
              onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
              onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
            >
              Volver al inicio
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#0f0f0f',
    backgroundImage: 'radial-gradient(circle, #2a2a2a 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    padding: '30px 20px',
  },
  inner: { maxWidth: '680px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' },

  header: {
    background: '#111',
    border: '1px solid #1e1e1e',
    borderRadius: '12px',
    padding: '24px',
  },
  eyebrow: { fontSize: '12px', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px', fontWeight: '500' },
  titulo: { color: '#f1f1f1', fontSize: '20px', fontWeight: '600', margin: '0 0 4px' },
  pedidoId: { color: '#555', fontSize: '13px', margin: 0 },

  stepper: {
    background: '#111',
    border: '1px solid #1e1e1e',
    borderRadius: '12px',
    padding: '20px 24px',
  },
  stepItem: { display: 'flex', flexDirection: 'column' },

  mapaWrapper: {
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #2a2a2a',
  },
  mapaPlaceholder: {
    height: '360px',
    background: '#111',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  entregadoCard: {
    background: '#111',
    border: '1px solid #1a3a2a',
    borderRadius: '12px',
    padding: '20px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  entregadoIcon: {
    width: '44px', height: '44px',
    background: '#0a2a1e',
    borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },
  btnFinal: {
    background: '#7c3aed', color: '#fff', border: 'none',
    padding: '10px 20px', borderRadius: '8px', cursor: 'pointer',
    fontWeight: '500', fontSize: '13px', marginLeft: 'auto',
    transition: 'background 0.15s',
  },
};