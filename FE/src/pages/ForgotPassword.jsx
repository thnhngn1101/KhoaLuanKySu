import { useState } from "react"
import "./auth.css"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")
    try {
      const formData = new FormData()
      formData.append("email", email)

      const res = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        body: formData,
      })

      const text = await res.text()
      setMessage(text)
    } catch {
      setMessage("Không thể gửi yêu cầu.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Quên mật khẩu</h2>
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Nhập email" value={email} onChange={e => setEmail(e.target.value)} />
          <button type="submit" disabled={loading}>
            {loading ? "Đang gửi..." : "Gửi yêu cầu"}
          </button>
        </form>
        {message && <p style={{ marginTop: "10px" }}>{message}</p>}
      </div>
    </div>
  )
}
