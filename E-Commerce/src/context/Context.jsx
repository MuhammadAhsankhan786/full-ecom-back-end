// src/context/Context.jsx

import React, { createContext, useReducer, useEffect } from "react";
import { reducer } from "./Reducer";

// 1. Create the context
export const GlobalContext = createContext();

// 2. Define initial state
const initialState = {
  user: {},
  isLogin: false,
  baseUrl: "http://localhost:5001/api/v1",
  isAuthResolved: false, // ⬅️ نیا flag
};

// 3. Context Provider
export default function ContextProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const storedLogin = localStorage.getItem("isLogin");
    const storedUser = localStorage.getItem("user");

    if (storedLogin === "true" && storedUser) {
      dispatch({
        type: "LOGIN",
        payload: JSON.parse(storedUser),
      });
    }

    dispatch({ type: "AUTH_RESOLVED" }); // ⬅️ flag set کرو
  }, []);

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );
}
