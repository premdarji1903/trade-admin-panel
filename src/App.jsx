import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLogin from "./Login";
import Dashboard from "./Dashboard";
import ClientsList from "./ClientList";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AdminLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<ClientsList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
