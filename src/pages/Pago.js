import React, { useState } from 'react';
import axios from 'axios';

function Pago() {
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handlePago = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);
    try {
      await axios.post(`${process.env.REACT_APP_API_URL}/api/pagos/crear-pago`, {
        monto: parseInt(monto),
        descripcion: descripcion
      });
      setMensaje({ tipo: 'exito', texto: '✅ Pago procesado correctamente en modo test' });
      setMonto('');
      setDescripcion('');
    } catch (error) {
      setMensaje({ tipo: 'error', texto: '❌ Error al procesar el pago' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      padding: isMobile ? '16px' : '24px',
    }}>
      <div style={{
        background: '#1a1a1a', border: '1px solid #2a2a2a',
        borderRadius: '16px',
        padding: isMobile ? '28px 20px' : '48px 40px',
        width: '100%', maxWidth: '440px'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💳</div>
          <h1 style={{ fontSize: isMobile ? '22px' : '26px', marginBottom: '8px' }}>
            Pagar <span style={{ color: '#7c3aed' }}>Pedido</span>
          </h1>
          <p style={{ color: '#888', fontSize: '14px' }}>Modo de prueba con Stripe</p>
        </div>

        {mensaje && (
          <div style={{
            padding: '14px', borderRadius: '10px', marginBottom: '24px',
            background: mensaje.tipo === 'exito' ? '#1a2e1a' : '#2e1a1a',
            color: mensaje.tipo === 'exito' ? '#4ade80' : '#f87171',
            fontSize: '14px', textAlign: 'center'
          }}>
            {mensaje.texto}
          </div>
        )}

        <form onSubmit={handlePago}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '6px' }}>
              Descripción del pedido
            </label>
            <input
              type="text"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Ej: 2 Tacos de Carne, 1 Refresco"
              required
              style={{
                width: '100%', background: '#111', border: '1px solid #2a2a2a',
                color: '#f1f1f1', padding: '12px 14px', borderRadius: '10px',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ marginBottom: '28px' }}>
            <label style={{ fontSize: '14px', color: '#aaa', display: 'block', marginBottom: '6px' }}>
              Monto total (MXN)
            </label>
            <input
              type="number"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="Ej: 90"
              required
              style={{
                width: '100%', background: '#111', border: '1px solid #2a2a2a',
                color: '#f1f1f1', padding: '12px 14px', borderRadius: '10px',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{
            background: '#111', border: '1px solid #2a2a2a',
            borderRadius: '10px', padding: '14px',
            marginBottom: '24px', fontSize: '13px', color: '#666'
          }}>
            <p style={{ color: '#888', marginBottom: '6px' }}>💡 Tarjeta de prueba Stripe:</p>
            <p>Número: <span style={{ color: '#aaa' }}>4242 4242 4242 4242</span></p>
            <p>Fecha: <span style={{ color: '#aaa' }}>12/29</span> — CVV: <span style={{ color: '#aaa' }}>123</span></p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px',
              background: loading ? '#333' : '#7c3aed',
              color: 'white', border: 'none', borderRadius: '10px',
              fontSize: '16px', fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {loading ? 'Procesando...' : 'Confirmar Pago'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Pago;