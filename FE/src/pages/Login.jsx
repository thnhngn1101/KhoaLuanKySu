import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import "./auth.css"

export default function Login() {
  const [cccd, setCCCD] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const navigate = useNavigate()

  useEffect(() => {
    const savedCCCD = localStorage.getItem("verified_cccd")
    if (savedCCCD) {
      setCCCD(savedCCCD)
      setInfo("✅ Tài khoản của bạn đã được xác minh, hãy đăng nhập.")
      localStorage.removeItem("verified_cccd")
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    if (!cccd || !password) {
      setError("Vui lòng nhập đầy đủ.")
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append("cccd", cccd)
      formData.append("password", password)

      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      const data = await res.json()

      if (res.ok) {
        alert(`Chào mừng, ${data.ho_va_ten}!`)
        localStorage.setItem("ho_va_ten", data.ho_va_ten)
        navigate("/")
      } else {
        setError(data.message || "Đăng nhập thất bại.")
      }
    } catch {
      setError("Lỗi kết nối đến server.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>Đăng nhập</h2>

        {info && <p className="message">{info}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="CCCD (12 chữ số)"
            value={cccd}
            onChange={(e) => setCCCD(e.target.value)}
            maxLength={12}
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="error">{error}</p>}
          <button type="submit" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="switch-link">
          <p style={{ marginTop: "1rem" }}>
            <Link to="/forgot-password">Quên mật khẩu?</Link>
          </p>
          <p>
            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
