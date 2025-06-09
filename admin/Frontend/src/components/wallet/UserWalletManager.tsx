import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Wallet {
  id: string;
  user_cccd: string;
  user_name?: string;
  amount: number;
  status: string;
  created_at?: string;
  approved_at?: string;
}

const formatDate = (iso: string | undefined) => {
  if (!iso) return '';
  return new Date(iso).toLocaleString('vi-VN');
};

const UserWalletManager: React.FC = () => {
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [form, setForm] = useState<Partial<Wallet>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchWallets = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/topup/');
      setWallets(res.data);
    } catch (err) {
      console.error('Lỗi khi load dữ liệu ví:', err);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/topup/${editingId}`, {
          status: form.status,
        });
      } else {
        await axios.post(`http://localhost:5000/api/topup/`, form);
      }
      setForm({});
      setEditingId(null);
      fetchWallets();
    } catch (err) {
      console.error('Lỗi khi gửi dữ liệu:', err);
    }
  };

  const handleEdit = (wallet: Wallet) => {
    setForm(wallet);
    setEditingId(wallet.id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa ví này?')) {
      try {
        await axios.delete(`http://localhost:5000/api/topup/${id}`);
        fetchWallets();
      } catch (err) {
        console.error('Lỗi khi xóa ví:', err);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Quản lý ví người dùng</h2>
        <button
          onClick={() => {
            setForm({});
            setEditingId(null);
          }}
          className="flex items-center bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          <PlusIcon className="w-5 h-5 mr-1" /> Thêm ví
        </button>
      </div>

      <table className="w-full border rounded-lg overflow-x-auto text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">ID</th>
            <th>CCCD</th>
            <th>Số dư</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th className="text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {wallets.map((w) => (
            <tr key={w.id} className="text-center border-t hover:bg-gray-50">
              <td>{w.id}</td>
              <td>{w.user_cccd}</td>
              <td>{w.amount}</td>
              <td>{w.status}</td>
              <td>{formatDate(w.created_at)}</td>
              <td>
                <div className="flex justify-center gap-3">
                  <button onClick={() => handleEdit(w)} className="text-blue-600 hover:text-blue-800">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(w.id)} className="text-red-600 hover:text-red-800">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 p-4 border rounded-lg bg-gray-50 w-full max-w-3xl mx-auto">
        <h3 className="text-lg font-semibold mb-3">{editingId ? 'Cập nhật Ví' : 'Thêm Ví mới'}</h3>
        <div className="grid grid-cols-2 gap-4">
          {!editingId && (
            <input
              name="user_cccd"
              placeholder="CCCD"
              value={form.user_cccd || ''}
              onChange={handleChange}
              className="border px-3 py-1 rounded"
            />
          )}
          <input
            name="amount"
            type="number"
            placeholder="Số dư"
            value={form.amount || ''}
            onChange={handleChange}
            className="border px-3 py-1 rounded"
          />
          <select
            name="status"
            value={form.status || 'pending'}
            onChange={handleChange}
            className="border px-3 py-1 rounded"
          >
            <option value="pending">Đang chờ</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Từ chối</option>
          </select>
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

export default UserWalletManager;
