import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface User {
  cccd: string;
  full_name: string;
  email?: string;
  phone_number?: string;
  passenger_type_id?: string;
  province_code?: string;
  student_id?: string;
  student_enroll_year?: number;
  gender?: string;
  birth_year?: number;
  age?: number;
  created_at?: string;
}

const UserManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [form, setForm] = useState<Partial<User>>({});
  const [editingCccd, setEditingCccd] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/users/');
      setUsers(res.data);
    } catch (err) {
      console.error('Lỗi khi load dữ liệu người dùng:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editingCccd) {
        await axios.put(`http://localhost:5000/api/users/${editingCccd}`, form);
      } else {
        await axios.post(`http://localhost:5000/api/users/`, form);
      }
      setForm({});
      setEditingCccd(null);
      fetchUsers();
    } catch (err) {
      console.error('Lỗi khi gửi dữ liệu:', err);
    }
  };

  const handleEdit = (user: User) => {
    setForm(user);
    setEditingCccd(user.cccd);
  };

  const handleDelete = async (cccd: string) => {
    if (window.confirm('Bạn có chắc muốn xóa người dùng này?')) {
      try {
        await axios.delete(`http://localhost:5000/api/users/${cccd}`);
        fetchUsers();
      } catch (err) {
        console.error('Lỗi khi xóa người dùng:', err);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Quản lý Người dùng</h2>
        <button
          onClick={() => {
            setForm({});
            setEditingCccd(null);
          }}
          className="flex items-center bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
        >
          <PlusIcon className="w-5 h-5 mr-1" /> Thêm người dùng
        </button>
      </div>

      <table className="w-full border rounded-lg overflow-x-auto text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">CCCD</th>
            <th>Họ tên</th>
            <th>Email</th>
            <th>SĐT</th>
            <th>Loại hành khách</th>
            <th>Mã tỉnh</th>
            <th>Mã SV</th>
            <th>Năm nhập học</th>
            <th>Giới tính</th>
            <th>Năm sinh</th>
            <th>Tuổi</th>
            <th className="text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.cccd} className="text-center border-t hover:bg-gray-50">
              <td>{u.cccd}</td>
              <td>{u.full_name}</td>
              <td>{u.email}</td>
              <td>{u.phone_number}</td>
              <td>{u.passenger_type_id}</td>
              <td>{u.province_code}</td>
              <td>{u.student_id}</td>
              <td>{u.student_enroll_year}</td>
              <td>{u.gender}</td>
              <td>{u.birth_year}</td>
              <td>{u.age}</td>
              <td>
                <div className="flex justify-center gap-3">
                  <button onClick={() => handleEdit(u)} className="text-blue-600 hover:text-blue-800">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(u.cccd)} className="text-red-600 hover:text-red-800">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 p-4 border rounded-lg bg-gray-50 w-full max-w-4xl mx-auto">
        <h3 className="text-lg font-semibold mb-3">{editingCccd ? 'Cập nhật Người dùng' : 'Thêm Người dùng mới'}</h3>
        <div className="grid grid-cols-2 gap-4">
          {!editingCccd && (
            <input
              name="cccd"
              placeholder="CCCD"
              value={form.cccd || ''}
              onChange={handleChange}
              className="border px-3 py-1 rounded"
            />
          )}
          <input name="full_name" placeholder="Họ tên" value={form.full_name || ''} onChange={handleChange} className="border px-3 py-1 rounded" />
          <input name="email" placeholder="Email" value={form.email || ''} onChange={handleChange} className="border px-3 py-1 rounded" />
          <input name="phone_number" placeholder="SĐT" value={form.phone_number || ''} onChange={handleChange} className="border px-3 py-1 rounded" />
          <input name="passenger_type_id" placeholder="Loại hành khách" value={form.passenger_type_id || ''} onChange={handleChange} className="border px-3 py-1 rounded" />
          <input name="province_code" placeholder="Mã tỉnh" value={form.province_code || ''} onChange={handleChange} className="border px-3 py-1 rounded" />
          <input name="student_id" placeholder="Mã sinh viên" value={form.student_id || ''} onChange={handleChange} className="border px-3 py-1 rounded" />
          <input name="student_enroll_year" placeholder="Năm nhập học" type="number" value={form.student_enroll_year || ''} onChange={handleChange} className="border px-3 py-1 rounded" />
          <input name="gender" placeholder="Giới tính" value={form.gender || ''} onChange={handleChange} className="border px-3 py-1 rounded" />
          <input name="birth_year" placeholder="Năm sinh" type="number" value={form.birth_year || ''} onChange={handleChange} className="border px-3 py-1 rounded" />
        </div>
        <div className="flex justify-end mt-4 gap-3">
          {editingCccd && (
            <button
              onClick={() => {
                setForm({});
                setEditingCccd(null);
              }}
              className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-1 rounded"
            >
              Hủy
            </button>
          )}
          <button
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
          >
            {editingCccd ? 'Cập nhật' : 'Thêm mới'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserManager;
