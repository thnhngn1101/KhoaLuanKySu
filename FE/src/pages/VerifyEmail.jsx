import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import "./auth.css"

export default function VerifyEmail() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState("Đang xác minh...")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch(`http://localhost:5000/verify/${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.message) {
          setMessage(data.message)
          setSuccess(true)

          // ✅ Lưu email nếu có (nếu backend trả về)
          if (data.email) {
            localStorage.setItem("verified_email", data.email)
          }

          // ✅ Chuyển hướng về login sau 2 giây
          setTimeout(() => {
            navigate("/login")
          }, 2000)
        } else {
          setMessage(data.error || "Xác minh thất bại.")
        }
      })
      .catch(() => {
        setMessage("Lỗi khi kết nối server.")
      })
  }, [token, navigate])

  return (
    <div className="auth-container">
      <div className="auth-box">
        <h2>{success ? "✅ Thành công" : "❌ Thất bại"}</h2>
        <p>{message}</p>
      </div>
    </div>
  )
}
