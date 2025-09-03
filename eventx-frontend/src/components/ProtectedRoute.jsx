import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token");
  const userRole = JSON.parse(atob(token?.split(".")[1]))?.role; // decode JWT payload

  if (!token) return <Navigate to="/login" />; // not logged in
  if (role && userRole !== role) return <Navigate to="/login" />; // role mismatch

  return children;
};

export default ProtectedRoute;
