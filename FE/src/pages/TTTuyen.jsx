import { useState, useEffect } from "react"
import "./TTTuyen.css"
import { Link } from "react-router-dom"
import axios from "axios"

export default function TTTuyen() {
  const [search, setSearch] = useState("")
  const [routes, setRoutes] = useState([])

  useEffect(() => {
    axios.get("http://localhost:5000/api/bus_routes")
      .then(res => setRoutes(res.data))
      .catch(err => console.error("Lỗi khi tải danh sách tuyến:", err))
  }, [])

  const filtered = routes.filter(route =>
    route.id.includes(search) || route.route_name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="route-container">
      <h2>Danh sách <span className="highlight">Tuyến</span></h2>
      <div className="search-area">
        <input
          type="text"
          placeholder="<nhập mã hoặc tên tuyến>"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button>🔍 Tìm</button>
      </div>

      <div className="route-grid">
        {filtered.map((route) => (
          <Link to={`/tuyen/${route.id}`} key={route.id} className="route-card" title={`[${route.id}] ${route.route_name}`}>
            <div className="route-id">{route.id}</div>
            <div className="route-name">{route.route_name}</div>
          </Link>
        ))}
      </div>
    </div>
  )
}
