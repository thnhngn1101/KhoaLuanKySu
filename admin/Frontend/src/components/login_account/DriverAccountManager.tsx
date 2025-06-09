import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PencilIcon, TrashIcon, PlusIcon, PowerIcon } from '@heroicons/react/24/outline';

interface Driver {
  id: string;
  name: string;
  email?: string;
  active: boolean;
}

const DriverAccountManager: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [form, setForm] = useState<Partial<Driver>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchDrivers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/drivers');
      setDrivers(res.data);
    } catch (err) {
      console.error('Lỗi khi load danh sách tài xế:', err);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/drivers/${editingId}`, form);
      } else {
        await axios.post(`http://localhost:5000/api/drivers`, form);
      }
      setForm({});
      setEditingId(null);
      fetchDrivers();
    } catch (err) {
      console.error('Lỗi khi gửi dữ liệu tài xế:', err);
    }
  };

  const handleEdit = (driver: Driver) => {
    setForm(driver);
    setEditingId(driver.id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa tài xế này?')) {
      try {
        await axios.delete(`http://localhost:5000/api/drivers/${id}`);
        fetchDrivers();
      } catch (err) {
        console.error('Lỗi khi xóa tài xế:', err);
      }
    }
  };

  const toggleActive = async (id: string) => {
    try {
      await axios.post(`http://localhost:5000/api/drivers/toggle-active/${id}`);
      fetchDrivers();
    } catch (err) {
      console.error('Lỗi khi bật/tắt tài khoản tài xế:', err);
    }
  };

  const resetPassword = async (id: string) => {
    if (window.confirm('Reset mật khẩu tài xế này? Mật khẩu mới sẽ được gửi qua email (giả lập).')) {
      try {
        const res = await axios.post(`http://localhost:5000/api/drivers/reset-password/${id}`);
        alert(`Mật khẩu mới: ${res.data.new_password}`);
      } catch (err) {
        console.error('Lỗi khi reset mật khẩu tài xế:', err);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Quản lý Tài xế</h2>
        <button
          onClick={() => {
            setForm({});
            setEditingId(null);
          }}
          className="flex items-center bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          <PlusIcon className="w-5 h-5 mr-1" /> Thêm tài xế
        </button>
      </div>

      <table className="w-full border rounded-lg overflow-x-auto text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">ID</th>
            <th>Tên tài xế</th>
            <th>Email</th>
            <th>Trạng thái</th>
            <th className="text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((d) => (
            <tr key={d.id} className="text-center border-t hover:bg-gray-50">
              <td>{d.id}</td>
              <td>{d.name}</td>
              <td>{d.email}</td>
              <td>{d.active ? 'Đang hoạt động' : 'Đã khóa'}</td>
              <td>
                <div className="flex justify-center gap-3">
                  <button onClick={() => handleEdit(d)} className="text-blue-600 hover:text-blue-800">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:text-red-800">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => toggleActive(d.id)}
                    className={`text-yellow-600 hover:text-yellow-800`}
                    title={d.active ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                  >
                    <PowerIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => resetPassword(d.id)}
                    className="text-green-600 hover:text-green-800"
                    title="Reset mật khẩu"
                  >
                    🔑
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 p-4 border rounded-lg bg-gray-50 w-full max-w-3xl mx-auto">
        <h3 className="text-lg font-semibold mb-3">{editingId ? 'Cập nhật tài xế' : 'Thêm tài xế mới'}</h3>
        <div className="grid grid-cols-2 gap-4">
          {!editingId && (
            <input
              name="id"
              placeholder="ID tài xế"
              value={form.id || ''}
              onChange={handleChange}
              className="border px-3 py-1 rounded"
            />
          )}
          <input
            name="name"
            placeholder="Tên tài xế"
            value={form.name || ''}
            onChange={handleChange}
            className="border px-3 py-1 rounded"
          />
          <input
            name="email"
            placeholder="Email"
            value={form.email || ''}
            onChange={handleChange}
            className="border px-3 py-1 rounded"
          />
        </div>
        <div className="flex justify-end mt-4 gap-3">
          {editingId && (
            <button
              onClick={() => {
                setForm({});
                setEditingId(null);
              }}
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-1 rounded"
            >
              Hủy
            </button>
          )}
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
          >
            {editingId ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DriverAccountManager;
