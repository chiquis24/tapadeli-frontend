import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPedidosPorUsuario } from '../services/api';

const ESTADOS_COLOR = {
  pendiente: '#f59e0b', aceptado: '#3b82f6',
  en_camino: '#7c3aed', entregado: '#10b981', cancelado: '#ef4444'
};

export default function Historial() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [pedidos, setPedidos] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!usuario) {
      navigate('/login');
      return;
    }
    getPedidosPorUsuario(usuario.uid)
      .then(res => {
        setPedidos(res.data);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, [usuario, navigate]);

  if (cargando) return (
    <div style={styles.loading}>
      <p style={{ color: '#7c3aed', fontSize: '14px' }}>Cargando historial...</p>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.inner}>

        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>Tu cuenta</p>
            <h1 style={styles.titulo}>Historial de pedidos</h1>
            <p style={styles.subtitulo}>{pedidos.length} pedido{pedidos.length !== 1 ? 's' : ''} realizados</p>
          </div>
        </div>

        {pedidos.length === 0 ? (
          <div style={styles.empty}>
            <div style={styles.emptyIcon}>
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <path d="M4 4h4l4 14h12l3-9H9" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="23" r="1.5" fill="#555"/>
                <circle cx="21" cy="23" r="1.5" fill="#555"/>
              </svg>
            </div>
            <p style={{ color: '#f1f1f1', fontSize: '15px', fontWeight: '500', margin: '0 0 8px' }}>No tienes pedidos aún</p>
            <p style={{ color: '#555', fontSize: '13px', margin: '0 0 24px' }}>Haz tu primer pedido desde los restaurantes</p>
            <button
              onClick={() => navigate('/')}
              style={styles.btnVer}
              onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
              onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
            >
              Ver restaurantes
            </button>
          </div>
        ) : (
          <div style={styles.lista}>
            {pedidos.map(p => (
              <div key={p._id} style={styles.card}>
                <div style={styles.cardHeader}>
                  <div>
                    <p style={styles.pedidoId}>Pedido #{p._id.slice(-6).toUpperCase()}</p>
                    <p style={styles.restaurante}>{p.restauranteId?.nombre}</p>
                    <p style={styles.fecha}>{new Date(p.createdAt).toLocaleDateString('es-MX', {
                      year: 'numeric', month: 'long', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}</p>
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
                    <p style={styles.total}>${p.total} <span style={{ fontSize: '11px', color: '#555', fontWeight: '400' }}>MXN</span></p>
                  </div>
                </div>

                <div style={styles.platillos}>
                  {p.platillos?.map((pl, i) => (
                    <span key={i} style={styles.platTag}>{pl.nombre} x{pl.cantidad}</span>
                  ))}
                </div>

                <div style={styles.cardFooter}>
                  <span style={styles.direccion}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '4px' }}>
                      <path d="M6 1C4.067 1 2.5 2.567 2.5 4.5c0 2.625 3.5 6.5 3.5 6.5s3.5-3.875 3.5-6.5C9.5 2.567 7.933 1 6 1zm0 4.75a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" fill="#555"/>
                    </svg>
                    {p.direccionEntrega}
                  </span>
                  {p.estado !== 'entregado' && p.estado !== 'cancelado' && (
                    <button
                      onClick={() => navigate(`/tracking/${p._id}`)}
                      style={styles.btnTracking}
                      onMouseEnter={e => e.currentTarget.style.borderColor = '#7c3aed'}
                      onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
                    >
                      Ver tracking
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh', background: '#0f0f0f',
    backgroundImage: 'radial-gradient(circle, #2a2a2a 1px, transparent 1px)',
    backgroundSize: '24px 24px', padding: '30px 20px',
  },
  inner: { maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' },
  loading: { minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  header: { background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '24px' },
  eyebrow: { fontSize: '12px', color: '#7c3aed', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 8px', fontWeight: '500' },
  titulo: { color: '#f1f1f1', fontSize: '20px', fontWeight: '600', margin: '0 0 4px' },
  subtitulo: { color: '#555', fontSize: '13px', margin: 0 },
  empty: { background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '48px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  emptyIcon: { width: '56px', height: '56px', background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' },
  btnVer: { background: '#7c3aed', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '13px', transition: 'background 0.15s' },
  lista: { display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { background: '#111', border: '1px solid #1e1e1e', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', gap: '16px' },
  pedidoId: { color: '#f1f1f1', fontWeight: '600', fontSize: '14px', margin: '0 0 4px' },
  restaurante: { color: '#888', fontSize: '13px', margin: '0 0 4px' },
  fecha: { color: '#444', fontSize: '12px', margin: 0 },
  total: { color: '#f1f1f1', fontWeight: '600', fontSize: '18px', margin: 0 },
  platillos: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  platTag: { background: '#1a1a1a', border: '1px solid #2a2a2a', color: '#888', fontSize: '12px', padding: '3px 10px', borderRadius: '20px' },
  cardFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px solid #1e1e1e' },
  direccion: { color: '#555', fontSize: '12px', display: 'flex', alignItems: 'center' },
  btnTracking: { background: 'transparent', border: '1px solid #2a2a2a', color: '#a78bfa', fontSize: '12px', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', transition: 'border-color 0.15s' },
};