import React, { useState } from 'react';
import axios from 'axios';

const CreateDriverAccount = () => {
  const [driverCccd, setDriverCccd] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/driver-accounts/', {
        driver_cccd: driverCccd,
        password: password
      });
      setMessage(response.data.message);
      setDriverCccd('');
      setPassword('');
    } catch (error: any) {
      setMessage(error.response?.data?.error || 'Đã có lỗi xảy ra');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Tạo tài khoản cho tài xế</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block">CCCD:</label>
          <input
            type="text"
            value={driverCccd}
            onChange={(e) => setDriverCccd(e.target.value)}
            className="w-full border px-3 py-2"
            required
            pattern="\d{12}"
            title="CCCD phải gồm 12 chữ số"
          />
        </div>
        <div>
          <label className="block">Mật khẩu:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border px-3 py-2"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Tạo tài khoản
        </button>
        {message && <p className="mt-4 text-sm text-green-700">{message}</p>}
      </form>
    </div>
  );
};

export default CreateDriverAccount;
