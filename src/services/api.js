import axios from 'axios';

// Aquí definimos la URL base de nuestro servidor
// En lugar de escribir http://localhost:5000 en cada petición, lo centralizamos aquí
const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Servicios de Platillos
export const getPedidosPorUsuario = (clienteId) => API.get(`/pedidos/cliente/${clienteId}`);
export const getPlatillos = () => API.get('/platillos');
export const getPlatillo = (id) => API.get(`/platillos/${id}`);
export const crearPlatillo = (datos) => API.post('/platillos', datos);
export const actualizarPlatillo = (id, datos) => API.put(`/platillos/${id}`, datos);
export const eliminarPlatillo = (id) => API.delete(`/platillos/${id}`);

// Servicios de Pedidos
export const getPedidos = () => API.get('/pedidos');
export const crearPedido = (datos) => API.post('/pedidos', datos);
export const actualizarPedido = (id, datos) => API.put(`/pedidos/${id}`, datos);
export const eliminarPedido = (id) => API.delete(`/pedidos/${id}`);