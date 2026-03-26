import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Inicio() {
  const [restaurantes, setRestaurantes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [dropdownAbierto, setDropdownAbierto] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    axios.get(`${process.env.REACT_APP_API_URL}/api/restaurantes`)
      .then(res => {
        setRestaurantes(res.data);
        setCargando(false);
      })
      .catch(() => setCargando(false));
  }, []);

  const categorias = ['Todos', ...new Set(restaurantes.map(r => r.categoria).filter(Boolean))];

  const restaurantesFiltrados = categoriaActiva === 'Todos'
    ? restaurantes
    : restaurantes.filter(r => r.categoria === categoriaActiva);

  if (cargando) return (
    <div style={styles.loading}>
      <p style={{ color: '#7c3aed', fontSize: '14px' }}>Cargando restaurantes...</p>
    </div>
  );

  return (
    <div style={styles.container}>

      {/* Hero */}
      <div style={{ ...styles.hero, padding: isMobile ? '40px 20px' : '60px 30px' }}>
        <div style={styles.heroInner}>
          <p style={styles.heroEyebrow}>Tapachula, Chiapas</p>
          <h1 style={{ ...styles.heroTitle, fontSize: isMobile ? '24px' : '32px' }}>
            Los mejores restaurantes<br />locales, en un solo lugar
          </h1>
          <p style={styles.heroSub}>Pide tu comida favorita y recíbela en la puerta de tu casa.</p>
        </div>
      </div>

      {/* Sección restaurantes */}
      <div style={{ ...styles.seccionWrap, padding: isMobile ? '24px 16px' : '40px 30px' }}>
        <div style={styles.seccionHeader}>
          <h2 style={styles.seccionTitle}>Restaurantes disponibles</h2>
          <p style={styles.seccionSub}>{restaurantesFiltrados.length} cerca de ti</p>
        </div>

        {/* Filtros */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', alignItems: 'center' }}>
          <button
            onClick={() => setCategoriaActiva('Todos')}
            style={{
              ...styles.dropdownBtn,
              minWidth: 'auto',
              background: categoriaActiva === 'Todos' ? '#7c3aed' : '#1a1a1a',
              color: categoriaActiva === 'Todos' ? '#fff' : '#666',
              borderColor: categoriaActiva === 'Todos' ? '#7c3aed' : '#2a2a2a',
            }}
          >
            Todos
          </button>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setDropdownAbierto(!dropdownAbierto)}
              style={{
                ...styles.dropdownBtn,
                color: categoriaActiva !== 'Todos' ? '#a78bfa' : '#666',
                borderColor: categoriaActiva !== 'Todos' ? '#7c3aed' : '#2a2a2a',
                background: categoriaActiva !== 'Todos' ? '#2a1f4a' : '#1a1a1a',
                minWidth: isMobile ? '140px' : '160px',
              }}
            >
              <span>{categoriaActiva !== 'Todos' ? categoriaActiva : 'Categorías'}</span>
              <svg
                width="14" height="14" viewBox="0 0 14 14" fill="none"
                style={{ transform: dropdownAbierto ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}
              >
                <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {dropdownAbierto && (
              <div style={styles.dropdown}>
                {categorias.filter(c => c !== 'Todos').map(cat => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategoriaActiva(cat);
                      setDropdownAbierto(false);
                    }}
                    style={{
                      ...styles.dropdownItem,
                      background: categoriaActiva === cat ? '#2a1f4a' : 'transparent',
                      color: categoriaActiva === cat ? '#a78bfa' : '#888',
                    }}
                  >
                    {cat}
                    {categoriaActiva === cat && (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="#a78bfa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Grid */}
        {restaurantesFiltrados.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ color: '#555', fontSize: '14px', margin: 0 }}>
              No hay restaurantes en esta categoría
            </p>
          </div>
        ) : (
          <div style={{
            ...styles.grid,
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(280px, 1fr))',
          }}>
            {restaurantesFiltrados.map(r => (
              <div
                key={r._id}
                style={styles.card}
                onClick={() => navigate(`/restaurante/${r._id}`)}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = 'translateY(-3px)';
                  e.currentTarget.style.borderColor = '#3a3a3a';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = '#2a2a2a';
                }}
              >
                <div style={styles.cardMedia}>
                  <span style={{ fontSize: '48px', lineHeight: 1 }}>{r.imagen}</span>
                </div>
                <div style={styles.cardBody}>
                  <div style={styles.cardTop}>
                    <span style={styles.categoria}>{r.categoria}</span>
                  </div>
                  <h3 style={styles.cardNombre}>{r.nombre}</h3>
                  <p style={styles.cardDesc}>{r.descripcion}</p>
                  <div style={styles.cardFooter}>
                    <span style={styles.cardDir}>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginRight: '4px', flexShrink: 0 }}>
                        <path d="M6 1C4.067 1 2.5 2.567 2.5 4.5c0 2.625 3.5 6.5 3.5 6.5s3.5-3.875 3.5-6.5C9.5 2.567 7.933 1 6 1zm0 4.75a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z" fill="#555"/>
                      </svg>
                      {r.direccion}
                    </span>
                    <button
                      style={styles.btn}
                      onMouseEnter={e => e.currentTarget.style.background = '#6d28d9'}
                      onMouseLeave={e => e.currentTarget.style.background = '#7c3aed'}
                    >
                      Ver menú
                    </button>
                  </div>
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
  container: { minHeight: '100vh', background: '#0f0f0f' },
  loading: { minHeight: '100vh', background: '#0f0f0f', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  hero: { background: '#111111', borderBottom: '1px solid #1e1e1e', display: 'flex', justifyContent: 'center' },
  heroInner: { maxWidth: '1100px', width: '100%' },
  heroEyebrow: { fontSize: '12px', fontWeight: '500', color: '#7c3aed', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 16px' },
  heroTitle: { fontWeight: '700', color: '#f1f1f1', margin: '0 0 12px', lineHeight: '1.25' },
  heroSub: { fontSize: '15px', color: '#666', margin: '0', lineHeight: '1.6' },
  seccionWrap: { maxWidth: '1100px', margin: '0 auto' },
  seccionHeader: { display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' },
  seccionTitle: { fontSize: '18px', fontWeight: '600', color: '#f1f1f1', margin: '0' },
  seccionSub: { fontSize: '13px', color: '#555', margin: '0' },
  dropdownBtn: {
    background: '#1a1a1a', border: '1px solid #2a2a2a',
    color: '#f1f1f1', padding: '8px 14px', borderRadius: '8px',
    cursor: 'pointer', fontSize: '13px', fontWeight: '500',
    display: 'flex', alignItems: 'center', gap: '8px',
    justifyContent: 'space-between',
  },
  dropdown: {
    position: 'absolute', top: 'calc(100% + 6px)', left: 0,
    background: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: '10px', padding: '6px',
    minWidth: '160px', zIndex: 100,
    display: 'flex', flexDirection: 'column', gap: '2px',
  },
  dropdownItem: {
    border: 'none', padding: '8px 12px', borderRadius: '6px',
    cursor: 'pointer', fontSize: '13px', fontWeight: '500',
    textAlign: 'left', display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', transition: 'background 0.15s',
  },
  empty: { background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '12px', padding: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  grid: { display: 'grid', gap: '16px' },
  card: { background: '#1a1a1a', borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'transform 0.2s, border-color 0.2s', border: '1px solid #2a2a2a' },
  cardMedia: { background: '#111111', padding: '32px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #222' },
  cardBody: { padding: '16px 20px 20px' },
  cardTop: { marginBottom: '10px' },
  categoria: { background: '#2a1f4a', color: '#a78bfa', fontSize: '11px', fontWeight: '500', padding: '3px 10px', borderRadius: '20px', letterSpacing: '0.03em' },
  cardNombre: { color: '#f1f1f1', fontSize: '17px', fontWeight: '600', margin: '0 0 6px' },
  cardDesc: { color: '#666', fontSize: '13px', margin: '0 0 16px', lineHeight: '1.5' },
  cardFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' },
  cardDir: { color: '#555', fontSize: '12px', display: 'flex', alignItems: 'center', flex: 1, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' },
  btn: { background: '#7c3aed', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', fontSize: '13px', flexShrink: 0, transition: 'background 0.15s' },
};