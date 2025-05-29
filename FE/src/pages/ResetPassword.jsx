import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import "./auth.css"

export default function ResetPassword() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [message, setMessage] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    if (password !== confirm) {
      setMessage("Mật khẩu xác nhận không khớp.")
      setLoading(false)
      return
    }

    const formData = new FormData()
    formData.append("new_password", password)
    formData.append("confirm_password", confirm)

    try {
      const res = await fetch(`http://localhost:5000/reset-password/${token}`, {
        method: "POST",
        body: formData,
      })
      const text = await res.text()
      setMessage(text)

      // ✅ Nếu đổi mật khẩu thành công, điều hướng về login sau 2s
      if (res.ok) {
        setTimeout(() => {
          navigate("/login")
        }, 2000)
      }
    } catch {
      setMessage("Lỗi khi gửi yêu cầu.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Đặt lại mật khẩu</h2>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <input
            type="password"
            placeholder="Xác nhận lại"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </form>
        {message && <p style={{ marginTop: "10px" }}>{message}</p>}
      </div>
    </div>
  )
}
