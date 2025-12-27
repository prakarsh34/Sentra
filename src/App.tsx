import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Report from "./pages/Report";
import Dashboard from "./pages/Dashboard";
import MapView from "./pages/MapView";
import OperationsView from "./pages/OperationsView";
import { useRole } from "./context/RoleContext";

function App() {
  const { role } = useRole();

  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<Home />} />

        {/* CITIZEN */}
        <Route
          path="/report"
          element={
            role === "citizen" ? <Report /> : <Navigate to="/" replace />
          }
        />

        {/* RESPONDER */}
        <Route
          path="/operations"
          element={
            role === "responder" ? (
              <OperationsView />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/dashboard"
          element={
            role === "responder" ? (
              <Dashboard />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />

        <Route
          path="/map"
          element={
            role === "responder" ? <MapView /> : <Navigate to="/" replace />
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
