import React, { useState, useEffect } from 'react';
import { getPlatillos } from '../services/api';
import Mapa from '../components/Mapa';

function Menu() {
  const [platillos, setPlatillos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    cargarPlatillos();
  }, []);

  const cargarPlatillos = async () => {
    try {
      const respuesta = await getPlatillos();
      setPlatillos(respuesta.data);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar platillos:', error);
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ textAlign: 'center', marginTop: '100px', color: '#7c3aed', fontSize: '18px' }}>
      Cargando menú...
    </div>
  );

  return (
    <div style={{ padding: isMobile ? '16px' : '0' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: isMobile ? '24px' : '32px', marginBottom: '8px' }}>
          🍽️ Menú <span style={{ color: '#7c3aed' }}>Digital</span>
        </h1>
        <p style={{ color: '#888', fontSize: '15px' }}>
          Selecciona tus platillos favoritos
        </p>
      </div>

      {platillos.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '60px', color: '#555',
          background: '#1a1a1a', borderRadius: '16px', border: '1px solid #2a2a2a'
        }}>
          <p style={{ fontSize: '40px', marginBottom: '16px' }}>🍽️</p>
          <p>No hay platillos disponibles aún</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))',
          gap: '16px',
          marginBottom: '40px'
        }}>
          {platillos.map((platillo) => (
            <div key={platillo._id} style={{
              background: '#1a1a1a', border: '1px solid #2a2a2a',
              borderRadius: '14px', padding: '20px',
              transition: 'border-color 0.2s, transform 0.2s', cursor: 'pointer'
            }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = '#7c3aed';
                e.currentTarget.style.transform = 'translateY(-4px)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = '#2a2a2a';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ fontSize: '36px', marginBottom: '12px' }}>🍴</div>
              <h3 style={{ fontSize: '17px', marginBottom: '6px' }}>{platillo.nombre}</h3>
              <p style={{ color: '#888', fontSize: '13px', marginBottom: '12px' }}>{platillo.descripcion}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                <span style={{ color: '#7c3aed', fontWeight: '700', fontSize: '18px' }}>${platillo.precio}</span>
                <span style={{
                  fontSize: '12px', padding: '4px 10px', borderRadius: '20px',
                  background: platillo.disponible ? '#1a2e1a' : '#2e1a1a',
                  color: platillo.disponible ? '#4ade80' : '#f87171'
                }}>
                  {platillo.disponible ? '✅ Disponible' : '❌ Agotado'}
                </span>
              </div>
              <div style={{
                marginTop: '10px', fontSize: '12px', color: '#555',
                background: '#111', padding: '4px 10px',
                borderRadius: '20px', display: 'inline-block'
              }}>
                {platillo.categoria}
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{
        background: '#1a1a1a', border: '1px solid #2a2a2a',
        borderRadius: '16px', padding: isMobile ? '16px' : '24px', marginTop: '20px'
      }}>
        <Mapa />
      </div>
    </div>
  );
}

export default Menu;