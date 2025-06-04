import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import "./TuyenDetail.css"
import axios from "axios"

export default function TuyenDetail() {
  const { id } = useParams()
  const [tuyen, setTuyen] = useState(null)
  const [giaVe, setGiaVe] = useState([])

  useEffect(() => {
    axios.get(`http://localhost:5000/api/bus_routes/${id}`)
      .then(res => setTuyen(res.data))
      .catch(() => setTuyen(null))

    axios.get(`http://localhost:5000/api/bus_routes/${id}/prices`)
      .then(res => setGiaVe(res.data))
      .catch(() => setGiaVe([]))
  }, [id])

  if (!tuyen) return <p>Không tìm thấy thông tin tuyến.</p>

  return (
    <div className="tuyen-detail">
      <h2>Thông tin <span className="highlight">Tuyến {id}: {tuyen.route_name}</span></h2>

      <p><strong>Mã số tuyến:</strong> {id}</p>
      <p><strong>Tên tuyến:</strong> {tuyen.route_name}</p>

      <p><strong>Đi đến Bến xe buýt Chợ Lớn:</strong><br />{tuyen.arrival_description}</p>
      <p><strong>Đi đến Bến Thành:</strong><br />{tuyen.departure_description}</p>

      <p><strong>Đơn vị đảm nhận:</strong> {tuyen.operator}</p>

      <div className="info-grid">
        <div><strong>Loại hình hoạt động:</strong> {tuyen.route_type}</div>
        <div><strong>Cự ly:</strong> {tuyen.distance_km} km</div>
        <div><strong>Loại xe:</strong> {tuyen.vehicle_type}</div>
        <div><strong>Thời gian hoạt động:</strong> {tuyen.service_hours}</div>
      </div>

      <div>
        <strong>Giá vé:</strong>
        <oll>
          {giaVe.map((ve, i) => (
            <li key={i}>{ve.ticket_type}: {ve.price.toLocaleString()} VNĐ</li>
          ))}
        </oll>
      </div>

      <div className="info-grid">
        <div><strong>Số chuyến:</strong> {tuyen.trip_count}</div>
        <div><strong>Thời gian chuyến:</strong> {tuyen.trip_duration}</div>
        <div><strong>Giãn cách chuyến:</strong> {tuyen.trip_interval}</div>
      </div>
    </div>
  )
}
