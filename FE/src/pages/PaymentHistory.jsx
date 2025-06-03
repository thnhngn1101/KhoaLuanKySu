import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './PaymentHistory.css'

const PaymentHistory = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const userCCCD = localStorage.getItem('user_cccd')  // Lấy tự động từ localStorage
  const baseURL = 'http://localhost:5000'

  useEffect(() => {
    if (!userCCCD) {
      setError('Không có thông tin CCCD. Vui lòng đăng nhập lại.')
      setLoading(false)
      return
    }
    const fetchHistory = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await axios.get(`${baseURL}/payment-history`, {
          params: { user_cccd: userCCCD }
        })
        setHistory(res.data)
      } catch (err) {
        setError('Không thể tải lịch sử giao dịch. Vui lòng thử lại sau.')
        setHistory([])
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [userCCCD])

  const formatDate = (dateString) => {
    if (!dateString) return ''
    const d = new Date(dateString)
    return isNaN(d.getTime()) ? dateString : d.toLocaleString('vi-VN', { hour12: false })
  }

  return (
    <div className="payment-history-card">
      <h3>Lịch sử giao dịch</h3>
      {loading ? (
        <p>Đang tải...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : history.length === 0 ? (
        <p>Không có giao dịch nào.</p>
      ) : (
        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Số tiền</th>
                <th>Biển số xe</th>
                <th>Mã tuyến</th>
                <th>Tuyến xe</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item, idx) => (
                <tr key={item.id || idx}>
                  <td>{formatDate(item.paid_at || item.created_at)}</td>
                  <td>{item.amount?.toLocaleString('vi-VN') || ''} VND</td>
                  <td>{item.bus_license_plate || item.license_plate || '-'}</td>
                  <td>{item.route_id || '-'}</td>
                  <td>{item.route_name || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default PaymentHistory
