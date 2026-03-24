import { useNavigate } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext';
import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function Carrito() {
  const { carrito, agregarAlCarrito, quitarDelCarrito, vaciarCarrito, total, restauranteActivo } = useCarrito();
  const [direccion, setDireccion] = useState('');
  const [cargando, setCargando] = useState(false);
  const navigate = useNavigate();
  const { usuario } = useAuth();

  if (!usuario) {
  navigate('/login');
  return;
}
  const handlePedir = async () => {
    if (!direccion.trim()) {
      alert('Por favor ingresa tu dirección de entrega');
      return;
    }
    if (carrito.length === 0) {
      alert('Tu carrito está vacío');
      return;
    }

    setCargando(true);
    try {
      const pedidoRes = await axios.post(`${process.env.REACT_APP_API_URL}/api/pedidos`, {
        clienteId: usuario?.uid || 'anonimo',
        clienteNombre: usuario?.displayName || usuario?.email || 'cliente',
        restauranteId: restauranteActivo?._id,
        platillos: carrito.map(p => ({
          platilloId: p._id,
          nombre: p.nombre,
          precio: p.precio,
          cantidad: p.cantidad
        })),
        total,
        direccionEntrega: direccion
      });

      await axios.post(`${process.env.REACT_APP_API_URL}/api/pagos/crear-pago`, {
        monto: total,
        descripcion: `Pedido en ${restauranteActivo?.nombre}`
      });

      const pedidoId = pedidoRes.data._id;
      vaciarCarrito();
      navigate(`/tracking/${pedidoId}`);

    } catch (error) {
      console.error(error);
      alert('Error al procesar el pedido');
    } finally {
      setCargando(false);
    }
  };

  if (carrito.length === 0) {
    return (
      <div style={styles.empty}>
        <div style={styles.emptyIcon}>
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M4 4h3l4 16h14l3-10H10" stroke="#555" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="14" cy="26" r="2" fill="#555"/>
            <circle cx="24" cy="26" r="2" fill="#555"/>
          </svg>
        </div>
        <h2 style={{ color: '#f1f1f1', fontSize: '20px', fontWeight: '600', margin: '0 0 8px' }}>Tu carrito está vacío</h2>
        <p style={{ color: '#555', fontSize: '14px', margin: '0 0 24px' }}>Agrega platillos desde un restaurante para continuar</p>
        <button
          onClick={() => navigate('/')}
          style={styles.btnVolver}
          onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
          onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
        >
          Ver restaurantes
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.layout}>

        {/* IZQUIERDA */}
        <div style={styles.left}>
          <button
            onClick={() => navigate(-1)}
            style={styles.back}
            onMouseEnter={e => e.currentTarget.style.borderColor = '#3a3a3a'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ marginRight: '6px' }}>
              <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Volver
          </button>

          <div>
            <h1 style={styles.titulo}>Tu pedido</h1>
            {restauranteActivo && (
              <div style={styles.restCard}>
                <span style={{ fontSize: '20px', lineHeight: 1 }}>{restauranteActivo.imagen}</span>
                <div>
                  <p style={{ color: '#f1f1f1', fontWeight: '500', fontSize: '14px', margin: 0 }}>{restauranteActivo.nombre}</p>
                  <p style={{ color: '#555', fontSize: '12px', margin: 0 }}>{carrito.length} platillo{carrito.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
            )}
          </div>

          {/* Lista de platillos */}
          <div style={styles.lista}>
            {carrito.map((p, i) => (
              <div key={p._id} style={{
                ...styles.item,
                borderBottom: i < carrito.length - 1 ? '1px solid #222' : 'none'
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={styles.itemNombre}>{p.nombre}</p>
                  <p style={styles.itemPrecio}>${p.precio} MXN c/u</p>
                </div>
                <div style={styles.counter}>
                  <button onClick={() => quitarDelCarrito(p._id)} style={styles.btnCount}>−</button>
                  <span style={{ color: '#f1f1f1', minWidth: '20px', textAlign: 'center', fontSize: '14px' }}>{p.cantidad}</span>
                  <button onClick={() => agregarAlCarrito(p)} style={styles.btnCount}>+</button>
                </div>
                <span style={styles.subtotal}>${p.precio * p.cantidad}</span>
              </div>
            ))}
          </div>

          {/* Dirección */}
          <div style={styles.seccion}>
            <p style={styles.label}>Dirección de entrega</p>
            <input
              style={styles.input}
              placeholder="Ej: Calle 5a Norte 23, Col. Centro"
              value={direccion}
              onChange={e => setDireccion(e.target.value)}
              onFocus={e => e.currentTarget.style.borderColor = '#7c3aed'}
              onBlur={e => e.currentTarget.style.borderColor = '#2a2a2a'}
            />
          </div>
        </div>

        {/* DERECHA */}
        <div style={styles.right}>
          <div style={styles.resumen}>
            <h3 style={styles.resumenTitulo}>Resumen del pedido</h3>

            <div style={{ marginBottom: '4px' }}>
              {carrito.map(p => (
                <div key={p._id} style={styles.resumenItem}>
                  <span style={{ color: '#888', fontSize: '13px' }}>{p.nombre} <span style={{ color: '#555' }}>x{p.cantidad}</span></span>
                  <span style={{ color: '#888', fontSize: '13px' }}>${p.precio * p.cantidad}</span>
                </div>
              ))}
            </div>

            <div style={styles.totalRow}>
              <span style={{ color: '#888', fontSize: '13px' }}>Total</span>
              <span style={styles.totalPrecio}>${total} <span style={{ fontSize: '12px', color: '#555', fontWeight: '400' }}>MXN</span></span>
            </div>

            <button
              onClick={handlePedir}
              disabled={cargando}
              style={{ ...styles.btnPedir, opacity: cargando ? 0.6 : 1, cursor: cargando ? 'not-allowed' : 'pointer' }}
              onMouseEnter={e => { if (!cargando) e.currentTarget.style.background = '#6d28d9' }}
              onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
            >
              {cargando ? 'Procesando...' : 'Confirmar pedido'}
            </button>

            <p style={{ fontSize: '12px', color: '#444', margin: '12px 0 0', textAlign: 'center' }}>
              Al confirmar aceptas los términos del servicio
            </p>
          </div>
        </div>

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
    padding: '30px',
  },
  layout: {
    maxWidth: '1000px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 300px',
    gap: '24px',
    alignItems: 'start',
  },
  left: { display: 'flex', flexDirection: 'column', gap: '16px' },
  right: { position: 'sticky', top: '20px' },
  empty: {
    minHeight: '100vh',
    background: '#0f0f0f',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    gap: '8px',
  },
  emptyIcon: {
    width: '64px', height: '64px',
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '16px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    marginBottom: '8px',
  },
  back: {
    background: 'transparent', border: '1px solid #2a2a2a',
    color: '#aaa', padding: '7px 14px', borderRadius: '8px',
    cursor: 'pointer', fontSize: '13px',
    display: 'inline-flex', alignItems: 'center',
    width: 'fit-content', transition: 'border-color 0.15s',
  },
  titulo: { color: '#f1f1f1', fontSize: '22px', fontWeight: '600', margin: '0 0 12px' },
  restCard: {
    background: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: '10px', padding: '12px 16px',
    display: 'flex', alignItems: 'center', gap: '12px',
  },
  lista: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', overflow: 'hidden' },
  item: { display: 'grid', gridTemplateColumns: '1fr auto auto', alignItems: 'center', padding: '14px 16px', gap: '16px' },
  itemNombre: { color: '#f1f1f1', margin: '0 0 3px', fontSize: '14px', fontWeight: '500' },
  itemPrecio: { color: '#555', fontSize: '12px', margin: 0 },
  counter: { display: 'flex', alignItems: 'center', gap: '8px', background: '#222', borderRadius: '8px', padding: '4px 10px', border: '1px solid #2a2a2a' },
  btnCount: { background: 'none', border: 'none', color: '#a78bfa', fontSize: '16px', cursor: 'pointer', padding: 0, fontWeight: '500' },
  subtotal: { color: '#7c3aed', fontWeight: '600', fontSize: '14px', minWidth: '60px', textAlign: 'right' },
  seccion: {},
  label: { color: '#666', fontSize: '12px', fontWeight: '500', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.06em' },
  input: {
    width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
    color: '#f1f1f1', padding: '12px 14px', borderRadius: '10px',
    fontSize: '14px', outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 0.15s',
  },
  resumen: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '20px' },
  resumenTitulo: { color: '#f1f1f1', fontSize: '15px', fontWeight: '600', margin: '0 0 16px' },
  resumenItem: { display: 'flex', justifyContent: 'space-between', marginBottom: '8px' },
  totalRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #222' },
  totalPrecio: { color: '#f1f1f1', fontSize: '20px', fontWeight: '600' },
  btnPedir: {
    marginTop: '16px', background: '#7c3aed', color: '#fff',
    border: 'none', padding: '13px', borderRadius: '10px',
    fontWeight: '500', width: '100%', fontSize: '14px',
    transition: 'background 0.15s',
  },
  btnVolver: {
    background: '#7c3aed', color: '#fff', border: 'none',
    padding: '10px 24px', borderRadius: '10px', cursor: 'pointer',
    fontWeight: '500', fontSize: '14px', transition: 'background 0.15s',
  },
};