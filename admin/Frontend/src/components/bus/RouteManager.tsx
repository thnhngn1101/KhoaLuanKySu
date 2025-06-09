import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';

interface TicketPrice {
  id: string;
  ticket_type: string;
  price: number;
}

interface RouteDetail {
  departure_description?: string;
  arrival_description?: string;
  operator?: string;
  route_type?: string;
  distance_km?: string;
  vehicle_type?: string;
  service_hours?: string;
  trip_count?: string;
  trip_duration?: string;
  trip_interval?: string;
}

interface Route {
  id: string;
  route_name: string;
  detail: RouteDetail;
  prices: TicketPrice[];
}

const RouteManager: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [form, setForm] = useState<Partial<Route>>({ detail: {}, prices: [] });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchRoutes = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/bus-routes/');
      setRoutes(res.data);
    } catch (err) {
      console.error('Lỗi tải dữ liệu:', err);
    }
  };

  useEffect(() => {
    fetchRoutes();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (name.startsWith('detail.')) {
      setForm({
        ...form,
        detail: {
          ...form.detail,
          [name.split('.')[1]]: value,
        },
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handlePriceChange = (
    index: number,
    key: keyof TicketPrice,
    value: string
  ) => {
    const updated = [...(form.prices || [])];
    updated[index] = {
      ...updated[index],
      [key]: key === 'price' ? Number(value) : value,
    };
    setForm({ ...form, prices: updated });
  };

  const addPrice = () => {
    setForm({
      ...form,
      prices: [...(form.prices || []), { id: '', ticket_type: '', price: 0 }],
    });
  };

  const removePrice = (index: number) => {
    const updated = [...(form.prices || [])];
    updated.splice(index, 1);
    setForm({ ...form, prices: updated });
  };

  const handleSubmit = async () => {
    try {
      if (editingId) {
        await axios.put(`http://localhost:5000/api/bus-routes/${editingId}`, form);
      } else {
        await axios.post('http://localhost:5000/api/bus-routes/', form);
      }
      setForm({ detail: {}, prices: [] });
      setEditingId(null);
      fetchRoutes();
    } catch (err) {
      console.error('Lỗi gửi dữ liệu:', err);
    }
  };

  const handleEdit = (route: Route) => {
    setForm(route);
    setEditingId(route.id);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Xóa tuyến xe buýt này?')) {
      try {
        await axios.delete(`http://localhost:5000/api/bus-routes/${id}`);
        fetchRoutes();
      } catch (err) {
        console.error('Lỗi xóa:', err);
      }
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Quản lý tuyến xe buýt</h2>
        <button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          onClick={() => {
            setForm({ detail: {}, prices: [] });
            setEditingId(null);
          }}
        >
          <PlusIcon className="w-5 h-5" /> Thêm tuyến mới
        </button>
      </div>

      <table className="w-full text-left border-collapse border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="border border-gray-300 p-2">Mã tuyến</th>
            <th className="border border-gray-300 p-2">Tên tuyến</th>
            <th className="border border-gray-300 p-2">Đơn vị vận hành</th>
            <th className="border border-gray-300 p-2">Loại hình</th>
            <th className="border border-gray-300 p-2">Giá vé</th>
            <th className="border border-gray-300 p-2 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {routes.map((r) => (
            <tr
              key={r.id}
              className="hover:bg-gray-50 border border-gray-300"
            >
              <td className="border border-gray-300 p-2">{r.id}</td>
              <td className="border border-gray-300 p-2">{r.route_name}</td>
              <td className="border border-gray-300 p-2">
                {r.detail?.operator || '-'}
              </td>
              <td className="border border-gray-300 p-2">
                {r.detail?.route_type || '-'}
              </td>
              <td className="border border-gray-300 p-2">
                {r.prices?.map((p) => (
                  <div key={p.id}>
                    {p.ticket_type}: {p.price.toLocaleString('vi-VN')}₫
                  </div>
                )) || '-'}
              </td>
              <td className="border border-gray-300 p-2 text-center space-x-2">
                <button
                  onClick={() => handleEdit(r)}
                  className="text-blue-600 hover:text-blue-800"
                  title="Sửa tuyến"
                >
                  <PencilIcon className="w-5 h-5 inline" />
                </button>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-red-600 hover:text-red-800"
                  title="Xóa tuyến"
                >
                  <TrashIcon className="w-5 h-5 inline" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-8 max-w-3xl bg-gray-50 p-6 rounded shadow">
        <h3 className="text-xl font-semibold mb-4">
          {editingId ? 'Cập nhật tuyến xe buýt' : 'Thêm tuyến xe buýt mới'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          <input
            name="id"
            placeholder="Mã tuyến"
            value={form.id || ''}
            onChange={handleChange}
            disabled={!!editingId}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            name="route_name"
            placeholder="Tên tuyến"
            value={form.route_name || ''}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            name="detail.departure_description"
            placeholder="Mô tả đi"
            value={form.detail?.departure_description || ''}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 col-span-2"
          />
          <input
            name="detail.arrival_description"
            placeholder="Mô tả về"
            value={form.detail?.arrival_description || ''}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2 col-span-2"
          />
          <input
            name="detail.operator"
            placeholder="Đơn vị vận hành"
            value={form.detail?.operator || ''}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            name="detail.route_type"
            placeholder="Loại hình"
            value={form.detail?.route_type || ''}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            name="detail.distance_km"
            placeholder="Cự ly (km)"
            value={form.detail?.distance_km || ''}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            name="detail.vehicle_type"
            placeholder="Loại xe"
            value={form.detail?.vehicle_type || ''}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            name="detail.service_hours"
            placeholder="Giờ hoạt động"
            value={form.detail?.service_hours || ''}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            name="detail.trip_count"
            placeholder="Số chuyến/ngày"
            value={form.detail?.trip_count || ''}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            name="detail.trip_duration"
            placeholder="Thời gian chuyến"
            value={form.detail?.trip_duration || ''}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
          <input
            name="detail.trip_interval"
            placeholder="Giãn cách"
            value={form.detail?.trip_interval || ''}
            onChange={handleChange}
            className="border border-gray-300 rounded px-3 py-2"
          />
        </div>

        <div>
          <h4 className="font-semibold mb-2">Giá vé</h4>
          {(form.prices || []).map((price, idx) => (
            <div key={idx} className="flex gap-2 mb-2 items-center">
              <input
                type="text"
                placeholder="Loại vé"
                value={price.ticket_type}
                onChange={(e) => handlePriceChange(idx, 'ticket_type', e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 flex-1"
              />
              <input
                type="number"
                placeholder="Giá vé"
                value={price.price}
                onChange={(e) => handlePriceChange(idx, 'price', e.target.value)}
                className="border border-gray-300 rounded px-3 py-1 w-24"
              />
              <button
                onClick={() => removePrice(idx)}
                className="text-red-600 hover:text-red-800"
                title="Xóa giá vé"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            </div>
          ))}
          <button
            onClick={addPrice}
            className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
          >
            <PlusIcon className="w-5 h-5" /> Thêm loại vé
          </button>
        </div>

        <div className="mt-6">
          <button
            onClick={handleSubmit}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded mr-4"
          >
            {editingId ? 'Cập nhật' : 'Thêm mới'}
          </button>
          {editingId && (
            <button
              onClick={() => {
                setForm({ detail: {}, prices: [] });
                setEditingId(null);
              }}
              className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
            >
              Hủy
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default RouteManager;
