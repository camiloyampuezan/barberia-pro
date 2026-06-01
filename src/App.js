import { useState } from 'react';
import BarberiaApp from './barberia-sistema';
import BookingPage from './barberia-booking';

function App() {
  const [vista, setVista] = useState('admin');

  return (
    <div>
      {/* Botones para cambiar vista */}
      <div style={{ position: 'fixed', top: 10, right: 10, zIndex: 9999, display: 'flex', gap: 8 }}>
        <button onClick={() => setVista('admin')}
          style={{ background: vista === 'admin' ? '#c8a96e' : '#333', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
          ADMIN
        </button>
        <button onClick={() => setVista('cliente')}
          style={{ background: vista === 'cliente' ? '#c8a96e' : '#333', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
          CLIENTE
        </button>
      </div>

      {vista === 'admin' ? <BarberiaApp /> : <BookingPage />}
    </div>
  );
}

export default App;