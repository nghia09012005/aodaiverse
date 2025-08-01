
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import './App.css';
import VirtualTryOn from './pages/AoDaiWorkshop/VirtualTryOn'; 

function App() {
  // const { loading } = useAuth();

  // if (loading) {
  //   return <LoadingScreen />;
  // }

  return (
    <div className="app">
      {/* <Header /> */}
      <main className="main-content">
        <Routes>

        <Route path="/virtualtryon" element={<VirtualTryOn />} />
        </Routes>
      </main>
      {/* <Footer /> */}
    </div>
    
  );
}

export default App; 
