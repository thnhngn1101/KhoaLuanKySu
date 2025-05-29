"use client"

import { useNavigate } from "react-router-dom"
import { useEffect, useState } from "react"
import logo from "../assets/react.svg"
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
          <img
            src={logo || "/placeholder.svg"}
            alt="Logo Sở Giao Thông Công Chánh TPHCM"
            className="logo"
          />
          <div className="site-title">
            <h1>SỞ GIAO THÔNG CÔNG CHÁNH THÀNH PHỐ HỒ CHÍ MINH</h1>
            <h2>TRUNG TÂM QUẢN LÝ GIAO THÔNG CÔNG CỘNG THÀNH PHỐ HỒ CHÍ MINH</h2>
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
