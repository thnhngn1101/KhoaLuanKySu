import React, { useEffect, useState } from 'react'
import axios from 'axios'
import './Wallet.css'

const qrImages = {
  10000: '/qr/qr-10k.png',
  50000: '/qr/qr-50k.png',
  100000: '/qr/qr-100k.png'
}

const Wallet = () => {
  const [balance, setBalance] = useState(0)
  const [amount, setAmount] = useState(null)
  const [qrUrl, setQrUrl] = useState('')
  const [message, setMessage] = useState('')
  const [username] = useState('Pony') // lấy từ session sau

  const baseURL = 'http://localhost:5000'

  const fetchBalance = async () => {
    try {
      const res = await axios.get(`${baseURL}/wallet`, {
        headers: { user_cccd: '001123456789' }
      })
      setBalance(res.data.balance)
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setMessage('❌ Không thể tải số dư.')
    }
  }

  const handleAmountClick = (value) => {
    setAmount(value)
    setQrUrl(qrImages[value])
    setMessage('')
  }

  const handleSubmit = async () => {
    if (!amount) {
      setMessage('❌ Vui lòng chọn số tiền muốn nạp.')
      return
    }

    try {
      const res = await axios.post(`${baseURL}/api/request-topup`, {
        amount
      }, {
        headers: { user_cccd: '001123456789' }
      })

      setMessage(res.data.message || '✅ Gửi yêu cầu thành công!')
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setMessage('❌ Không gửi được yêu cầu đến admin.')
    }
  }

  useEffect(() => {
    fetchBalance()
  }, [])

  return (
    <div className="wallet-card">
      <h3>Ví của bạn</h3>
      <p className="wallet-user">{username}</p>

      <div className={balance <= 0 ? 'wallet-warning' : 'wallet-ok'}>
        {balance <= 0 ? '⚠️ Số dư ví còn ít.' : `✅ Số dư hiện tại: ${balance.toLocaleString('vi-VN')} VND`}
      </div>

      <div className="topup-options">
        <p>💸 Chọn số tiền nạp:</p>
        <div className="topup-buttons">
          {[10000, 50000, 100000].map(val => (
            <button key={val} onClick={() => handleAmountClick(val)} className={amount === val ? 'selected' : ''}>
              {val.toLocaleString('vi-VN')} VND
            </button>
          ))}
        </div>
        {qrUrl && (
          <div className="qr-preview">
            <img src={qrUrl} alt="QR code" style={{ maxWidth: 200, marginTop: 10 }} />
          </div>
        )}
        <button onClick={handleSubmit} className="submit-btn" style={{ marginTop: 20 }}>Nạp tiền</button>
      </div>

      {message && <p className="wallet-message">{message}</p>}
    </div>
  )
}

export default Wallet
