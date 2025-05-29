import { useRef, useState, useEffect } from "react"
import "./Face.css"

export default function VerifyFace() {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [message, setMessage] = useState("")
  // eslint-disable-next-line no-unused-vars
  const [canVerify, setCanVerify] = useState(false)
  // eslint-disable-next-line no-unused-vars
  const [fullName, setFullName] = useState("")

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch(() => {
        setMessage("❌ Không thể truy cập camera.")
      })

    const interval = setInterval(checkVerifyCondition, 1500)
    return () => clearInterval(interval)
  }, [])

  const checkVerifyCondition = async () => {
    const canvas = canvasRef.current
    const video = videoRef.current
    if (!canvas || !video) return

    const ctx = canvas.getContext("2d")
    ctx.drawImage(video, 0, 0, 320, 240)
    const dataURL = canvas.toDataURL("image/jpeg")

    try {
      const res = await fetch("http://localhost:5000/verify-face-web", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // bắt buộc
        body: JSON.stringify({ image: dataURL })
      })

      const result = await res.json()

      if (result.status === "success") {
        setMessage(`✅ Xác thực thành công: ${result.full_name}`)
        setFullName(result.full_name)
        setCanVerify(true)
      } else {
        setMessage(result.message || "❌ Không xác thực được.")
        setCanVerify(false)
        setFullName("")
      }
    } catch {
      setMessage("❌ Không kết nối được server.")
      setCanVerify(false)
    }
  }

  return (
    <div className="face-register-container">
      <h2>🔍 Xác thực khuôn mặt</h2>
      <br />
      <div className="video-wrapper">
        <video ref={videoRef} autoPlay playsInline width="320" height="240" />
        <div className="face-box" />
      </div>
      <br />
      <canvas ref={canvasRef} width="320" height="240" style={{ display: "none" }} />

      {message && (
        <div className={`message-box ${message.includes("✅") ? "success" : "error"}`}>
          {message}
        </div>
      )}
    </div>
  )
}
