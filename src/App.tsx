import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Report from "./pages/Report";
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";
import OperationsView from "./pages/OperationsView";

function App() {
  const { user, role, loading } = useAuth();
  if (loading) return null;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
        <Route path="/operations" element={<OperationsView />} />

        {user && role === "citizen" && (
          <Route path="/report" element={<Report />} />
        )}

        {user && role === "responder" && (
          <>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/map" element={<MapView />} />
          </>
        )}

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default App;
