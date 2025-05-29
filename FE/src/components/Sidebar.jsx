import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Sidebar.css"

const mockRoutes = [
  { id: "01", name: "Bến Thành - Bến xe buýt Chợ Lớn" },
  { id: "03", name: "Bến Thành - Thạnh Xuân" },
  { id: "04", name: "Bến Thành - Cộng Hòa - Bến xe An Sương" },
  { id: "05", name: "Bến xe buýt Chợ Lớn - Bến xe Biên Hòa" },
  { id: "06", name: "Bến xe buýt Chợ Lớn - Đại học Nông Lâm" },
  { id: "16", name: "Bến xe buýt Chợ Lớn - Bến xe buýt Tân Phú" },
  { id: "50", name: "Đại học Bách khoa - Đại học Quốc gia" },
]

export default function Sidebar() {
  const [busRoute, setBusRoute] = useState("")

  const navigate = useNavigate()

  const suggestions = mockRoutes.filter(
    (r) =>
      r.id.includes(busRoute.trim()) ||
      r.name.toLowerCase().includes(busRoute.trim().toLowerCase())
  )

  const handleRouteSearch = () => {
    const found = mockRoutes.find(r => r.id === busRoute.trim())
    if (found) {
      navigate(`/tuyen/${found.id}`)
    } else {
      alert("Không tìm thấy tuyến xe buýt này.")
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleRouteSearch()
    }
  }

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">Thông tin Tuyến</h3>
        <div className="search-box" style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Nhập số hiệu tuyến (vd: 08)"
            value={busRoute}
            onChange={(e) => setBusRoute(e.target.value)}
            onKeyDown={handleKeyDown}
            className="search-input"
          />
          <button onClick={handleRouteSearch} className="search-button">
            Tìm kiếm
          </button>

          {busRoute.trim() && (
            <ul className="suggestion-list">
              {suggestions.map((r) => (
                <li
                  key={r.id}
                  className="suggestion-item"
                  onClick={() => {
                    setBusRoute(r.id)
                    navigate(`/tuyen/${r.id}`)
                  }}
                >
                  <strong>{r.id}</strong> – {r.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
