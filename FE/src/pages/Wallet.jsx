import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate } from "react-router-dom"
import './Wallet.css'

const qrImages = {
  10000: '/qr/qr-10k.png',
  50000: '/qr/qr-50k.png',
  100000: '/qr/qr-100k.png'
}

const Wallet = () => {
  const navigate = useNavigate()
  const CCCD = localStorage.getItem('user_cccd')
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState(null)
  const [qrUrl, setQrUrl] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [username, setUsername] = useState('')

  const baseURL = 'http://localhost:5000'

  // Nếu chưa đăng nhập thì chuyển về trang login
  if (!CCCD) {
    return (
      <div className="wallet-card" style={{ color: "red", textAlign: "center", padding: 24 }}>
        Bạn cần <span style={{color: "blue", cursor: "pointer"}} onClick={() => navigate("/login")}>đăng nhập</span> để sử dụng ví điện tử.
      </div>
    )
  }

  // Lấy số dư ví
  const fetchBalance = async () => {
    try {
      const res = await axios.get(`${baseURL}/wallet`, {
        params: { user_cccd: CCCD }
      })
      setBalance(res.data.balance)
    } catch (err) {
      setBalance(0)
    }
  }

  // Lấy tên người dùng
  const fetchUserInfo = async () => {
    try {
      const res = await axios.get(`${baseURL}/user-info`, {
        params: { user_cccd: CCCD }
      })
      setUsername(res.data.full_name)
    } catch (err) {
      setUsername('Không xác định')
    }
  }

  // Chọn số tiền nạp
  const handleAmountClick = (value) => {
    setAmount(value)
    setQrUrl(qrImages[value])
    setMessage('')
  }

  // Gửi yêu cầu nạp tiền
  const handleSubmit = async () => {
    if (!amount) {
      setMessage('❌ Vui lòng chọn số tiền muốn nạp.')
      return
    }
    try {
      setPending(true)
      const res = await axios.post(`${baseURL}/request-topup`, {
        user_cccd: CCCD,
        amount
      })
      setMessage(res.data.message || '✅ Gửi yêu cầu thành công! Vui lòng chờ admin duyệt.')
      setAmount(null)
      setQrUrl('')
      fetchBalance()
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
        '❌ Không gửi được yêu cầu đến admin.'
      )
    } finally {
      setPending(false)
    }
  }

  // Khi CCCD đổi (hoặc lần đầu load)
  useEffect(() => {
    fetchUserInfo()
    fetchBalance()
    // eslint-disable-next-line
  }, [CCCD])

  return (
    <div className="wallet-card">
      <h3>Ví điện tử</h3>
      <p className="wallet-user">{username}</p>
      <button className="refresh-btn" onClick={fetchBalance} disabled={pending}>
        🔄 Làm mới số dư
      </button>
      <div className={balance < 20000 ? 'wallet-warning' : 'wallet-ok'}>
        {balance < 10000
          ? '❌ Số dư ví đã đạt mức tối thiểu 10.000 VND, bạn phải nạp thêm để tiếp tục giao dịch!'
          : balance < 20000
            ? '⚠️ Số dư ví sắp chạm hạn mức tối thiểu 10.000 VND. Hãy nạp thêm để không bị gián đoạn.'
            : `✅ Số dư hiện tại: ${balance.toLocaleString('vi-VN')} VND`
        }
      </div>

      <div className="topup-options">
        <p>💸 Chọn số tiền nạp:</p>
        <div className="topup-buttons">
          {[10000, 50000, 100000].map(val => (
            <button
              key={val}
              onClick={() => handleAmountClick(val)}
              className={amount === val ? 'selected' : ''}
              disabled={pending}
            >
              {val.toLocaleString('vi-VN')} VND
            </button>
          ))}
        </div>
        {qrUrl && (
          <div className="qr-preview">
            <img src={qrUrl} alt="QR code" style={{ maxWidth: 200, marginTop: 10 }} />
            <p className="qr-hint">
              Vui lòng chuyển khoản đúng số tiền &amp; nội dung để admin duyệt nhanh.
            </p>
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="submit-btn"
          style={{ marginTop: 20 }}
          disabled={pending}
        >
          {pending ? 'Đang xử lý...' : 'Nạp tiền'}
        </button>
      </div>
      {message && <p className="wallet-message">{message}</p>}
    </div>
  )
}

export default Wallet
