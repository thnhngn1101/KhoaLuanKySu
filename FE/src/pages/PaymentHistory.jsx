import React, { useEffect, useState } from 'react'
import axios from 'axios' // ✅ Dùng trực tiếp axios thay vì api
import './PaymentHistory.css'

const PaymentHistory = () => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // 🔐 Nếu bạn có token xác thực, dùng Authorization
        // const token = localStorage.getItem('token')

        const res = await axios.get('http://localhost:5000/payment-history', {
          headers: {
            // Authorization: `Bearer ${token}`,
            user_cccd: '001123456789', // 👈 Giả lập CCCD nếu chưa có auth
          },
        })
        setHistory(res.data)
      } catch (err) {
        console.error(err)
        setError('Không thể tải lịch sử giao dịch.')
      } finally {
        setLoading(false)
      }
    }

    fetchHistory()
  }, [])

  return (
    <div className="payment-container">
      <h2>Lịch sử giao dịch</h2>

      {loading && <p>Đang tải dữ liệu...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && history.length === 0 && <p>Không có giao dịch nào.</p>}

      {!loading && history.length > 0 && (
        <table className="payment-table">
          <thead>
            <tr>
              <th>Loại</th>
              <th>Số tiền</th>
              <th>Mô tả</th>
              <th>Thời gian</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item, index) => (
              <tr key={index}>
                <td>{item.type === 'topup' ? 'Nạp tiền' : 'Thanh toán'}</td>
                <td>{item.amount.toLocaleString()} VND</td>
                <td>{item.description}</td>
                <td>{item.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default PaymentHistory
