// src/pages/DriverLogin.jsx
import "./DriverLogin.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const DriverLogin = () => {
  const [cccd, setCccd] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post("http://localhost:5000/api/driver_login", {
        cccd,
        license_plate: licensePlate,
      });

      if (res.data.success) {
        navigate("/verifyface");
      } else {
        setError(res.data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Lỗi kết nối đến máy chủ");
    }
  };

  return (
    <div className="driver-login-wrapper">
      <div className="driver-login-card">
        <h2 className="driver-login-title">Đăng nhập Tài xế</h2>
        <form onSubmit={handleSubmit} className="driver-login-form">
          <div>
            <label>CCCD</label>
            <input
              type="text"
              value={cccd}
              onChange={(e) => setCccd(e.target.value)}
              required
              pattern="\d{12}"
              placeholder="Nhập 12 số CCCD"
            />
          </div>
          <div>
            <label>Biển số xe</label>
            <input
              type="text"
              value={licensePlate}
              onChange={(e) => setLicensePlate(e.target.value)}
              required
              placeholder="VD: 51B-12345"
            />
          </div>
          {error && <p className="driver-login-error">{error}</p>}
          <button type="submit">Tiếp tục</button>
        </form>
      </div>
    </div>
  );
};

export default DriverLogin;
