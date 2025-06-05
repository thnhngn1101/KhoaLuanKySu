"use client"

import { useEffect, useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import logo from "../assets/logo.svg"
import "./Header.css"

export default function Header() {
  const navigate = useNavigate()
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const name = localStorage.getItem("ho_va_ten")
    if (name) setUserName(name)
  }, [])

  const handleLogin = () => navigate("/login")

  const handleLogout = () => {
    fetch("http://localhost:5000/logout", {
      credentials: "include",
    }).then(() => {
      localStorage.removeItem("ho_va_ten")
        localStorage.removeItem("user_cccd")   
      setUserName("")
      navigate("/")
    })
  }

  const goToProfile = () => {
    navigate("/profile")
  }

  return (
    <header className="site-header">
      <div className="header-container">
        <div className="logo-container">
          <Link to="/">
            <img
              src={logo || "/placeholder.svg"}
              alt="Logo Sở Giao Thông Công Chánh TPHCM"
              className="logo"
              style={{ cursor: "pointer" }}
            />
          </Link>
          <div className="site-title">
             <Link to="/">
            <h1>SỞ GIAO THÔNG CÔNG CHÁNH THÀNH PHỐ HỒ CHÍ MINH</h1>
            <h2>TRUNG TÂM QUẢN LÝ GIAO THÔNG CÔNG CỘNG THÀNH PHỐ HỒ CHÍ MINH</h2>
            </Link>
          </div>
        </div>

        <div className="header-actions">
          {userName ? (
            <div className="user-dropdown">
              <div className="user-name">
                {userName}
                <div className="dropdown-content">
                  <button onClick={goToProfile}>Hồ sơ người dùng</button>
                  <button onClick={handleLogout}>Đăng xuất</button>
                </div>
              </div>
            </div>
          ) : (
            <button onClick={handleLogin}>Đăng nhập</button>
          )}
        </div>
      </div>
    </header>
  )
}
