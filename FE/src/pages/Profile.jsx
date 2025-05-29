import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import "./Profile.css"

export default function Profile() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState("")
  const [toast, setToast] = useState(false)

  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showForm, setShowForm] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState({
    full_name: "",
    email: "",
    phone_number: ""
  })

  const [showUpload, setShowUpload] = useState(false)
  const [uploadMessage, setUploadMessage] = useState("")
  const [selectedFile, setSelectedFile] = useState(null)

  useEffect(() => {
    fetch("http://localhost:5000/dashboard", { credentials: "include" })
      .then(res => {
        if (res.status === 401) {
          navigate("/login")
          return null
        }
        return res.json()
      })
      .then(data => {
        if (data) {
          setUser(data)
          setEditData({
            full_name: data.full_name || "",
            email: data.email || "",
            phone_number: data.phone_number || ""
          })
        }
      })
      .catch(() => setMessage("❌ Không thể kết nối server."))
      .finally(() => setLoading(false))
  }, [navigate])

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setMessage("")
    if (newPassword !== confirmPassword) {
      setMessage("❌ Mật khẩu xác nhận không khớp.")
      return
    }

    const formData = new FormData()
    formData.append("old_password", oldPassword)
    formData.append("new_password", newPassword)
    formData.append("confirm_password", confirmPassword)

    try {
      const res = await fetch("http://localhost:5000/change-password", {
        method: "POST",
        body: formData,
        credentials: "include",
      })

      const text = await res.text()
      if (res.ok) {
        setToast(true)
        setMessage("")
        setShowForm(false)
        setOldPassword("")
        setNewPassword("")
        setConfirmPassword("")
        setTimeout(() => setToast(false), 3000)
      } else {
        setMessage(`❌ ${text}`)
      }
    } catch {
      setMessage("❌ Lỗi khi gửi yêu cầu.")
    }
  }

  const handleSaveInfo = async (e) => {
    e.preventDefault()
    setMessage("")

    try {
      const res = await fetch("http://localhost:5000/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editData),
      })

      const text = await res.text()
      if (res.ok) {
        setMessage("✅ Cập nhật thành công. Nếu bạn đổi email, hãy kiểm tra hộp thư để xác minh.")
        setToast(true)
        setIsEditing(false)

        const updated = await fetch("http://localhost:5000/dashboard", { credentials: "include" })
        const updatedUser = await updated.json()
        setUser(updatedUser)
        setEditData({
          full_name: updatedUser.full_name || "",
          email: updatedUser.email || "",
          phone_number: updatedUser.phone_number || ""
        })

        setTimeout(() => setToast(false), 3000)
      } else {
        setMessage(`❌ ${text}`)
      }
    } catch {
      setMessage("❌ Không thể cập nhật thông tin.")
    }
  }

  const handleUploadStudentCard = async (e) => {
    e.preventDefault()
    setUploadMessage("")
    if (!selectedFile) {
      setUploadMessage("❌ Vui lòng chọn ảnh.")
      return
    }

    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      const res = await fetch("http://localhost:5000/upload-student-card", {
        method: "POST",
        credentials: "include",
        body: formData
      })

      const text = await res.text()
      if (res.ok) {
        setUploadMessage(text)
        setSelectedFile(null)
        setShowUpload(false)

        const updated = await fetch("http://localhost:5000/dashboard", { credentials: "include" })
        const updatedUser = await updated.json()
        setUser(updatedUser)
      } else {
        setUploadMessage(`❌ ${text}`)
      }
    } catch {
      setUploadMessage("❌ Không thể tải ảnh.")
    }
  }

  if (loading) return <p>⏳ Đang tải dữ liệu...</p>

  return (
    <div className="profile-wrapper">
      <div className="profile-container">
        <div className="avatar-section">
          <h2 className="user-name">👤 {user?.full_name}</h2>
          <p className="user-type">🎟️ {user?.passenger_type}</p>
        </div>

        <div className="info-section">
          {isEditing ? (
            <form className="edit-form" onSubmit={handleSaveInfo}>
              <h3>📝 Chỉnh sửa thông tin</h3>
              {message && <p className={message.includes("✅") ? "message" : "error"}>{message}</p>}
              <input type="text" placeholder="Họ và tên" value={editData.full_name} onChange={e => setEditData({ ...editData, full_name: e.target.value })} />
              <input type="email" placeholder="Email" value={editData.email} onChange={e => setEditData({ ...editData, email: e.target.value })} />
              <input type="tel" placeholder="Số điện thoại" value={editData.phone_number} onChange={e => setEditData({ ...editData, phone_number: e.target.value })} />
              <div className="button-group">
                <button type="submit" className="primary-btn">💾 Lưu thay đổi</button>
                <button type="button" className="secondary-btn" onClick={() => setIsEditing(false)}>❌ Hủy</button>
              </div>
            </form>
          ) : (
            <>
              <div className="info-row"><span>📇 CCCD:</span> {user?.cccd}</div>
              <div className="info-row">
                <span>📧 Email:</span> {user?.email}
                {!user?.is_verified && <span className="warning-text">❗Email chưa xác minh.</span>}
              </div>
              <div className="info-row"><span>📱 Số điện thoại:</span> {user?.phone_number || "Chưa cập nhật"}</div>
              <div className="info-row"><span>🎓 Mã sinh viên:</span> {user?.student_id || "Không có"}</div>
              <div className="info-row"><span>📅 Năm nhập học:</span> {user?.student_enroll_year || "Không có"}</div>
              <div className="info-row"><span>👫 Giới tính:</span> {user?.gender || "Chưa rõ"}</div>
              <div className="info-row"><span>🎂 Năm sinh:</span> {user?.birth_year || "Chưa rõ"}</div>
              <div className="info-row"><span>🔢 Tuổi:</span> {user?.age || "Chưa rõ"}</div>
              <div className="info-row"><span>🏙️ Tỉnh thành:</span> {user?.province || "Không rõ"}</div>
              <div className="info-row"><span>🕓 Ngày tạo:</span> {user?.created_at}</div>

              <div className="button-group">
                <button className="primary-btn" onClick={() => setIsEditing(true)}>✏️ Chỉnh sửa</button>
                <button className="primary-btn" onClick={() => setShowForm(!showForm)}>
                  {showForm ? "✖ Đóng đổi mật khẩu" : "🔒 Đổi mật khẩu"}
                </button>
                <button className="primary-btn" onClick={() => setShowUpload(!showUpload)}>
                  📷 {showUpload ? "Đóng" : "Tải ảnh thẻ SV"}
                </button>
              </div>
            </>
          )}

          {showForm && (
            <form className="password-form" onSubmit={handleChangePassword}>
              <h3>🔑 Đổi mật khẩu</h3>
              {message && <p className={message.includes("✅") ? "message" : "error"}>{message}</p>}
              <input type="password" placeholder="Mật khẩu hiện tại" value={oldPassword} onChange={e => setOldPassword(e.target.value)} />
              <input type="password" placeholder="Mật khẩu mới" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
              <input type="password" placeholder="Xác nhận mật khẩu mới" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
              <button type="submit" className="primary-btn">✅ Xác nhận</button>
            </form>
          )}

          {showUpload && (
            <form className="upload-form" onSubmit={handleUploadStudentCard}>
              <h4>📎 Chọn ảnh thẻ sinh viên</h4>
              <input type="file" accept="image/*" onChange={e => setSelectedFile(e.target.files[0])} />
              <button type="submit" className="primary-btn">📤 Gửi ảnh</button>
              {uploadMessage && <p className={uploadMessage.includes("✅") ? "message" : "error"}>{uploadMessage}</p>}
            </form>
          )}
        </div>
      </div>

      {toast && <div className="toast-success">✅ Cập nhật thành công!</div>}
    </div>
  )
}
