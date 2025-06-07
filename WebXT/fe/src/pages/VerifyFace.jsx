import { useRef, useState, useEffect } from "react";
import "./Face.css";

export default function VerifyFace() {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [message, setMessage] = useState("");
  const [isStudent, setIsStudent] = useState(false);
  const [studentId, setStudentId] = useState("");
  const [canVerify, setCanVerify] = useState(false);
  const [loading, setLoading] = useState(false);
  const [maxSimilarity, setMaxSimilarity] = useState();

  // Lấy thông tin tài xế/xe/tuyến từ localStorage
  const driverName = localStorage.getItem("driver_name");
  const licensePlate = localStorage.getItem("bus_license_plate");
  const routeId = localStorage.getItem("bus_route_id");
  const routeName = localStorage.getItem("bus_route_name");

  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ video: true })
      .then((stream) => {
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {
        setMessage("❌ Không thể truy cập camera.");
      });

    let interval;
    if (!canVerify) {
      interval = setInterval(checkVerifyCondition, 2000);
    }
    return () => clearInterval(interval);
    // eslint-disable-next-line
  }, [canVerify]);

  const checkVerifyCondition = async () => {
    if (loading || canVerify) return;
    if (!licensePlate) {
      setMessage("❌ Không tìm thấy biển số xe. Vui lòng để tài xế đăng nhập lại.");
      return;
    }
    const canvas = canvasRef.current;
    const video = videoRef.current;
    if (!canvas || !video) return;

    // Vẽ lại toàn bộ video (khung lớn hơn)
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, 480, 340);
    const dataURL = canvas.toDataURL("image/jpeg");

    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/verify-face-web", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataURL })
      });
      const result = await res.json();

      setMaxSimilarity(result.max_similarity);

      if (result.status === "success" && result.user_cccd) {
        setCanVerify(true);

        // Gọi API trừ tiền
        const payRes = await fetch("http://localhost:8000/api/pay-bus-fare", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            user_cccd: result.user_cccd,
            license_plate: licensePlate
          })
        });
        const payResult = await payRes.json();

        // --- Check nếu là sinh viên ---
        const isStudentType = payResult.type_name && payResult.type_name.toLowerCase().includes("sinh viên");
        setIsStudent(!!isStudentType);
        setStudentId(payResult.student_id || "");

        if (payResult.success) {
          let studentText = "";
          if (isStudentType) {
            studentText = `🎓 [SINH VIÊN]\n` + (payResult.student_id ? `MSSV: ${payResult.student_id}\n` : "");
          }
          setMessage(
            `${studentText}` +
            `✅ Đã xác thực và thanh toán thành công!\n` +
            `Tên: ${result.full_name || ""}\n` +
            `Đã trừ ${payResult.deducted}đ, số dư còn lại: ${payResult.new_balance}đ`
          );

          // --- AUTO RESET cho phép xác thực tiếp người mới ---
          setTimeout(() => {
            setCanVerify(false);
            setMessage("");
            setMaxSimilarity(undefined);
            setStudentId("");
            setIsStudent(false);
          }, 5000); // 5 giây tự reset
        } else {
          setMessage(payResult.error || "❌ Lỗi thanh toán.");
        }
      } else {
        if (!canVerify) {
          setMessage(result.message || "❌ Không xác thực được.");
        }
        setCanVerify(false);
      }
    } catch {
      if (!canVerify) setMessage("❌ Không kết nối được server.");
      setCanVerify(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="face-register-container">
      <h2>🔍 Xác thực khuôn mặt</h2>
      <div className="driver-info">
        <div><b>Tài xế:</b> {driverName || <span style={{ color: "red" }}>Chưa đăng nhập</span>}</div>
        <div><b>Biển số xe:</b> {licensePlate || <span style={{ color: "red" }}>Chưa có</span>}</div>
        <div><b>Tuyến:</b> {routeId && routeName ? `${routeId} - ${routeName}` : <span style={{ color: "red" }}>Chưa có</span>}</div>
      </div>
      <div className="video-wrapper">
        <video ref={videoRef} autoPlay playsInline width="480" height="340" />
        <div className="face-box" />
      </div>
      <canvas ref={canvasRef} width="480" height="340" style={{ display: "none" }} />

      {/* Hiện thông báo (nổi góc phải trên) */}
      {message && (
        <div className="message-fixed-top-right">
          <div className={
            `message-box ${isStudent && message.includes("✅") ? "student" : message.includes("✅") ? "success" : "error"}`
          }>
            {message.includes("✅") && (
              <svg height="38" width="38" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 8 }}>
                <circle cx="12" cy="12" r="11" fill="#e0fce5" />
                <polyline points="8 13 11 16 16 9" />
              </svg>
            )}
            <div>
              {message.split("\n").map((line, i) => <div key={i}>{line}</div>)}
              {message.includes("Không xác thực được") && (
                <div style={{ marginTop: 10, color: '#b52e2e', fontSize: 14 }}>
                  Hướng dẫn:<br />
                  - Đảm bảo khuôn mặt thẳng, đủ sáng.<br />
                  - Không quay nghiêng, không che mặt.<br />
                  - Đăng ký lại nếu thất bại nhiều lần.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
