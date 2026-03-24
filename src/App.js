import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { CarritoProvider } from './context/CarritoContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Inicio from './pages/Inicio';
import Restaurante from './pages/Restaurante';
import Carrito from './pages/Carrito';
import Tracking from './pages/Tracking';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Historial from  './pages/Historial';

function Layout() {
  const location = useLocation();
  const hideNavbar = location.pathname === '/login';

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/restaurante/:id" element={<Restaurante />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/tracking/:pedidoId" element={<Tracking />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/historial" element={<Historial />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <CarritoProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </CarritoProvider>
    </AuthProvider>
  );
}

export default App;