import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsuscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setCargando(false);
    });
    return () => unsuscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, cargando }}>
      {!cargando && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);