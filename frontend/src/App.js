import "./App.css";
import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import Home from "./pages/Home";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import EducationCategories from "./pages/admin/masters/EducationCategories";
import EducationSubCategories from "./pages/admin/masters/EducationSubCategories";

function RequireAuth({ children }) {
  const isAuthed = !!localStorage.getItem("hireme_admin");
  return isAuthed ? children : <Navigate to="/admin/login" replace />;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
          <Route path="/admin/masters/education-categories" element={<RequireAuth><EducationCategories /></RequireAuth>} />
          <Route path="/admin/masters/education-sub-categories" element={<RequireAuth><EducationSubCategories /></RequireAuth>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;
