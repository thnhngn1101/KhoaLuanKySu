import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom"
import Header from "./components/Header"
import Navbar from "./components/Navbar"
import Footer from "./components/Footer"

import Home from "./pages/Home"
import Intro from "./pages/Intro"

import Login from "./pages/Login"
import Register from "./pages/Register"
import VerifyEmail from "./pages/verifyEmail"
import ForgotPassword from "./pages/ForgotPassword"
import ResetPassword from "./pages/resetPassword"


import TTTuyen from "./pages/TTTuyen"
import TuyenDetail from "./pages/TuyenDetail"

import Profile from "./pages/Profile"
import FaceRegister from "./pages/FaceRegister"


import Wallet from "./pages/Wallet"
import PaymentHistory from "./pages/PaymentHistory"

// Layout mặc định có Header + Navbar + Footer
function DefaultLayout() {
  return (
    <div className="app-container">
      <Header />
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  )
}

function App() {
  return (
    <Router>
      
      <Routes>
        {/* Layout riêng - không có header/footer */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify/:token" element={<VerifyEmail />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />


        {/* Layout mặc định */}
        <Route element={<DefaultLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/intro" element={<Intro />} />

          <Route path="/TTTuyen" element={<TTTuyen />} />
          <Route path="/tuyen/:id" element={<TuyenDetail />} />
    
          

          <Route path="/profile" element={<Profile />} />
          <Route path="/faceregister" element={<FaceRegister />} />
         
          <Route path="/Wallet" element={<Wallet />} />
        <Route path="/PaymentHistory" element={<PaymentHistory />} />



          
          
        </Route>
      </Routes>
    </Router>
  )
}

export default App
