import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import axios from 'axios';
import { useCarrito } from '../context/CarritoContext';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

export default function Restaurante() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { carrito, agregarAlCarrito, quitarDelCarrito, total, setRestauranteActivo } = useCarrito();
  const [data, setData] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/restaurantes/${id}`)
      .then(res => {
        setData(res.data);
        setRestauranteActivo(res.data.restaurante);
        setCargando(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (cargando) return (
    <div style={styles.loading}>
      <p style={{ color: '#7c3aed', fontSize: '14px' }}>Cargando...</p>
    </div>
  );

  const { restaurante, platillos } = data;

  return (
    <div style={styles.container}>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerInner}>
          <button onClick={() => navigate('/')} style={styles.back}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ marginRight: '6px' }}>
              <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Volver
          </button>
          <div style={styles.headerInfo}>
            <span style={{ fontSize: isMobile ? '28px' : '36px', lineHeight: 1 }}>{restaurante.imagen}</span>
            <div>
              <h1 style={{ ...styles.nombre, fontSize: isMobile ? '20px' : '24px' }}>{restaurante.nombre}</h1>
              <p style={styles.desc}>{restaurante.descripcion}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div style={{
        ...styles.body,
        gridTemplateColumns: isMobile ? '1fr' : '1fr 300px',
        padding: isMobile ? '16px' : '24px 30px',
      }}>

        {/* Columna izquierda */}
        <div style={styles.left}>

          {/* Mapa */}
          <div style={styles.seccion}>
            <h3 style={styles.subtitulo}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: '6px' }}>
                <path d="M7 1C5.067 1 3.5 2.567 3.5 4.5c0 2.625 3.5 6.5 3.5 6.5s3.5-3.875 3.5-6.5C10.5 2.567 8.933 1 7 1zm0 4.75a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" fill="#7c3aed"/>
              </svg>
              Ubicación del restaurante
            </h3>
            <div style={styles.mapaWrapper}>
              <MapContainer
                center={[restaurante.coordenadas.lat, restaurante.coordenadas.lng]}
                zoom={16}
                style={{ height: isMobile ? '180px' : '220px', width: '100%' }}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[restaurante.coordenadas.lat, restaurante.coordenadas.lng]}>
                  <Popup>{restaurante.nombre}</Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>

          {/* Menú */}
          <div style={styles.seccion}>
            <h3 style={styles.subtitulo}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: '6px' }}>
                <rect x="2" y="2" width="10" height="10" rx="2" stroke="#7c3aed" strokeWidth="1.5"/>
                <path d="M5 7h4M5 5h4M5 9h2" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Menú
            </h3>
            <div style={styles.menuGrid}>
              {platillos.map(p => {
                const enCarrito = carrito.find(c => c._id === p._id);
                return (
                  <div key={p._id} style={styles.platilloCard}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={styles.platNombre}>{p.nombre}</p>
                      <p style={styles.platDesc}>{p.descripcion}</p>
                      <p style={styles.platPrecio}>${p.precio} MXN</p>
                    </div>
                    <div style={styles.controls}>
                      {enCarrito ? (
                        <div style={styles.counter}>
                          <button onClick={() => quitarDelCarrito(p._id)} style={styles.btnCount}>−</button>
                          <span style={{ color: '#f1f1f1', minWidth: '20px', textAlign: 'center', fontSize: '14px' }}>{enCarrito.cantidad}</span>
                          <button onClick={() => agregarAlCarrito(p)} style={styles.btnCount}>+</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => agregarAlCarrito(p)}
                          style={styles.btnAgregar}
                          onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
                          onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
                        >
                          Agregar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Panel carrito */}
        <div style={{
          ...styles.carritoPanel,
          position: isMobile ? 'static' : 'sticky',
          top: isMobile ? 'auto' : '76px',
        }}>
          <div style={styles.carritoCabeza}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2h1.5l2 8h7l1.5-5H5" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="7" cy="13" r="1" fill="#7c3aed"/>
              <circle cx="12" cy="13" r="1" fill="#7c3aed"/>
            </svg>
            <h3 style={styles.carritoTitulo}>Tu pedido</h3>
          </div>

          {carrito.length === 0 ? (
            <p style={{ color: '#555', fontSize: '13px', marginTop: '8px' }}>Agrega platillos para comenzar</p>
          ) : (
            <>
              <div style={styles.carritoItems}>
                {carrito.map(p => (
                  <div key={p._id} style={styles.carritoItem}>
                    <span style={{ color: '#ccc', fontSize: '13px' }}>{p.nombre} <span style={{ color: '#555' }}>x{p.cantidad}</span></span>
                    <span style={{ color: '#a78bfa', fontSize: '13px', fontWeight: '500' }}>${p.precio * p.cantidad}</span>
                  </div>
                ))}
              </div>
              <div style={styles.totalRow}>
                <span style={{ color: '#888', fontSize: '13px' }}>Total</span>
                <span style={{ color: '#f1f1f1', fontWeight: '600', fontSize: '18px' }}>${total} <span style={{ fontSize: '12px', color: '#555', fontWeight: '400' }}>MXN</span></span>
              </div>
              <button
                style={styles.btnPedir}
                onClick={() => navigate('/carrito')}
                onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
                onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
              >
                Ir a pagar
              </button>
            </>
          )}
        </div>

      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: '100vh', background: '#0f0f0f' },
  loading: { minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  header: { background: '#111111', borderBottom: '1px solid #1e1e1e', padding: '24px 20px' },
  headerInner: { maxWidth: '1200px', margin: '0 auto' },
  back: {
    background: 'transparent', border: '1px solid #2a2a2a', color: '#aaa',
    padding: '7px 14px', borderRadius: '8px', cursor: 'pointer',
    fontSize: '13px', display: 'inline-flex', alignItems: 'center',
    marginBottom: '20px', transition: 'border-color 0.15s',
  },
  headerInfo: { display: 'flex', alignItems: 'center', gap: '16px' },
  nombre: { color: '#f1f1f1', margin: '0 0 4px', fontWeight: '600' },
  desc: { color: '#666', margin: 0, fontSize: '14px' },
  body: { display: 'grid', gap: '20px', maxWidth: '1200px', margin: '0 auto' },
  left: { minWidth: 0, display: 'flex', flexDirection: 'column', gap: '8px' },
  seccion: { marginBottom: '8px' },
  subtitulo: { color: '#888', fontSize: '13px', fontWeight: '500', margin: '0 0 12px', display: 'flex', alignItems: 'center', textTransform: 'uppercase', letterSpacing: '0.06em' },
  mapaWrapper: { borderRadius: '10px', overflow: 'hidden', border: '1px solid #2a2a2a' },
  menuGrid: { display: 'flex', flexDirection: 'column', gap: '8px' },
  platilloCard: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' },
  platNombre: { color: '#f1f1f1', fontWeight: '500', margin: '0 0 4px', fontSize: '14px' },
  platDesc: { color: '#666', fontSize: '13px', margin: '0 0 6px' },
  platPrecio: { color: '#7c3aed', fontWeight: '600', margin: 0, fontSize: '14px' },
  controls: { flexShrink: 0 },
  counter: { display: 'flex', alignItems: 'center', gap: '10px', background: '#222', borderRadius: '8px', padding: '4px 10px', border: '1px solid #2a2a2a' },
  btnCount: { background: 'none', border: 'none', color: '#a78bfa', fontSize: '16px', cursor: 'pointer', fontWeight: '500', padding: '0' },
  btnAgregar: { background: '#7c3aed', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '13px', transition: 'background 0.15s' },
  carritoPanel: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px', height: 'fit-content' },
  carritoCabeza: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' },
  carritoTitulo: { color: '#f1f1f1', margin: '0', fontSize: '15px', fontWeight: '600' },
  carritoItems: { display: 'flex', flexDirection: 'column', gap: '2px', marginBottom: '4px' },
  carritoItem: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #222' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '16px 0', paddingTop: '8px' },
  btnPedir: { background: '#7c3aed', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', width: '100%', fontSize: '14px', transition: 'background 0.15s' },
};