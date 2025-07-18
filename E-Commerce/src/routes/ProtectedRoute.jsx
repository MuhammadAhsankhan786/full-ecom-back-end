import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { GlobalContext } from "../context/Context";

const ProtectedRoute = ({ children }) => {
  const { state } = useContext(GlobalContext);

  if (!state.isAuthResolved) {
    return <div>Loading...</div>; // یا spinner لگاؤ
  }

  if (!state.isLogin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
