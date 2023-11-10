import React, { createContext, useReducer, useEffect } from "react";
import axios from "axios";
import Swal from 'sweetalert2';
import { useNavigate } from "react-router-dom";


const initialState = {
  productos: [],
  productosAleatorios: [],
  userRol: localStorage.getItem("role") || null, // rol del usuario
  token: localStorage.getItem("token") || null, // Token de autenticación
  getProductosById: () => {},
};

export const GlobalContext = createContext(initialState);


const reducer = (state, action) => {
  switch (action.type) {
    case "setProductos":
      return { ...state, productos: action.payload };
      case "setProductosAleatorios":
        return { ...state, productosAleatorios: action.payload };  
        case "login":
          localStorage.setItem("role", action.payload.role);
          localStorage.setItem("token", action.payload.token);
          return {
            ...state,
            userRol: action.payload.role,
            token: action.payload.token,
          };
          case "logout":
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            return {
              ...state,
              userRol: null,
              token: null,
            };
            default:
              throw new Error(`Acción no reconocida: ${action.type}`);
            }
          };
          
         
export const GlobalProvider = ({ children }) => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(reducer, initialState);
  const fetchData = async (url) => {
    try {
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error("Error al obtener los datos", error);
      return [];
    }
  };
  
  const login = async (userData) => {
    try {
      const response = await axios.post(
        "http://ec2-54-198-119-206.compute-1.amazonaws.com:8080/auth/login",
        userData
        );
      dispatch({ type: "login", payload: response.data });
      if (response.status === 200) {
        Swal.fire({
          title: '¡Inicio de sesión exitoso!',
          icon: 'success',
        })
        navigate('/')
      }
    } catch (error) {
      Swal.fire({
        title: '¡Error al iniciar sesión!',
        text: error.response.data.message,
        icon: 'error',
      })
    }
  };

  const logout = () => {
    try {
      dispatch({ type: "logout"});
      Swal.fire({
        title: '¡Se ha cerrado su sesión!',
        icon: 'success',
      })
    } catch (error) {
      Swal.fire({
        title: '¡Error al cerrar sesión!',
        text: error.response.data.message,
        icon: 'error',
      });
    }
  };

  const getProductos = async () => {
    const productosData = await fetchData(
      "http://ec2-54-198-119-206.compute-1.amazonaws.com:8080/productos"
    );
    dispatch({ type: "setProductos", payload: productosData });
  };

  const getProductosAleatorios = async () => {
    const productosData = await fetchData(
      "http://ec2-54-198-119-206.compute-1.amazonaws.com:8080/productos/aleatorios?cantidad=10"
    );
    dispatch({ type: "setProductosAleatorios", payload: productosData });
  };

  const getProductosById = async (id) => {
    const productoData = await fetchData(
      `http://ec2-54-198-119-206.compute-1.amazonaws.com:8080/productos/${id}`
    );
    return productoData;
  };

  useEffect(() => {
    getProductos();
  }, []);

  return (
    <GlobalContext.Provider value={{ ...state, getProductosById, getProductosAleatorios, getProductos, login, logout }}>
      {children}
    </GlobalContext.Provider>
  );
};