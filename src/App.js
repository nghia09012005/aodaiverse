import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VirtualTryOn from './page/VirtualTryOn'; 

function App() {
  return (
    <Router>
      <div className="app">
        <main className="main-content">
          <Routes>
            <Route path="/virtualtryon" element={<VirtualTryOn />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
