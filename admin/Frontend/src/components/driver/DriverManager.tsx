import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Driver {
  cccd: string;
  full_name: string;
  phone_number: string;
  gender: string;
  birth_year: number;
  age: number;
}

const DriverManager: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [form, setForm] = useState<Partial<Driver>>({});
  const [editingCccd, setEditingCccd] = useState<string | null>(null);

  const fetchDrivers = async () => {
    const res = await axios.get('http://localhost:5000/api/drivers/');
    setDrivers(res.data);
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.full_name || !form.phone_number || !form.gender || !form.birth_year) {
      alert("Vui lòng nhập đầy đủ thông tin.");
      return;
    }

    try {
      if (editingCccd) {
        await axios.put(`http://localhost:5000/api/drivers/${editingCccd}`, form);
      } else {
        await axios.post(`http://localhost:5000/api/drivers/`, form);
      }

      setForm({});
      setEditingCccd(null);
      fetchDrivers();
    } catch (error) {
      alert('Đã xảy ra lỗi!');
    }
  };

  const handleEdit = (driver: Driver) => {
    setForm(driver);
    setEditingCccd(driver.cccd);
  };

  const handleDelete = async (cccd: string) => {
    if (window.confirm('Bạn có chắc muốn xóa tài xế này?')) {
      await axios.delete(`http://localhost:5000/api/drivers/${cccd}`);
      fetchDrivers();
    }
  };

  const handleCancel = () => {
    setForm({});
    setEditingCccd(null);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Quản lý Tài xế</h2>

      <table className="w-full border rounded-lg overflow-hidden text-sm mb-6">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">CCCD</th>
            <th>Họ tên</th>
            <th>SĐT</th>
            <th>Giới tính</th>
            <th>Năm sinh</th>
            <th>Tuổi</th>
            <th className="text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((d) => (
            <tr key={d.cccd} className="text-center border-t hover:bg-gray-50">
              <td>{d.cccd}</td>
              <td>{d.full_name}</td>
              <td>{d.phone_number}</td>
              <td>{d.gender}</td>
              <td>{d.birth_year}</td>
              <td>{d.age}</td>
              <td>
                <div className="flex justify-center gap-3">
                  <button onClick={() => handleEdit(d)} className="text-blue-600 hover:text-blue-800">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(d.cccd)} className="text-red-600 hover:text-red-800">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t pt-4">
        <h3 className="text-xl font-semibold mb-4">{editingCccd ? 'Cập nhật' : 'Thêm mới'} Tài xế</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
          {!editingCccd && (
            <input
              name="cccd"
              placeholder="CCCD"
              value={form.cccd || ''}
              onChange={handleChange}
              className="border px-3 py-2 rounded"
            />
          )}
          <input
            name="full_name"
            placeholder="Họ tên"
            value={form.full_name || ''}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
          />
          <input
            name="phone_number"
            placeholder="SĐT"
            value={form.phone_number || ''}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
          />
          <input
            name="gender"
            placeholder="Giới tính"
            value={form.gender || ''}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
          />
          <input
            name="birth_year"
            type="number"
            placeholder="Năm sinh"
            value={form.birth_year || ''}
            onChange={handleChange}
            className="border px-3 py-2 rounded"
          />
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            {editingCccd ? 'Cập nhật' : 'Thêm'}
          </button>
          {editingCccd && (
            <button
              onClick={handleCancel}
              className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400"
            >
              Hủy
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverManager;
