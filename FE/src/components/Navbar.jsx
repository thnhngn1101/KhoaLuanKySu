"use client"

import { useState } from "react"
import { Search, Menu } from "lucide-react"
import { Link, useNavigate } from "react-router-dom"

const mockRoutes = [
  { id: "01", name: "Bến Thành - Bến xe buýt Chợ Lớn" },
  { id: "03", name: "Bến Thành - Thạnh Xuân" },
  { id: "04", name: "Bến Thành - Cộng Hòa - Bến xe An Sương" },
  { id: "05", name: "Bến xe buýt Chợ Lớn - Bến xe Biên Hòa" },
  { id: "06", name: "Bến xe buýt Chợ Lớn - Đại học Nông Lâm" },
  { id: "16", name: "Bến xe buýt Chợ Lớn - Bến xe buýt Tân Phú" },
  { id: "50", name: "Đại học Bách khoa - Đại học Quốc gia" },
]

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const navigate = useNavigate()

  const filteredRoutes = mockRoutes.filter(
    r =>
      r.id.includes(searchTerm.trim()) ||
      r.name.toLowerCase().includes(searchTerm.trim().toLowerCase())
  )

  const handleSearch = () => {
    const found = mockRoutes.find(r => r.id === searchTerm.trim())
    if (found) {
      navigate(`/tuyen/${found.id}`)
    } else {
      alert("Không tìm thấy tuyến.")
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSearch()
  }

  const navItems = [
    { id: 1, label: "Trang chủ", url: "/" },
    { id: 2, label: "Giới thiệu", url: "/Intro" },
    { id: 3, label: "Thông tin tuyến", url: "/TTTuyen" },
    { id: 5, label: "Đăng ký khuôn mặt", url: "/FaceRegister" },
    { id: 6, label: "Ví tiền", url: "/Wallet" },
    { id: 7, label: "Lịch sử thanh toán", url: "/PaymentHistory" },
    { id: 8, label: "Xac thuc khuon mat", url: "/VerifyFace" },
  ]

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <ul className={`nav-list ${mobileMenuOpen ? "mobile-open" : ""}`}>
          {navItems.map((item) => (
            <li key={item.id} className="nav-item">
              <Link to={item.url} className="nav-link">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="search-container" style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Tìm tuyến xe..."
            className="search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="search-button" onClick={handleSearch}>
            <Search size={18} />
          </button>

          {searchTerm && (
            <ul className="suggestion-list">
              {filteredRoutes.map((r) => (
                <li
                  key={r.id}
                  className="suggestion-item"
                  onClick={() => {
                    setSearchTerm(r.id)
                    navigate(`/tuyen/${r.id}`)
                  }}
                >
                  <strong>{r.id}</strong> – {r.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <button className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <Menu size={24} />
        </button>
      </div>
    </nav>
  )
}
