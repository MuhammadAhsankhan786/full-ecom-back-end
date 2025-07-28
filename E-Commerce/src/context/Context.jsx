import React, { createContext, useReducer, useEffect } from "react";
import { reducer } from "./Reducer";

// 1. Create the context
export const GlobalContext = createContext();

// // 2. Initial state
// const initialState = {
//   user: {},
//   isLogin: false,
//   baseUrl:
//     window.location.hostname === "localhost"
//       ? "http://localhost:5001/api/v1"
//       : "https://full-ecom-back-end.vercel.app/api/v1", // 🔁 Vercel URL
//   isAuthResolved: false,
// };
const initialState = {
  user: {},
  isLogin: false,
  isAuthResolved: false,
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

    dispatch({ type: "AUTH_RESOLVED" }); // ✅ Let components know auth status loaded
  }, []);

  return (
    <GlobalContext.Provider value={{ state, dispatch }}>
      {children}
    </GlobalContext.Provider>
  );
}
