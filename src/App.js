import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VirtualTryOn from './page/VirtualTryOn';
import Payment from './page/Payment' 

function App() {
  return (
    <Router>
      <div className="app">
        <main className="main-content">
          <Routes>
            <Route path="/virtualtryon" element={<VirtualTryOn />} />
            <Route path="/Payment" element={<Payment />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
