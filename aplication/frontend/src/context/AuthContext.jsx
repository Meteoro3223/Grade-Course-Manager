import React, { createContext, useContext, useState } from "react";

// importamos las funciones que hacen las llamadas HTTP a /api/usuarios
import { apiUsuarios } from "../api/usuarios";

// creamos el contexto de autenticación con valor inicial null (sin usuario)
// este contexto es el "canal" por el que cualquier componente puede
// acceder al usuario logueado y a las funciones de login/logout
const AuthContext = createContext(null); // para crear el contexto de autenticación

export function AuthProvider({ children }) {

  // estado del usuario logueado.
  // al arrancar, intenta recuperar el usuario guardado en localStorage para que, si el usuario recarga la página, no pierda la sesión
  const [usuario, setUsuario] = useState(() => {
    const guardado = localStorage.getItem("usuario");
    return guardado ? JSON.parse(guardado) : null; // si no hay nada guardado, empieza como null
  });

  // función de login, llama al backend y guarda el usuario en estado y localStorage
  const login = async (nombre, contrasena) => {
    // POST /api/usuarios/login devuelve el objeto usuario si las credenciales son correctas
    const data = await apiUsuarios.login({ nombre, contrasena });
    setUsuario(data);                                   
    localStorage.setItem("usuario", JSON.stringify(data));
    return data;
  };

  // función de registro que crea el usuario en el backend y lo deja logueado directamente
  const registrar = async (nombre, contrasena) => {
    // POST /api/usuarios/registrar crea el usuario y lo devuelve
    const data = await apiUsuarios.registrar({ nombre, contrasena });
    setUsuario(data);                                    // guarda en memoria
    localStorage.setItem("usuario", JSON.stringify(data)); // guarda en disco
    return data;
  };

  // función de logout que limpia el usuario tanto de memoria como de localStorage
  const logout = () => {
    setUsuario(null);
    localStorage.removeItem("usuario");
  };

  // finalmente, esto es lo que el componente AuthProvider proporciona a sus hijos
  return (
    <AuthContext.Provider value={{ usuario, login, registrar, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// se importa en otros archivos y llama directamente: const { usuario } = useAuth()
export function useAuth() {
  return useContext(AuthContext);
}
