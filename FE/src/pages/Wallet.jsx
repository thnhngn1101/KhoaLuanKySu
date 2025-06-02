import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './Wallet.css'

const qrImages = {
  10000: '/qr/qr-10k.png',
  50000: '/qr/qr-50k.png',
  100000: '/qr/qr-100k.png'
}

const CCCD = '087303004730'

const Wallet = () => {
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState(null)
  const [qrUrl, setQrUrl] = useState('')
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState(false)
  const [username, setUsername] = useState('')

  const baseURL = 'http://localhost:5000'

  // Lấy số dư ví từ backend (GET, truyền user_cccd qua params)
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

  // Lấy tên người dùng từ backend (GET, truyền user_cccd qua params)
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

  // Xử lý khi chọn số tiền nạp
  const handleAmountClick = (value) => {
    setAmount(value)
    setQrUrl(qrImages[value])
    setMessage('')
  }

  // Gửi yêu cầu nạp tiền (POST, truyền user_cccd và amount vào body)
  const handleSubmit = async () => {
    if (!amount) {
      setMessage('❌ Vui lòng chọn số tiền muốn nạp.')
      return
    }
    try {
      setPending(true)
      const res = await axios.post(`${baseURL}/request-topup`, {
        user_cccd: CCCD,      // Truyền CCCD vào body
        amount
      })
      setMessage(res.data.message || '✅ Gửi yêu cầu thành công! Vui lòng chờ admin duyệt.')
      setPending(false)
      fetchBalance() // Cập nhật số dư luôn nếu cần
    } catch (err) {
      setMessage(
        err.response?.data?.error ||
        '❌ Không gửi được yêu cầu đến admin.'
      )
      setPending(false)
    }
  }

  useEffect(() => {
    fetchUserInfo()
    fetchBalance()
    // eslint-disable-next-line
  }, [])

  return (
    <div className="wallet-card">
      <h3>Ví điện tử</h3>
      <p className="wallet-user">{username}</p>
      <button className="refresh-btn" onClick={fetchBalance} disabled={pending}>
        🔄 Làm mới số dư
      </button>

      <div className={balance <= 0 ? 'wallet-warning' : 'wallet-ok'}>
        {balance <= 0
          ? '⚠️ Số dư ví còn ít.'
          : `✅ Số dư hiện tại: ${balance.toLocaleString('vi-VN')} VND`}
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
              Vui lòng chuyển khoản đúng số tiền & nội dung để admin duyệt nhanh.
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
