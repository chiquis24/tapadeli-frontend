import Logo from '../components/Logo'
import React, { useState } from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const resultado = await signInWithPopup(auth, googleProvider);
      console.log('Usuario logueado:', resultado.user.displayName);
      navigate('/');
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      setError('No se pudo iniciar sesión. Intenta de nuevo.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
    background: '#0d0d0d',
    backgroundImage: 'radial-gradient(circle, #2a2a2a 1px, transparent 1px)',
    backgroundSize: '24px 24px',
    }}>
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: '860px',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid #2a2a2a'
      }}>

        {/* Panel izquierdo */}
        <div style={{
          flex: 1,
          background: '#111111',
          padding: '48px 40px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}>
          <div>
            {/* Logo */}
            <div style={{ marginBottom: '48px' }}>
            <Logo size="md" />
            </div>

            <h2 style={{ fontSize: '26px', fontWeight: '600', color: '#f1f1f1', margin: '0 0 12px', lineHeight: '1.3' }}>
              Comida de Tapachula<br />a tu puerta
            </h2>
            <p style={{ fontSize: '14px', color: '#666', margin: '0 0 40px', lineHeight: '1.6' }}>
              Pide a los mejores restaurantes locales en minutos.
            </p>

            {/* Features */}
            {[
              {
                label: 'Pedidos en segundos',
                desc: 'Elige, agrega y confirma sin complicaciones.',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 8h12M8 2l6 6-6 6" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )
              },
              {
                label: 'Rastrea tu pedido en vivo',
                desc: 'Sigue cada etapa desde la cocina hasta tu puerta.',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="5" stroke="#7c3aed" strokeWidth="1.5"/>
                    <circle cx="8" cy="8" r="2" fill="#7c3aed"/>
                  </svg>
                )
              },
              {
                label: 'Los mejores restaurantes locales',
                desc: 'Tacos, mariscos, pizzas y más de Tapachula.',
                icon: (
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 2l1.5 3 3.5.5-2.5 2.5.5 3.5L8 10l-3 1.5.5-3.5L3 5.5l3.5-.5L8 2z" stroke="#7c3aed" strokeWidth="1.5" strokeLinejoin="round"/>
                  </svg>
                )
              }
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '24px' }}>
                <div style={{
                  width: '32px', height: '32px',
                  background: '#2a1f4a',
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0, marginTop: '2px'
                }}>
                  {f.icon}
                </div>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', color: '#e5e5e5', margin: '0 0 2px' }}>{f.label}</p>
                  <p style={{ fontSize: '13px', color: '#555', margin: '0' }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <p style={{ fontSize: '12px', color: '#333', margin: '0' }}>© 2025 TapaDeli · Tapachula, Chiapas</p>
        </div>

        {/* Panel derecho */}
        <div style={{
          width: '320px',
          background: '#1a1a1a',
          padding: '48px 36px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          borderLeft: '1px solid #2a2a2a'
        }}>
          <div style={{ marginBottom: '32px' }}>
            <h1 style={{ fontSize: '20px', fontWeight: '600', color: '#f1f1f1', margin: '0 0 8px' }}>
              Inicia sesión
            </h1>
            <p style={{ fontSize: '13px', color: '#666', margin: '0' }}>
              Accede para hacer tu pedido
            </p>
          </div>

          {error && (
            <div style={{
              background: '#2d1515',
              border: '1px solid #5a1a1a',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              color: '#ff6b6b',
              fontSize: '13px'
            }}>
              {error}
            </div>
          )}

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            style={{
              width: '100%',
              padding: '13px 16px',
              background: 'transparent',
              border: '1px solid #333',
              borderRadius: '10px',
              color: '#f1f1f1',
              fontSize: '14px',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'background 0.15s'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#242424'}
            onMouseOut={e => e.currentTarget.style.background = 'transparent'}
          >
            {loading ? (
              <span style={{ color: '#666' }}>Iniciando sesión...</span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                  <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
                  <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
                  <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 6.293C4.672 4.166 6.656 3.58 9 3.58z" fill="#EA4335"/>
                </svg>
                Continuar con Google
              </>
            )}
          </button>

          <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid #222' }}>
            <p style={{ fontSize: '12px', color: '#444', margin: '0', lineHeight: '1.6' }}>
              Al continuar aceptas los{' '}
              <span style={{ color: '#666', textDecoration: 'underline', cursor: 'pointer' }}>términos de servicio</span>
              {' '}y la{' '}
              <span style={{ color: '#666', textDecoration: 'underline', cursor: 'pointer' }}>política de privacidad</span>.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Login;