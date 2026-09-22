import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, ToastProvider, useAuth } from "./hooks/useAuth";
import MainLayout from "./layouts/MainLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import HeroSection from "./components/HeroSection";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Labs from "./pages/Labs";
import Compare from "./pages/Compare";
import Appointment from "./pages/Appointment";
import Reviews from "./pages/Reviews";
import History from "./pages/History";
import NotFound from "./pages/NotFound";

import LabDetails from "./pages/LabDetails";

// Home Landing Component incorporating HeroSection and trust highlights
const HomePage = () => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <div className="w-full">
      <HeroSection />
    </div>
  );
};

function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Healthcare Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
  path="/labs"
  element={
    <ProtectedRoute>
      <Labs />
    </ProtectedRoute>
  }
/>

<Route
  path="/labs/:id"
  element={
    <ProtectedRoute>
      <LabDetails />
    </ProtectedRoute>
  }
/>
        
        <Route
          path="/compare"
          element={
            <ProtectedRoute>
              <Compare />
            </ProtectedRoute>
          }
        />
        <Route
          path="/appointments"
          element={
            <ProtectedRoute>
              <Appointment />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <Reviews />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />

        {/* 404 Catch-All */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
