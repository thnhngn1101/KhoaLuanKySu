import { useState } from "react"
import { Link } from "react-router-dom"
import "./auth.css"

export default function Register() {
  const [form, setForm] = useState({
    cccd: "",
    ho_va_ten: "",
    email: "",
    password: "",
    confirm_password: ""
  })
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage("")
    setError("")

    const formData = new FormData()
    Object.entries(form).forEach(([key, val]) => formData.append(key, val))

    setLoading(true)
    try {
      const res = await fetch("http://localhost:5000/register", {
        method: "POST",
        body: formData,
        credentials: "include"
      })
      const text = await res.text()
      if (res.ok) {
        setMessage(text)
        setForm({ cccd: "", ho_va_ten: "", email: "", password: "", confirm_password: "" })
      } else setError(text)
    } catch {
      setError("Lỗi kết nối server.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Đăng ký</h2>
        {message && <p className="message">{message}</p>}
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <input name="cccd" placeholder="CCCD (12 số)" value={form.cccd} onChange={handleChange} />
          <input name="ho_va_ten" placeholder="Họ và tên" value={form.ho_va_ten} onChange={handleChange} />
          <input name="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <input name="password" type="password" placeholder="Mật khẩu" value={form.password} onChange={handleChange} />
          <input name="confirm_password" type="password" placeholder="Xác nhận mật khẩu" value={form.confirm_password} onChange={handleChange} />
          <button type="submit" disabled={loading}>{loading ? "Đang xử lý..." : "Đăng ký"}</button>
        </form>
        <p>Bạn đã có tài khoản? <Link to="/login">Đăng nhập</Link></p>
      </div>
    </div>
  )
}
