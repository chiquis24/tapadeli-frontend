import React, { useState } from 'react';
import axios from 'axios';

function Pago() {
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  const handlePago = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensaje(null);
    try {
      const respuesta = await axios.post('http://localhost:5000/api/pagos/crear-pago', {
        monto: parseInt(monto),
        descripcion: descripcion
      });

      setMensaje({ tipo: 'exito', texto: '✅ Pago procesado correctamente en modo test' });
      setLoading(false);
      setMonto('');
      setDescripcion('');
    } catch (error) {
      setMensaje({ tipo: 'error', texto: '❌ Error al procesar el pago' });
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{
        background: '#1a1a1a',
        border: '1px solid #2a2a2a',
        borderRadius: '16px',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '440px'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>💳</div>
          <h1 style={{ fontSize: '26px', marginBottom: '8px' }}>
            Pagar <span style={{ color: '#7c3aed' }}>Pedido</span>
          </h1>
          <p style={{ color: '#888', fontSize: '14px' }}>
            Modo de prueba con Stripe
          </p>
        </div>

        {/* Mensaje */}
        {mensaje && (
          <div style={{
            padding: '14px',
            borderRadius: '10px',
            marginBottom: '24px',
            background: mensaje.tipo === 'exito' ? '#1a2e1a' : '#2e1a1a',
            color: mensaje.tipo === 'exito' ? '#4ade80' : '#f87171',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {mensaje.texto}
          </div>
        )}

        {/* Formulario */}
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
            />
          </div>

          {/* Tarjeta de prueba */}
          <div style={{
            background: '#111',
            border: '1px solid #2a2a2a',
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '24px',
            fontSize: '13px',
            color: '#666'
          }}>
            <p style={{ color: '#888', marginBottom: '6px' }}>💡 Tarjeta de prueba Stripe:</p>
            <p>Número: <span style={{ color: '#aaa' }}>4242 4242 4242 4242</span></p>
            <p>Fecha: <span style={{ color: '#aaa' }}>12/29</span> — CVV: <span style={{ color: '#aaa' }}>123</span></p>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: loading ? '#333' : '#7c3aed',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600'
            }}>
            {loading ? 'Procesando...' : 'Confirmar Pago'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Pago;