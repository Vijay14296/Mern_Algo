import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ProblemList from "./pages/ProblemList";
import ProblemDetail from "./pages/ProblemDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CreateProblem from "./pages/admin/CreateProblem";
import EditProblem from "./pages/admin/EditProblem";
import AdminProblemList from "./pages/admin/AdminProblemList"; // ✅ Added
import Navbar from "./components/Navbar";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  useEffect(() => {
    const syncAuth = () => {
      setToken(localStorage.getItem("token"));
      setRole(localStorage.getItem("role"));
    };

    syncAuth();
    window.addEventListener("storage", syncAuth);
    return () => window.removeEventListener("storage", syncAuth);
  }, []);

  const handleLogin = (newToken, newRole) => {
    setToken(newToken);
    setRole(newRole);
  };

  const AdminRoute = ({ children }) =>
    token && role === "admin" ? children : <Navigate to="/login" />;

  const PrivateRoute = ({ children }) =>
    token ? children : <Navigate to="/login" />;

  return (
    <Router>
      {token && <Navbar />}

      <Routes>
        {/* Redirect root based on role */}
        <Route
          path="/"
          element={
            token ? (
              role === "admin" ? (
                <Navigate to="/admin" />
              ) : (
                <Navigate to="/problems" />
              )
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Public Routes */}
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/create"
          element={
            <AdminRoute>
              <CreateProblem />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/edit/:id"
          element={
            <AdminRoute>
              <EditProblem />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/problems" // ✅ Added this route
          element={
            <AdminRoute>
              <AdminProblemList />
            </AdminRoute>
          }
        />

        {/* User + Admin Shared Routes */}
        <Route
          path="/problems"
          element={
            <PrivateRoute>
              <ProblemList />
            </PrivateRoute>
          }
        />
        <Route
          path="/problems/:id"
          element={
            <PrivateRoute>
              <ProblemDetail />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
