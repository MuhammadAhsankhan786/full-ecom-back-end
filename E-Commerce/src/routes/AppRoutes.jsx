// src/routes/AppRoutes.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import Logout from "../pages/Logout";
import AddProduct from "../pages/AddProduct";
import Category from "../pages/Category"; // ✅ agar yeh bana liya hai
// import ProductList from "../pages/ProductList"; // (if needed)

import ProtectedRoute from "./ProtectedRoute";

const AppRoutes = ({ isLogin }) => {
  return (
    <Routes>
      {/* 🔓 Public Routes */}
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/logout" element={<Logout />} />

      {/* 🔐 Protected Routes */}
      <Route
        path="/home"
        element={
          <ProtectedRoute isLogin={isLogin}>
            <Home />
          </ProtectedRoute>
        }
      />

      <Route
        path="/add-product" // ✅ this matches "/add-product" not "/addproduct"
        element={
          <ProtectedRoute isLogin={isLogin}>
            <AddProduct />
          </ProtectedRoute>
        }
      />

      <Route
        path="/category"
        element={
          <ProtectedRoute isLogin={isLogin}>
            <Category />
          </ProtectedRoute>
        }
      />

      <Route
        path="/addproduct"
        element={
          <ProtectedRoute isLogin={isLogin}>
            <AddProduct />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

export default AppRoutes;
