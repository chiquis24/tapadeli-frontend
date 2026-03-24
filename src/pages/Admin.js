import { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const API = `${process.env.REACT_APP_API_URL}/api`;

const ESTADOS_COLOR = {
  pendiente: '#f59e0b', aceptado: '#3b82f6',
  en_camino: '#7c3aed', entregado: '#10b981', cancelado: '#ef4444'
};

function SelectorMapa({ onSeleccionar }) {
  useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      onSeleccionar(lat, lng);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
        );
        const data = await res.json();
        onSeleccionar(lat, lng, data.display_name);
      } catch {
        onSeleccionar(lat, lng);
      }
    }
  });
  return null;
}

export default function Admin() {
  const [seccion, setSeccion] = useState('restaurantes');
  const [restaurantes, setRestaurantes] = useState([]);
  const [platillos, setPlatillos] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [restSeleccionado, setRestSeleccionado] = useState('');
  const [marcador, setMarcador] = useState(null);

  const [formRest, setFormRest] = useState({
    nombre: '', descripcion: '', categoria: '', imagen: '',
    direccion: '', coordenadas: { lat: '', lng: '' }
  });
  const [formPlat, setFormPlat] = useState({
    nombre: '', descripcion: '', precio: '', categoria: '', restauranteId: ''
  });

  useEffect(() => { cargarDatos(); }, []);

  const cargarDatos = async () => {
    const [r, ped] = await Promise.all([
      axios.get(`${API}/restaurantes`),
      axios.get(`${API}/pedidos`)
    ]);
    setRestaurantes(r.data);
    setPedidos(ped.data);
  };

  const cargarPlatillos = async (restId) => {
    setRestSeleccionado(restId);
    setFormPlat(prev => ({ ...prev, restauranteId: restId }));
    const res = await axios.get(`${API}/restaurantes/${restId}`);
    setPlatillos(res.data.platillos);
  };

  const handleSeleccionarUbicacion = (lat, lng, direccion) => {
    setMarcador([lat, lng]);
    setFormRest(p => ({
      ...p,
      coordenadas: { lat, lng },
      ...(direccion && { direccion })
    }));
  };

  const crearRestaurante = async () => {
    if (!formRest.nombre || !formRest.coordenadas.lat) {
      alert('Nombre y ubicación en el mapa son obligatorios');
      return;
    }
    await axios.post(`${API}/restaurantes`, {
      ...formRest,
      coordenadas: {
        lat: parseFloat(formRest.coordenadas.lat),
        lng: parseFloat(formRest.coordenadas.lng)
      }
    });
    setFormRest({ nombre: '', descripcion: '', categoria: '', imagen: '', direccion: '', coordenadas: { lat: '', lng: '' } });
    setMarcador(null);
    cargarDatos();
  };

  const eliminarRestaurante = async (id) => {
    if (!window.confirm('¿Eliminar Restaurante?')) return;
    await axios.delete(`${API}/restaurantes/${id}`);
    cargarDatos()
  }

  const crearPlatillo = async () => {
    if (!formPlat.nombre || !formPlat.precio || !formPlat.restauranteId) {
      alert('Nombre, precio y restaurante son obligatorios');
      return;
    }
    await axios.post(`${API}/platillos`, {
      ...formPlat,
      precio: parseFloat(formPlat.precio)
    });
    setFormPlat(prev => ({ ...prev, nombre: '', descripcion: '', precio: '', categoria: '' }));
    cargarPlatillos(formPlat.restauranteId);
  };

  const eliminarPlatillo = async (id) => {
    if (!window.confirm('¿Eliminar este platillo?')) return;
    await axios.delete(`${API}/platillos/${id}`);
    cargarPlatillos(restSeleccionado);
  };

  const cambiarEstadoPedido = async (id, estado) => {
    await axios.put(`${API}/pedidos/${id}/estado`, { estado });
    cargarDatos();
  };

  const NAV = [
    { key: 'restaurantes', label: 'Restaurantes', count: restaurantes.length },
    { key: 'platillos',    label: 'Platillos',    count: platillos.length },
    { key: 'pedidos',      label: 'Pedidos',       count: pedidos.length },
  ];

  return (
    <div style={styles.container}>

      {/* Sidebar */}
      <div style={styles.sidebar}>
        <div style={styles.sidebarHeader}>
          <div style={styles.logoBox}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="5" stroke="white" strokeWidth="1.5"/>
              <path d="M7 4v3l2 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <p style={{ color: '#f1f1f1', fontSize: '14px', fontWeight: '600', margin: 0 }}>TapaDeli</p>
            <p style={{ color: '#555', fontSize: '11px', margin: 0 }}>Panel de administración</p>
          </div>
        </div>

        <div style={styles.navDivider} />

        {NAV.map(item => (
          <button
            key={item.key}
            onClick={() => setSeccion(item.key)}
            style={{
              ...styles.sidebarBtn,
              background: seccion === item.key ? '#2a1f4a' : 'transparent',
              color: seccion === item.key ? '#a78bfa' : '#666',
              borderLeft: seccion === item.key ? '2px solid #7c3aed' : '2px solid transparent',
            }}
          >
            <span>{item.label}</span>
            <span style={{
              background: seccion === item.key ? '#7c3aed' : '#222',
              color: seccion === item.key ? '#fff' : '#555',
              fontSize: '11px', padding: '2px 7px', borderRadius: '20px',
            }}>{item.count}</span>
          </button>
        ))}
      </div>

      {/* Contenido */}
      <div style={styles.content}>

        {/* ── RESTAURANTES ── */}
        {seccion === 'restaurantes' && (
          <div>
            <div style={styles.pageHeader}>
              <h2 style={styles.titulo}>Restaurantes</h2>
              <p style={styles.subtitulo}>{restaurantes.length} registrados</p>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitulo}>Nuevo restaurante</h3>
              <div style={styles.formGrid}>
                <input style={styles.input} placeholder="Nombre *"
                  value={formRest.nombre}
                  onChange={e => setFormRest(p => ({ ...p, nombre: e.target.value }))} />
                <input style={styles.input} placeholder="Categoría (Tacos, Pizzas...)"
                  value={formRest.categoria}
                  onChange={e => setFormRest(p => ({ ...p, categoria: e.target.value }))} />
                <input style={styles.input} placeholder="Emoji del ícono (🌮, 🍕...)"
                  value={formRest.imagen}
                  onChange={e => setFormRest(p => ({ ...p, imagen: e.target.value }))} />
                <input style={styles.input} placeholder="Descripción"
                  value={formRest.descripcion}
                  onChange={e => setFormRest(p => ({ ...p, descripcion: e.target.value }))} />
              </div>

              {/* Mapa selector */}
              <div style={{ marginTop: '14px' }}>
                <p style={{ color: '#666', fontSize: '12px', fontWeight: '500', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 8px' }}>
                  Ubicación — haz clic en el mapa para seleccionar
                </p>
                <div style={{ borderRadius: '10px', overflow: 'hidden', border: '1px solid #2a2a2a' }}>
                  <MapContainer
                    center={[14.9081, -92.2574]}
                    zoom={14}
                    style={{ height: '260px', width: '100%' }}
                  >
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <SelectorMapa onSeleccionar={handleSeleccionarUbicacion} />
                    {marcador && <Marker position={marcador} />}
                  </MapContainer>
                </div>

                {formRest.coordenadas.lat && (
                  <div style={{ marginTop: '8px', background: '#111', border: '1px solid #2a2a2a', borderRadius: '8px', padding: '10px 12px' }}>
                    <p style={{ color: '#a78bfa', fontSize: '12px', margin: '0 0 2px', fontWeight: '500' }}>Ubicación seleccionada</p>
                    <p style={{ color: '#555', fontSize: '12px', margin: 0 }}>{formRest.direccion || `${formRest.coordenadas.lat}, ${formRest.coordenadas.lng}`}</p>
                  </div>
                )}
              </div>

              <button
                onClick={crearRestaurante}
                style={styles.btnPrimary}
                onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
                onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
              >
                Crear restaurante
              </button>
            </div>

            <div style={styles.lista}>
              {restaurantes.map(r => (
                <div key={r._id} style={styles.listaItem}>
                  <span style={{ fontSize: '24px', lineHeight: 1 }}>{r.imagen}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={styles.itemNombre}>{r.nombre}</p>
                    <p style={styles.itemSub}>{r.categoria} · {r.direccion}</p>
                    <p style={styles.itemSub}>{r.coordenadas?.lat}, {r.coordenadas?.lng}</p>
                  </div>
                  <span style={{
                    ...styles.badge,
                    background: r.activo ? '#0a2a1e' : '#2a1010',
                    color: r.activo ? '#10b981' : '#ef4444',
                    border: r.activo ? '1px solid #1a3a2a' : '1px solid #3a1515'
                  }}>
                    {r.activo ? 'Activo' : 'Inactivo'}
                  </span>
                  <button
  onClick={() => eliminarRestaurante(r._id)}
  style={styles.btnDanger}
  onMouseEnter={e => e.currentTarget.style.background = '#7f1d1d'}
  onMouseLeave={e => e.currentTarget.style.background = '#2a1010'}
>
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 3.5h10M5.5 3.5V2.5h3v1M4.5 3.5l.5 8h4l.5-8" stroke="#fca5a5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── PLATILLOS ── */}
        {seccion === 'platillos' && (
          <div>
            <div style={styles.pageHeader}>
              <h2 style={styles.titulo}>Platillos</h2>
              <p style={styles.subtitulo}>Selecciona un restaurante para gestionar su menú</p>
            </div>

            <div style={styles.card}>
              <h3 style={styles.cardTitulo}>Restaurante</h3>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {restaurantes.map(r => (
                  <button
                    key={r._id}
                    onClick={() => cargarPlatillos(r._id)}
                    style={{
                      ...styles.btnSelector,
                      background: restSeleccionado === r._id ? '#2a1f4a' : '#111',
                      color: restSeleccionado === r._id ? '#a78bfa' : '#666',
                      borderColor: restSeleccionado === r._id ? '#7c3aed' : '#2a2a2a',
                    }}
                  >
                    {r.imagen} {r.nombre}
                  </button>
                ))}
              </div>
            </div>

            {restSeleccionado && (
              <div style={styles.card}>
                <h3 style={styles.cardTitulo}>Nuevo platillo</h3>
                <div style={styles.formGrid}>
                  <input style={styles.input} placeholder="Nombre *"
                    value={formPlat.nombre}
                    onChange={e => setFormPlat(p => ({ ...p, nombre: e.target.value }))} />
                  <input style={styles.input} placeholder="Precio (MXN) *" type="number"
                    value={formPlat.precio}
                    onChange={e => setFormPlat(p => ({ ...p, precio: e.target.value }))} />
                  <input style={styles.input} placeholder="Categoría"
                    value={formPlat.categoria}
                    onChange={e => setFormPlat(p => ({ ...p, categoria: e.target.value }))} />
                  <input style={styles.input} placeholder="Descripción"
                    value={formPlat.descripcion}
                    onChange={e => setFormPlat(p => ({ ...p, descripcion: e.target.value }))} />
                </div>
                <button
                  onClick={crearPlatillo}
                  style={styles.btnPrimary}
                  onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
                  onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
                >
                  Agregar platillo
                </button>
              </div>
            )}

            {platillos.length > 0 && (
              <div style={styles.lista}>
                {platillos.map(p => (
                  <div key={p._id} style={styles.listaItem}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={styles.itemNombre}>{p.nombre}</p>
                      <p style={styles.itemSub}>{p.descripcion} · {p.categoria}</p>
                    </div>
                    <span style={styles.precio}>${p.precio} MXN</span>
                    <button
                      onClick={() => eliminarPlatillo(p._id)}
                      style={styles.btnDanger}
                      onMouseEnter={e => e.currentTarget.style.background = '#7f1d1d'}
                      onMouseLeave={e => e.currentTarget.style.background = '#2a1010'}
                    >
                      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M2 3.5h10M5.5 3.5V2.5h3v1M4.5 3.5l.5 8h4l.5-8" stroke="#fca5a5" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PEDIDOS ── */}
        {seccion === 'pedidos' && (
          <div>
            <div style={styles.pageHeader}>
              <h2 style={styles.titulo}>Pedidos</h2>
              <p style={styles.subtitulo}>{pedidos.length} en total</p>
            </div>

            <div style={styles.lista}>
              {pedidos.length === 0 && (
                <div style={{ ...styles.card, textAlign: 'center', padding: '40px' }}>
                  <p style={{ color: '#555', fontSize: '14px', margin: 0 }}>No hay pedidos aún</p>
                </div>
              )}
              {pedidos.map(p => (
                <div key={p._id} style={styles.pedidoCard}>
                  <div style={styles.pedidoHeader}>
                    <div>
                      <p style={styles.itemNombre}>Pedido #{p._id.slice(-6).toUpperCase()}</p>
                      <p style={styles.itemSub}>{p.restauranteId?.nombre} · {p.clienteNombre}</p>
                      <p style={styles.itemSub}>{p.direccionEntrega}</p>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <span style={{
                        background: ESTADOS_COLOR[p.estado] + '22',
                        color: ESTADOS_COLOR[p.estado],
                        border: `1px solid ${ESTADOS_COLOR[p.estado]}44`,
                        fontSize: '11px', padding: '3px 10px',
                        borderRadius: '20px', fontWeight: '500',
                        display: 'inline-block', marginBottom: '8px',
                      }}>
                        {p.estado}
                      </span>
                      <p style={styles.precio}>${p.total} MXN</p>
                    </div>
                  </div>

                  <div style={styles.pedidoPlatillos}>
                    {p.platillos?.map((pl, i) => (
                      <span key={i} style={styles.platTag}>{pl.nombre} x{pl.cantidad}</span>
                    ))}
                  </div>

                  <div style={styles.pedidoAcciones}>
                    <span style={{ color: '#555', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Estado:</span>
                    {['aceptado', 'en_camino', 'entregado', 'cancelado'].map(est => (
                      <button
                        key={est}
                        onClick={() => cambiarEstadoPedido(p._id, est)}
                        style={{
                          ...styles.btnEstado,
                          background: p.estado === est ? ESTADOS_COLOR[est] + '22' : 'transparent',
                          color: p.estado === est ? ESTADOS_COLOR[est] : '#555',
                          borderColor: p.estado === est ? ESTADOS_COLOR[est] + '66' : '#2a2a2a',
                        }}
                      >
                        {est}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', minHeight: '100vh', background: '#0f0f0f' },
  sidebar: { width: '220px', background: '#111', borderRight: '1px solid #1e1e1e', padding: '20px', display: 'flex', flexDirection: 'column', gap: '4px', flexShrink: 0 },
  sidebarHeader: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' },
  logoBox: { width: '28px', height: '28px', background: '#7c3aed', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  navDivider: { height: '1px', background: '#1e1e1e', margin: '8px 0 12px' },
  sidebarBtn: { border: 'none', padding: '10px 12px', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', fontSize: '13px', fontWeight: '500', display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'all 0.15s' },
  content: { flex: 1, padding: '30px', overflowY: 'auto' },
  pageHeader: { marginBottom: '24px' },
  titulo: { color: '#f1f1f1', fontSize: '20px', fontWeight: '600', margin: '0 0 4px' },
  subtitulo: { color: '#555', fontSize: '13px', margin: 0 },
  card: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px', marginBottom: '16px' },
  cardTitulo: { color: '#888', fontSize: '12px', fontWeight: '500', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.06em' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  input: { background: '#111', border: '1px solid #2a2a2a', color: '#f1f1f1', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', width: '100%', boxSizing: 'border-box', outline: 'none' },
  btnPrimary: { background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '13px', marginTop: '12px', transition: 'background 0.15s' },
  btnSelector: { border: '1px solid', padding: '7px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '13px', transition: 'all 0.15s' },
  btnDanger: { background: '#2a1010', border: '1px solid #3a1515', padding: '7px 10px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', transition: 'background 0.15s' },
  lista: { display: 'flex', flexDirection: 'column', gap: '8px' },
  listaItem: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '10px', padding: '14px 16px', display: 'flex', alignItems: 'center', gap: '14px' },
  itemNombre: { color: '#f1f1f1', fontWeight: '500', margin: '0 0 3px', fontSize: '14px' },
  itemSub: { color: '#555', fontSize: '12px', margin: '2px 0' },
  badge: { fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: '500', flexShrink: 0 },
  precio: { color: '#7c3aed', fontWeight: '600', fontSize: '14px', flexShrink: 0 },
  pedidoCard: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  pedidoHeader: { display: 'flex', justifyContent: 'space-between', gap: '16px' },
  pedidoPlatillos: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  platTag: { background: '#111', border: '1px solid #2a2a2a', color: '#888', fontSize: '12px', padding: '3px 10px', borderRadius: '20px' },
  pedidoAcciones: { display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', paddingTop: '12px', borderTop: '1px solid #1e1e1e' },
  btnEstado: { border: '1px solid', padding: '5px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px', fontWeight: '500', transition: 'all 0.15s' },
};