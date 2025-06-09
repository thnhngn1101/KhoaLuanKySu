import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface StudentCard {
  id: string;
  user_cccd: string;
  user_name?: string;
  image_url?: string;
  enroll_year?: number;
  status: string;
  note?: string;
  created_at?: string;
  reviewed_at?: string;
}

const formatDate = (iso?: string) => {
  return iso ? new Date(iso).toLocaleString('vi-VN') : '';
};

const StudentCardRequestManager: React.FC = () => {
  const [cards, setCards] = useState<StudentCard[]>([]);
  const [form, setForm] = useState<Partial<StudentCard>>({});
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchCards = async () => {
    const res = await axios.get('http://localhost:5000/api/student-card/');
    setCards(res.data);
  };

  useEffect(() => {
    fetchCards();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/student-card/${editingId}`, {
          status: form.status,
        });
      } else {
        await axios.post('http://localhost:5000/api/student-card/', form);
      }
      setForm({});
      setEditingId(null);
      fetchCards();
    } catch (err) {
      console.error('Lỗi:', err);
    }
  };

  const handleEdit = (card: StudentCard) => {
    setForm(card);
    setEditingId(card.id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Xóa yêu cầu cấp thẻ này?')) {
      await axios.delete(`http://localhost:5000/api/student-card/${id}`);
      fetchCards();
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Quản lý yêu cầu cấp thẻ sinh viên</h2>
        <button
          onClick={() => {
            setForm({});
            setEditingId(null);
          }}
          className="flex items-center bg-blue-600 text-white px-3 py-1 rounded"
        >
          <PlusIcon className="w-5 h-5 mr-1" /> Thêm yêu cầu
        </button>
      </div>

      <table className="w-full border text-sm">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2">ID</th>
            <th>CCCD</th>
            <th>Tên</th>
            <th>Trạng thái</th>
            <th>Năm vào học</th>
            <th>Ngày tạo</th>
            <th>Ngày duyệt</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {cards.map((c) => (
            <tr key={c.id} className="text-center border-t hover:bg-gray-50">
              <td>{c.id}</td>
              <td>{c.user_cccd}</td>
              <td>{c.user_name}</td>
              <td>{c.status}</td>
              <td>{c.enroll_year || ''}</td>
              <td>{formatDate(c.created_at)}</td>
              <td>{formatDate(c.reviewed_at)}</td>
              <td>
                <div className="flex justify-center gap-3">
                  <button onClick={() => handleEdit(c)} className="text-blue-600 hover:text-blue-800">
                    <PencilIcon className="w-5 h-5" />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="text-red-600 hover:text-red-800">
                    <TrashIcon className="w-5 h-5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-6 p-4 border bg-gray-50 w-full max-w-2xl mx-auto rounded">
        <h3 className="text-lg font-semibold mb-3">
          {editingId ? 'Cập nhật trạng thái yêu cầu' : 'Tạo yêu cầu mới'}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {!editingId && (
            <>
              <input
                name="user_cccd"
                placeholder="CCCD"
                value={form.user_cccd || ''}
                onChange={handleChange}
                className="border px-3 py-1 rounded"
              />
              <input
                name="image_url"
                placeholder="Link ảnh thẻ"
                value={form.image_url || ''}
                onChange={handleChange}
                className="border px-3 py-1 rounded"
              />
              <input
                name="enroll_year"
                type="number"
                placeholder="Năm vào học"
                value={form.enroll_year || ''}
                onChange={handleChange}
                className="border px-3 py-1 rounded"
              />
              <input
                name="note"
                placeholder="Ghi chú"
                value={form.note || ''}
                onChange={handleChange}
                className="border px-3 py-1 rounded"
              />
            </>
          )}

          <select
            name="status"
            value={form.status || 'pending'}
            onChange={handleChange}
            className="border px-3 py-1 rounded col-span-2"
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
              className="bg-gray-300 hover:bg-gray-400 px-4 py-1 rounded"
            >
              Hủy
            </button>
          )}
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
          >
            {editingId ? 'Cập nhật' : 'Tạo mới'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentCardRequestManager;
