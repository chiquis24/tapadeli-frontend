import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const esAdmin = false;
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setMenuAbierto(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const links = [
    { to: '/', label: 'Inicio' },
    ...(usuario ? [{ to: '/historial', label: 'Mis pedidos' }] : []),
    ...(esAdmin ? [{ to: '/admin', label: 'Admin' }] : [])
  ];

  return (
    <>
      <nav style={styles.nav}>
        <Link to="/" style={{ textDecoration: 'none' }}>
          <Logo size="md" />
        </Link>

        {/* Desktop */}
        {!isMobile && (
          <div style={styles.links}>
            {links.map(l => {
              const activo = location.pathname === l.to;
              return (
                <Link
                  key={l.to}
                  to={l.to}
                  style={{
                    ...styles.link,
                    color: activo ? '#f1f1f1' : '#555',
                    borderBottom: activo ? '1px solid #7c3aed' : '1px solid transparent',
                  }}
                >
                  {l.label}
                </Link>
              );
            })}

            {esAdmin && <Link to="/admin" style={styles.btnAdmin}>Admin</Link>}

            {usuario ? (
              <div style={styles.usuarioWrap}>
                {usuario.photoURL && (
                  <img
                    src={usuario.photoURL}
                    alt="avatar"
                    referrerPolicy="no-referrer"
                    style={styles.avatar}
                  />
                )}
                <span style={styles.usuarioNombre}>
                  {usuario.displayName?.split(' ')[0]}
                </span>
                <button onClick={handleLogout} style={styles.btnLogout}>
                  Salir
                </button>
              </div>
            ) : (
              <Link to="/login" style={styles.btnLogin}>Iniciar sesión</Link>
            )}
          </div>
        )}

        {/* Mobile — botón hamburguesa */}
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {usuario?.photoURL && (
              <img
                src={usuario.photoURL}
                alt="avatar"
                referrerPolicy="no-referrer"
                style={styles.avatar}
              />
            )}
            <button
              onClick={() => setMenuAbierto(!menuAbierto)}
              style={styles.btnHamburguesa}
            >
              {menuAbierto ? (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 4l12 12M16 4L4 16" stroke="#f1f1f1" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 5h14M3 10h14M3 15h14" stroke="#f1f1f1" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              )}
            </button>
          </div>
        )}
      </nav>

      {/* Menú móvil desplegable */}
      {isMobile && menuAbierto && (
        <div style={styles.menuMovil}>
          {usuario && (
            <div style={styles.menuUsuario}>
              <span style={{ color: '#888', fontSize: '13px' }}>
                {usuario.displayName}
              </span>
            </div>
          )}
          {links.map(l => {
            const activo = location.pathname === l.to;
            return (
              <Link
                key={l.to}
                to={l.to}
                style={{
                  ...styles.menuLink,
                  color: activo ? '#a78bfa' : '#ccc',
                  background: activo ? '#2a1f4a' : 'transparent',
                }}
              >
                {l.label}
              </Link>
            );
          })}
          {usuario ? (
            <button onClick={handleLogout} style={styles.menuBtnLogout}>
              Cerrar sesión
            </button>
          ) : (
            <Link to="/login" style={styles.menuBtnLogin}>
              Iniciar sesión
            </Link>
          )}
        </div>
      )}
    </>
  );
}

const styles = {
  nav: {
    background: '#111',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid #1e1e1e',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    height: '56px',
  },
  links: {
    display: 'flex', alignItems: 'center', gap: '4px',
  },
  link: {
    textDecoration: 'none', fontSize: '13px', fontWeight: '500',
    padding: '4px 12px', borderRadius: '6px',
    transition: 'color 0.15s', paddingBottom: '3px',
  },
  btnAdmin: {
    textDecoration: 'none', fontSize: '12px', fontWeight: '500',
    padding: '6px 14px', borderRadius: '8px',
    background: '#2a1f4a', color: '#a78bfa',
    border: '1px solid #3a2a6a', marginLeft: '8px',
  },
  usuarioWrap: {
    display: 'flex', alignItems: 'center', gap: '8px',
    marginLeft: '12px', paddingLeft: '12px',
    borderLeft: '1px solid #2a2a2a',
  },
  avatar: {
    width: '28px', height: '28px',
    borderRadius: '50%',
    border: '1px solid #2a2a2a',
  },
  usuarioNombre: {
    fontSize: '13px', color: '#ccc', fontWeight: '500',
  },
  btnLogout: {
    background: 'transparent', border: '1px solid #2a2a2a',
    color: '#555', fontSize: '12px', padding: '5px 10px',
    borderRadius: '6px', cursor: 'pointer', marginLeft: '4px',
  },
  btnLogin: {
    textDecoration: 'none', fontSize: '13px', fontWeight: '500',
    padding: '6px 14px', borderRadius: '8px',
    background: '#7c3aed', color: '#fff', marginLeft: '8px',
  },
  btnHamburguesa: {
    background: 'transparent', border: 'none',
    cursor: 'pointer', padding: '4px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  menuMovil: {
    background: '#111', borderBottom: '1px solid #1e1e1e',
    padding: '12px 20px', display: 'flex', flexDirection: 'column',
    gap: '4px', position: 'sticky', top: '56px', zIndex: 999,
  },
  menuUsuario: {
    padding: '8px 12px', marginBottom: '4px',
    borderBottom: '1px solid #1e1e1e',
  },
  menuLink: {
    textDecoration: 'none', fontSize: '14px', fontWeight: '500',
    padding: '10px 12px', borderRadius: '8px', display: 'block',
  },
  menuBtnLogout: {
    background: 'transparent', border: '1px solid #2a2a2a',
    color: '#555', fontSize: '13px', padding: '10px 12px',
    borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
    marginTop: '8px',
  },
  menuBtnLogin: {
    textDecoration: 'none', fontSize: '14px', fontWeight: '500',
    padding: '10px 12px', borderRadius: '8px',
    background: '#7c3aed', color: '#fff', textAlign: 'center',
    display: 'block', marginTop: '8px',
  },
};