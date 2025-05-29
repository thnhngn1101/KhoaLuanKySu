import { useRef, useState, useEffect } from "react"
import "./Face.css"

export default function FaceRegister() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [message, setMessage] = useState("")
  const [toast, setToast] = useState("")
  const [loading, setLoading] = useState(false)
  const [canCapture, setCanCapture] = useState(false)

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch(() => {
        setMessage("❌ Không thể truy cập camera.")
      })

    const interval = setInterval(checkFaceCondition, 1000)
    return () => clearInterval(interval)
  }, [])

  const checkFaceCondition = async () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0, 320, 240)
    const dataURL = canvas.toDataURL("image/jpeg")

    try {
      const res = await fetch("http://localhost:5000/register-face-web/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ image: dataURL })
      })

      const text = await res.text()

      if (text.includes("✅")) {
        setMessage("✅ Khuôn mặt đủ điều kiện, bạn có thể chụp.")
        setCanCapture(true)
      } else {
        setMessage(text)
        setCanCapture(false)
      }
    } catch {
      setMessage("❌ Không kết nối được máy chủ.")
      setCanCapture(false)
    }
  }

  const handleCapture = async () => {
    if (!canCapture) {
      setMessage("❌ Khuôn mặt chưa đủ điều kiện. Vui lòng điều chỉnh.")
      return
    }

    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    setLoading(true)
    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0, 320, 240)
    const dataURL = canvas.toDataURL("image/jpeg")

    try {
      const res = await fetch("http://localhost:5000/register-face-web", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ image: dataURL })
      })

      const text = await res.text()

      if (text.includes("✅")) {
        setToast("✅ Đăng ký khuôn mặt thành công!")
        setMessage("")
      } else {
        setMessage(text)
      }
    } catch {
      setMessage("❌ Không thể kết nối tới server.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(""), 3000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  return (
    <div className="face-register-container">
      <h2>📸 Đăng ký khuôn mặt</h2>

      <div className="video-wrapper">
        <video ref={videoRef} autoPlay playsInline width="320" height="240" />
        <div className="face-box" />
      </div>
      <br></br>
      <canvas ref={canvasRef} width="320" height="240" style={{ display: "none" }} />

      {message && (
        <div className={`message-box ${message.includes("✅") ? "success" : "error"}`}>
          {message}
        </div>
      )}
      <br></br>
      <button
        className="capture-button"
        onClick={handleCapture}
        disabled={loading || !canCapture}
      >
        {loading ? "⏳ Đang xử lý..." : "📷 Chụp & Gửi"}
      </button>
      <br></br>
      {toast && (
        <div className="toast-success">
          {toast}
        </div>
      )}
    </div>
  )
}
