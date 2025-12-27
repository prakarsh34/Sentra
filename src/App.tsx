import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Report from "./pages/Report";

function App() {
  return (
    <BrowserRouter>
      <div style={{ padding: "20px" }}>
        {/* NAVBAR */}
        <nav style={{ marginBottom: "20px" }}>
          <Link to="/" style={{ marginRight: "15px" }}>
            Home
          </Link>
          <Link to="/report">
            Report Incident
          </Link>
        </nav>

        {/* ROUTES */}
        <Routes>
          <Route path="/" element={<h1>Sentra Home</h1>} />
          <Route path="/report" element={<Report />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
