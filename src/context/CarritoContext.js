import { createContext, useContext, useState } from 'react';

const CarritoContext = createContext();

export function CarritoProvider({ children }) {
  const [carrito, setCarrito] = useState([]);
  const [restauranteActivo, setRestauranteActivo] = useState(null);

  const agregarAlCarrito = (platillo) => {
    setCarrito(prev => {
      const existe = prev.find(p => p._id === platillo._id);
      if (existe) {
        return prev.map(p => p._id === platillo._id
          ? { ...p, cantidad: p.cantidad + 1 }
          : p
        );
      }
      return [...prev, { ...platillo, cantidad: 1 }];
    });
  };

  const quitarDelCarrito = (platilloId) => {
    setCarrito(prev => {
      const existe = prev.find(p => p._id === platilloId);
      if (existe?.cantidad === 1) {
        return prev.filter(p => p._id !== platilloId);
      }
      return prev.map(p => p._id === platilloId
        ? { ...p, cantidad: p.cantidad - 1 }
        : p
      );
    });
  };

  const vaciarCarrito = () => setCarrito([]);

  const total = carrito.reduce((sum, p) => sum + p.precio * p.cantidad, 0);

  return (
    <CarritoContext.Provider value={{
      carrito, agregarAlCarrito, quitarDelCarrito,
      vaciarCarrito, total, restauranteActivo, setRestauranteActivo
    }}>
      {children}
    </CarritoContext.Provider>
  );
}

export const useCarrito = () => useContext(CarritoContext);