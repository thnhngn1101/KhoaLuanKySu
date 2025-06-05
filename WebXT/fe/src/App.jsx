import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DriverLogin from './pages/DriverLogin';
import VerifyFace from './pages/VerifyFace';

function App() {
  return (
    <Router>
      <Routes>
        {/* Route mặc định cho "/" */}
        <Route path="/" element={<DriverLogin />} />

        {/* Các route khác */}
        <Route path="/driver_login" element={<DriverLogin />} />
        <Route path="/verifyface" element={<VerifyFace />} />
      </Routes>
    </Router>
  );
}

export default App;
