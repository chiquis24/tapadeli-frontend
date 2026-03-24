import { Link, useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Navbar() {
  const esAdmin = false;
  const location = useLocation();
  const navigate = useNavigate();
  const { usuario } = useAuth();

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
    <nav style={styles.nav}>
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Logo size="md" />
      </Link>

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

        {esAdmin && (
          <Link to="/admin" style={styles.btnAdmin}>Admin</Link>
        )}

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
          <Link to="/login" style={styles.btnLogin}>
            Iniciar sesión
          </Link>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    background: '#111',
    padding: '0 32px',
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
};