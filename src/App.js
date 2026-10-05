import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BarberiaApp from './barberia-sistema';
import BookingPage from './barberia-booking';
import Login from './Login';

function AdminRoute() {
  const [auth, setAuth] = useState(localStorage.getItem("barberia_auth") === "true");

  const handleLogin = () => setAuth(true);

  const handleLogout = () => {
    localStorage.removeItem("barberia_auth");
    setAuth(false);
  };

  if (!auth) return <Login onLogin={handleLogin} />;
  return <BarberiaApp onLogout={handleLogout} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<BookingPage />} />
        <Route path="/admin" element={<AdminRoute />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;